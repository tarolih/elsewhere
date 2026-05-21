"""
Admin endpoints for data import (not exposed to regular users in production).
Protected by a simple admin API key check.
"""
import os

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Location
from app.services.places_import import import_places_for_location

router = APIRouter(prefix="/api/admin", tags=["admin"])


def require_admin(x_admin_key: str = Header(...)):
    secret = os.getenv("ADMIN_KEY", "")
    if not secret or x_admin_key != secret:
        raise HTTPException(status_code=403, detail="Forbidden")


@router.post("/import-places")
def import_places(
    location_id: int | None = None,
    _: None = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Import Google Places for one location or all locations that have coordinates.
    Requires X-Admin-Key header and GOOGLE_PLACES_API_KEY + ADMIN_KEY in env.
    """
    api_key = os.getenv("GOOGLE_PLACES_API_KEY", "")
    if not api_key:
        raise HTTPException(status_code=503, detail="GOOGLE_PLACES_API_KEY not configured")

    if location_id is not None:
        try:
            result = import_places_for_location(db, location_id, api_key)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        return result

    # Import for all locations that have coordinates
    locations = db.query(Location).filter(
        Location.latitude.isnot(None),
        Location.longitude.isnot(None),
    ).all()

    results = []
    for loc in locations:
        try:
            r = import_places_for_location(db, loc.id, api_key)
            results.append(r)
        except Exception as e:
            results.append({"location": loc.name, "error": str(e)})

    return {"total_locations": len(results), "results": results}
