from datetime import datetime
from pydantic import BaseModel


class SavedItemCreate(BaseModel):
    item_type: str
    item_id: int


class SavedItemOut(BaseModel):
    id: int
    user_id: int
    item_type: str
    item_id: int
    created_at: datetime

    class Config:
        from_attributes = True
