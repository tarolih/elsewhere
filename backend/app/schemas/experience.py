from pydantic import BaseModel, Field


class ExperienceCreate(BaseModel):
    place_id: int | None = None
    location_id: int
    experience_type: str
    visited_month: int = Field(ge=1, le=12)
    visited_year: int = Field(ge=2000, le=2100)
    social_score: float = Field(ge=0, le=10)
    party_score: float = Field(ge=0, le=10)
    safety_score: float = Field(ge=0, le=10)
    cleanliness_score: float | None = Field(default=None, ge=0, le=10)
    sleep_score: float | None = Field(default=None, ge=0, le=10)
    value_score: float = Field(ge=0, le=10)
    authenticity_score: float = Field(ge=0, le=10)
    fun_score: float = Field(ge=0, le=10)
    crowd_level: int = Field(ge=1, le=5)
    tags: list[str] = []
    short_tip: str
    would_recommend: bool


class ExperienceCreateResponse(BaseModel):
    id: int
    points_earned: int
