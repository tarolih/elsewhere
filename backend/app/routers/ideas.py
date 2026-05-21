from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.deps import get_current_user
from app.database import get_db
from app.models import AppIdea, AppIdeaVote, User, VibePointsTransaction
from app.schemas.idea import IdeaCreate, IdeaOut
from app.services.points import POINTS

router = APIRouter(prefix="/api/ideas", tags=["ideas"])


@router.get("", response_model=list[IdeaOut])
def list_ideas(db: Session = Depends(get_db)):
    return db.query(AppIdea).order_by(AppIdea.vote_count.desc(), AppIdea.created_at.desc()).all()


@router.post("", response_model=IdeaOut)
def create_idea(payload: IdeaCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    now = datetime.utcnow()
    week_start = now - timedelta(days=now.weekday())
    week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
    existing = db.query(AppIdea).filter(AppIdea.user_id == user.id, AppIdea.created_at >= week_start).first()
    if existing:
        raise HTTPException(status_code=400, detail="Only one idea per week")

    idea = AppIdea(user_id=user.id, title=payload.title, description=payload.description, category=payload.category)
    db.add(idea)
    db.flush()

    points = POINTS["submitted_app_idea"]
    user.vibe_points += points
    db.add(
        VibePointsTransaction(
            user_id=user.id,
            action_type="submitted_app_idea",
            points=points,
            reference_type="idea",
            reference_id=idea.id,
        )
    )

    db.commit()
    db.refresh(idea)
    return idea


@router.post("/{idea_id}/vote")
def vote_idea(idea_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    idea = db.query(AppIdea).filter(AppIdea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")

    exists = db.query(AppIdeaVote).filter(AppIdeaVote.idea_id == idea_id, AppIdeaVote.user_id == user.id).first()
    if exists:
        raise HTTPException(status_code=400, detail="Already voted")

    vote = AppIdeaVote(user_id=user.id, idea_id=idea_id)
    db.add(vote)
    idea.vote_count += 1

    owner = db.query(User).filter(User.id == idea.user_id).first()
    bonus = POINTS["idea_upvoted"]
    owner.vibe_points += bonus
    db.add(
        VibePointsTransaction(
            user_id=owner.id,
            action_type="idea_upvoted",
            points=bonus,
            reference_type="idea",
            reference_id=idea.id,
        )
    )

    db.commit()
    return {"message": "Vote recorded"}
