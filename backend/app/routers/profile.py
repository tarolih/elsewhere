from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.deps import get_current_user
from app.database import get_db
from app.models import TravelProfile, User
from app.schemas.profile import TravelProfileResponse, TravelProfileUpdate

router = APIRouter(prefix="/api/profile", tags=["profile"])


@router.get("", response_model=TravelProfileResponse)
def get_profile(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(TravelProfile).filter(TravelProfile.user_id == user.id).first()


@router.put("", response_model=TravelProfileResponse)
def update_profile(payload: TravelProfileUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(TravelProfile).filter(TravelProfile.user_id == user.id).first()
    profile.traveler_type = payload.traveler_type
    profile.preferred_vibes = payload.preferred_vibes
    profile.preferred_budget = payload.preferred_budget
    profile.interests = payload.interests
    db.commit()
    db.refresh(profile)
    return profile
