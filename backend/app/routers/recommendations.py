from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.recommendation import RecommendationRequest, RecommendationResult
from app.services.recommendation import build_recommendations

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])


@router.post("", response_model=list[RecommendationResult])
def recommend(payload: RecommendationRequest, db: Session = Depends(get_db)):
    return build_recommendations(
        db=db,
        scope_location_id=payload.scope_location_id,
        vibes=payload.vibes,
        traveler_type=payload.traveler_type,
        budget=payload.budget,
    )
