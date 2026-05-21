from pydantic import BaseModel


class RecommendationRequest(BaseModel):
    vibes: list[str]
    scope_location_id: int
    traveler_type: str = "solo"
    budget: str = "medium"


class RecommendationPlace(BaseModel):
    id: int
    name: str
    type: str


class RecommendationResult(BaseModel):
    location_id: int
    location_name: str
    match_score: float
    why_it_matches: str
    possible_downside: str
    best_for: list[str]
    top_places: list[RecommendationPlace]
