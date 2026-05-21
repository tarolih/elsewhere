"""
Google Places API (New) import service.

Requires GOOGLE_PLACES_API_KEY in environment.
Fetches real places + reviews for a given location and stores vibe scores.
"""
import os
import re
from collections import defaultdict

import httpx
from sqlalchemy.orm import Session

from app.models import ExternalRating, Location, Place, PlaceVibeScore

_PLACES_BASE = "https://places.googleapis.com/v1"

# Maps Google place types → our internal type
_TYPE_MAP = {
    "lodging": "hostel",
    "hostel": "hostel",
    "restaurant": "restaurant",
    "cafe": "cafe",
    "bar": "bar",
    "night_club": "bar",
    "tourist_attraction": "attraction",
    "point_of_interest": "attraction",
    "park": "nature",
    "beach": "beach",
    "museum": "culture",
    "art_gallery": "culture",
    "spa": "wellness",
    "gym": "wellness",
    "surf_school": "surf",
}

# Maps vibe dimension → review/name keywords (lowercase)
_VIBE_KEYWORDS: dict[str, list[str]] = {
    "party": ["party", "nightlife", "club", "dj", "dancing", "rave", "nightclub", "shots", "loud"],
    "social": ["social", "meetup", "lively", "bustling", "vibrant", "crowded", "communal", "common room"],
    "nature": ["nature", "forest", "hiking", "waterfall", "scenic", "green", "trail", "mountains"],
    "beach": ["beach", "ocean", "sea", "sand", "sunset", "snorkeling"],
    "surf": ["surf", "surfing", "waves", "break", "pipeline", "board"],
    "food": ["food", "cuisine", "delicious", "tasty", "flavors", "local food", "street food", "brunch"],
    "culture": ["culture", "historic", "museum", "art", "heritage", "traditional", "ancient", "temple"],
    "digital_nomad": ["wifi", "coworking", "laptop", "work", "remote", "nomad", "fast internet", "plug"],
    "luxury": ["luxury", "boutique", "spa", "fine dining", "rooftop", "exclusive", "premium", "high-end"],
    "hidden_gem": ["hidden", "undiscovered", "local secret", "off the beaten", "quiet", "tucked away"],
    "safety": ["safe", "clean", "friendly", "welcoming", "family", "secure"],
    "value": ["cheap", "affordable", "budget", "good value", "worth", "price"],
}

_SEARCH_TYPES = [
    ["lodging", "hostel"],
    ["restaurant", "cafe"],
    ["bar", "night_club"],
    ["tourist_attraction", "museum", "art_gallery"],
    ["park", "beach"],
]

_FIELD_MASK = (
    "places.id,places.displayName,places.types,places.location,"
    "places.formattedAddress,places.priceLevel,places.rating,"
    "places.userRatingCount,places.photos"
)

_REVIEW_FIELD_MASK = "reviews,rating,userRatingCount"


def _score_text(text: str) -> dict[str, float]:
    """Return vibe keyword hit counts for a block of text."""
    t = text.lower()
    hits: dict[str, float] = defaultdict(float)
    for dimension, keywords in _VIBE_KEYWORDS.items():
        for kw in keywords:
            hits[dimension] += len(re.findall(re.escape(kw), t))
    return dict(hits)


def _map_type(google_types: list[str]) -> str:
    for gt in google_types:
        mapped = _TYPE_MAP.get(gt)
        if mapped:
            return mapped
    return "place"


def _price_level(google_price: str | None) -> str | None:
    mapping = {
        "PRICE_LEVEL_FREE": "budget",
        "PRICE_LEVEL_INEXPENSIVE": "budget",
        "PRICE_LEVEL_MODERATE": "medium",
        "PRICE_LEVEL_EXPENSIVE": "luxury",
        "PRICE_LEVEL_VERY_EXPENSIVE": "luxury",
    }
    return mapping.get(google_price or "")


def search_nearby(lat: float, lng: float, included_types: list[str], api_key: str, radius: int = 5000) -> list[dict]:
    """Call Places API Nearby Search and return raw place dicts."""
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": _FIELD_MASK,
    }
    body = {
        "includedTypes": included_types,
        "maxResultCount": 20,
        "locationRestriction": {
            "circle": {
                "center": {"latitude": lat, "longitude": lng},
                "radius": float(radius),
            }
        },
    }
    with httpx.Client(timeout=15) as client:
        resp = client.post(f"{_PLACES_BASE}/places:searchNearby", json=body, headers=headers)
        resp.raise_for_status()
        return resp.json().get("places", [])


def get_place_reviews(google_place_id: str, api_key: str) -> tuple[float, int, list[str]]:
    """
    Fetch reviews for a place. Returns (rating, review_count, review_texts).
    """
    headers = {
        "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": _REVIEW_FIELD_MASK,
    }
    with httpx.Client(timeout=15) as client:
        resp = client.get(f"{_PLACES_BASE}/places/{google_place_id}", headers=headers)
        if resp.status_code != 200:
            return 0.0, 0, []
        data = resp.json()
        rating = data.get("rating", 0.0)
        count = data.get("userRatingCount", 0)
        texts = [
            r.get("text", {}).get("text", "")
            for r in data.get("reviews", [])
            if r.get("text", {}).get("text")
        ]
        return float(rating), int(count), texts


def import_places_for_location(db: Session, location_id: int, api_key: str) -> dict:
    """
    Main entry point. For a given Location row, fetches nearby places from
    Google, stores them in the DB, fetches reviews, and computes vibe scores.
    Returns summary stats.
    """
    location = db.get(Location, location_id)
    if not location:
        raise ValueError(f"Location {location_id} not found")
    if not location.latitude or not location.longitude:
        raise ValueError(f"Location {location.name} has no coordinates")

    lat, lng = location.latitude, location.longitude
    imported = 0
    updated = 0

    for type_group in _SEARCH_TYPES:
        try:
            raw_places = search_nearby(lat, lng, type_group, api_key)
        except httpx.HTTPError:
            continue

        for rp in raw_places:
            gid = rp.get("id")
            if not gid:
                continue

            name = rp.get("displayName", {}).get("text", "Unknown")
            place_type = _map_type(rp.get("types", []))
            p_lat = rp.get("location", {}).get("latitude")
            p_lng = rp.get("location", {}).get("longitude")
            address = rp.get("formattedAddress")
            price_level = _price_level(rp.get("priceLevel"))
            g_rating = rp.get("rating", 0.0)
            g_count = rp.get("userRatingCount", 0)

            # Upsert Place
            existing = db.query(Place).filter(Place.google_place_id == gid).first()
            if existing:
                place = existing
                updated += 1
            else:
                place = Place(
                    location_id=location_id,
                    name=name,
                    type=place_type,
                    address=address,
                    latitude=p_lat,
                    longitude=p_lng,
                    google_place_id=gid,
                    price_level=price_level,
                )
                db.add(place)
                db.flush()
                imported += 1

            # Fetch reviews & compute vibe
            try:
                r_rating, r_count, review_texts = get_place_reviews(gid, api_key)
            except Exception:
                r_rating, r_count, review_texts = g_rating, g_count, []

            all_text = " ".join([name] + review_texts)
            hits = _score_text(all_text)

            def _norm(key: str) -> float:
                """Normalize raw hit count to 0-10 range."""
                raw = hits.get(key, 0.0)
                return min(round(raw * 2.5, 1), 10.0)

            # Upsert PlaceVibeScore
            vibe = db.query(PlaceVibeScore).filter(PlaceVibeScore.place_id == place.id).first()
            if not vibe:
                vibe = PlaceVibeScore(place_id=place.id)
                db.add(vibe)

            vibe.social_score = _norm("social")
            vibe.party_score = _norm("party")
            vibe.nature_score = _norm("nature")
            vibe.safety_score = _norm("safety")
            vibe.value_score = _norm("value")
            vibe.food_score = _norm("food")
            vibe.surf_score = _norm("surf")
            vibe.digital_nomad_score = _norm("digital_nomad")
            vibe.review_count = r_count

            # Upsert ExternalRating (Google source)
            ext = db.query(ExternalRating).filter(
                ExternalRating.place_id == place.id,
                ExternalRating.source == "google",
            ).first()
            if not ext:
                ext = ExternalRating(place_id=place.id, source="google")
                db.add(ext)
            ext.external_id = gid
            ext.rating = r_rating
            ext.review_count = r_count

    db.commit()
    return {"location": location.name, "imported": imported, "updated": updated}
