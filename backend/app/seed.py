from datetime import datetime

from app.database import SessionLocal
from app.models import ExternalRating, Location, LocationVibeProfile, Place, PlaceVibeScore


def upsert_location(db, name, type_, parent_id=None, country_code=None, lat=None, lng=None):
    location = db.query(Location).filter(Location.name == name, Location.type == type_).first()
    if location:
        return location
    location = Location(name=name, type=type_, parent_id=parent_id, country_code=country_code, latitude=lat, longitude=lng)
    db.add(location)
    db.flush()
    return location


def ensure_vibe(db, location_id, **scores):
    vibe = db.query(LocationVibeProfile).filter(LocationVibeProfile.location_id == location_id).first()
    if vibe:
        return vibe
    vibe = LocationVibeProfile(location_id=location_id, **scores)
    db.add(vibe)
    return vibe


def seed_places_for_town(db, town):
    templates = [
        ("Wave House", "hostel", "social, affordable stay close to hotspots"),
        ("Salt Cafe", "cafe", "great brunch and digital nomad friendly setup"),
        ("Sunset Point", "viewpoint", "classic sunset spot with local vibe"),
    ]
    for idx, (name, type_, desc) in enumerate(templates, start=1):
        place_name = f"{town.name} {name}"
        place = db.query(Place).filter(Place.name == place_name).first()
        if place:
            continue
        place = Place(
            location_id=town.id,
            name=place_name,
            type=type_,
            description=desc,
            external_links={"google": f"https://example.com/{town.name.lower().replace(' ', '-')}/{idx}"},
            price_level="medium",
        )
        db.add(place)
        db.flush()
        db.add(PlaceVibeScore(place_id=place.id, social_score=7.5, party_score=6.5, safety_score=7.0, value_score=7.5, review_count=12, last_updated_at=datetime.utcnow()))
        db.add(ExternalRating(place_id=place.id, source="google", external_id=f"g-{place.id}", rating=4.4, review_count=120, rating_breakdown={"location": 4.6, "service": 4.2}))


def run_seed():
    db = SessionLocal()
    try:
        asia = upsert_location(db, "Asia", "continent")
        europe = upsert_location(db, "Europe", "continent")
        africa = upsert_location(db, "Africa", "continent")

        sri_lanka = upsert_location(db, "Sri Lanka", "country", asia.id, "LK")
        south_coast = upsert_location(db, "South Coast", "region", sri_lanka.id, "LK")
        weligama = upsert_location(db, "Weligama", "town", south_coast.id, "LK")
        mirissa = upsert_location(db, "Mirissa", "town", south_coast.id, "LK")
        ahangama = upsert_location(db, "Ahangama", "town", south_coast.id, "LK")
        hiriketiya = upsert_location(db, "Hiriketiya", "town", south_coast.id, "LK")
        ella = upsert_location(db, "Ella", "town", sri_lanka.id, "LK")
        arugam_bay = upsert_location(db, "Arugam Bay", "town", sri_lanka.id, "LK")

        portugal = upsert_location(db, "Portugal", "country", europe.id, "PT")
        lisbon_coast = upsert_location(db, "Lisbon Coast", "region", portugal.id, "PT")
        ericeira = upsert_location(db, "Ericeira", "town", lisbon_coast.id, "PT")

        spain = upsert_location(db, "Spain", "country", europe.id, "ES")
        valencia = upsert_location(db, "Valencia", "town", spain.id, "ES")

        morocco = upsert_location(db, "Morocco", "country", africa.id, "MA")
        taghazout = upsert_location(db, "Taghazout", "town", morocco.id, "MA")

        indonesia = upsert_location(db, "Indonesia", "country", asia.id, "ID")
        bali = upsert_location(db, "Bali", "region", indonesia.id, "ID")
        canggu = upsert_location(db, "Canggu", "town", bali.id, "ID")
        uluwatu = upsert_location(db, "Uluwatu", "town", bali.id, "ID")

        thailand = upsert_location(db, "Thailand", "country", asia.id, "TH")
        chiang_mai = upsert_location(db, "Chiang Mai", "town", thailand.id, "TH")
        koh_phangan = upsert_location(db, "Koh Phangan", "town", thailand.id, "TH")

        vibes = {
            "social_score": 7.5,
            "party_score": 6.8,
            "nature_score": 7.2,
            "beach_score": 8.2,
            "surf_score": 7.0,
            "safety_score": 7.4,
            "budget_score": 7.0,
            "digital_nomad_score": 7.6,
            "food_score": 7.3,
            "culture_score": 7.1,
            "hidden_gem_score": 6.8,
            "luxury_score": 5.7,
            "best_season": "Nov-Apr",
            "average_budget_level": "medium",
            "ai_summary": "Balanced destination for surf, social, and food seekers.",
        }

        towns = [weligama, mirissa, ahangama, hiriketiya, ella, arugam_bay, ericeira, valencia, taghazout, canggu, uluwatu, chiang_mai, koh_phangan]
        for town in towns:
            ensure_vibe(db, town.id, **vibes)
            seed_places_for_town(db, town)

        db.commit()
        print("Seed data inserted/updated")
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
