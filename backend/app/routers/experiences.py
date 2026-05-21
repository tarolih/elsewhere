from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.deps import get_current_user
from app.database import get_db
from app.models import Experience, PlaceVibeScore, User, VibePointsTransaction
from app.schemas.experience import ExperienceCreate, ExperienceCreateResponse
from app.services.points import POINTS

router = APIRouter(prefix="/api/experiences", tags=["experiences"])


@router.post("", response_model=ExperienceCreateResponse)
def create_experience(payload: ExperienceCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    experience = Experience(user_id=user.id, **payload.model_dump())
    db.add(experience)
    db.flush()

    points = POINTS["submitted_experience"]
    user.vibe_points += points
    db.add(
        VibePointsTransaction(
            user_id=user.id,
            action_type="submitted_experience",
            points=points,
            reference_type="experience",
            reference_id=experience.id,
        )
    )

    if experience.place_id:
        vibe_score = db.query(PlaceVibeScore).filter(PlaceVibeScore.place_id == experience.place_id).first()
        if not vibe_score:
            vibe_score = PlaceVibeScore(place_id=experience.place_id)
            db.add(vibe_score)

        place_exps = db.query(Experience).filter(Experience.place_id == experience.place_id).all()
        vibe_score.review_count = len(place_exps)
        vibe_score.social_score = float(sum(e.social_score for e in place_exps) / max(len(place_exps), 1))
        vibe_score.party_score = float(sum(e.party_score for e in place_exps) / max(len(place_exps), 1))
        vibe_score.safety_score = float(sum(e.safety_score for e in place_exps) / max(len(place_exps), 1))
        vibe_score.value_score = float(sum(e.value_score for e in place_exps) / max(len(place_exps), 1))
        vibe_score.last_updated_at = datetime.utcnow()

    db.commit()
    return ExperienceCreateResponse(id=experience.id, points_earned=points)
