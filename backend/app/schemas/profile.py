from pydantic import BaseModel


class TravelProfileBase(BaseModel):
    traveler_type: str = "solo"
    preferred_vibes: list[str] = []
    preferred_budget: str = "medium"
    interests: list[str] = []


class TravelProfileUpdate(TravelProfileBase):
    pass


class TravelProfileResponse(TravelProfileBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
