from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.deps import get_current_user
from app.database import get_db
from app.models import SavedItem, User, VibePointsTransaction
from app.schemas.saved import SavedItemCreate, SavedItemOut
from app.services.points import POINTS

router = APIRouter(prefix="/api/saved", tags=["saved"])


@router.get("", response_model=list[SavedItemOut])
def list_saved(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(SavedItem).filter(SavedItem.user_id == user.id).order_by(SavedItem.created_at.desc()).all()


@router.post("", response_model=SavedItemOut)
def save_item(payload: SavedItemCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    existing_count = db.query(SavedItem).filter(SavedItem.user_id == user.id).count()
    saved = SavedItem(user_id=user.id, item_type=payload.item_type, item_id=payload.item_id)
    db.add(saved)

    if existing_count == 0:
        bonus = POINTS["saved_first_item"]
        user.vibe_points += bonus
        db.add(
            VibePointsTransaction(
                user_id=user.id,
                action_type="saved_first_item",
                points=bonus,
                reference_type=payload.item_type,
                reference_id=payload.item_id,
            )
        )

    db.commit()
    db.refresh(saved)
    return saved
