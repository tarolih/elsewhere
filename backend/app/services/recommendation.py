from sqlalchemy.orm import Session

from app.models import Location, LocationVibeProfile, Place

VIBE_FIELD_MAP = {
    "social": "social_score",
    "party": "party_score",
    "nature": "nature_score",
    "beach": "beach_score",
    "surf": "surf_score",
    "safe": "safety_score",
    "safety": "safety_score",
    "budget": "budget_score",
    "digital_nomad": "digital_nomad_score",
    "food": "food_score",
    "culture": "culture_score",
    "hidden_gem": "hidden_gem_score",
    "luxury": "luxury_score",
}

BUDGET_MATCH_BONUS = 0.8
TRAVELER_MATCH_BONUS = 0.5
SOLO_SAFETY_BONUS = 0.7


def collect_descendant_ids(db: Session, scope_location_id: int) -> set[int]:
    ids = {scope_location_id}
    queue = [scope_location_id]
    while queue:
        parent = queue.pop(0)
        children = db.query(Location).filter(Location.parent_id == parent).all()
        for child in children:
            if child.id not in ids:
                ids.add(child.id)
                queue.append(child.id)
    return ids


def compute_score(vibe_profile: LocationVibeProfile, vibes: list[str], traveler_type: str, budget: str) -> float:
    if not vibe_profile:
        return 0
    scores = []
    for vibe in vibes:
        field = VIBE_FIELD_MAP.get(vibe)
        if field:
            scores.append(getattr(vibe_profile, field, 0.0))
    base = sum(scores) / max(len(scores), 1)

    budget_bonus = BUDGET_MATCH_BONUS if budget == vibe_profile.average_budget_level else 0.0
    traveler_bonus = TRAVELER_MATCH_BONUS if traveler_type in {"digital_nomad", "solo"} and vibe_profile.digital_nomad_score > 6 else 0.0
    safety_bonus = SOLO_SAFETY_BONUS if traveler_type in {"solo", "girls_trip"} and vibe_profile.safety_score > 7 else 0.0
    return round(base + budget_bonus + traveler_bonus + safety_bonus, 2)


def build_recommendations(db: Session, scope_location_id: int, vibes: list[str], traveler_type: str, budget: str):
    all_ids = collect_descendant_ids(db, scope_location_id)
    towns = db.query(Location).filter(Location.id.in_(all_ids), Location.type == "town").all()
    results = []

    for town in towns:
        vibe = db.query(LocationVibeProfile).filter(LocationVibeProfile.location_id == town.id).first()
        score = compute_score(vibe, vibes, traveler_type, budget)
        if score <= 0:
            continue
        places = db.query(Place).filter(Place.location_id == town.id).limit(3).all()
        results.append(
            {
                "location_id": town.id,
                "location_name": town.name,
                "match_score": score,
                "why_it_matches": f"Matches your {', '.join(vibes)} vibe preferences.",
                "possible_downside": "Can be busy in peak season.",
                "best_for": vibes[:3],
                "top_places": [{"id": p.id, "name": p.name, "type": p.type} for p in places],
            }
        )

    return sorted(results, key=lambda r: r["match_score"], reverse=True)
