from datetime import datetime
from pydantic import BaseModel


class IdeaCreate(BaseModel):
    title: str
    description: str
    category: str


class IdeaOut(BaseModel):
    id: int
    user_id: int
    title: str
    description: str
    category: str
    status: str
    vote_count: int
    created_at: datetime

    class Config:
        from_attributes = True
