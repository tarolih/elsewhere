from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Location, Place

router = APIRouter(prefix="/api", tags=["locations"])


@router.get("/locations")
def list_locations(q: str | None = Query(default=None), db: Session = Depends(get_db)):
    query = db.query(Location)
    if q:
        query = query.filter(Location.name.ilike(f"%{q}%"))
    return query.order_by(Location.type, Location.name).all()


@router.get("/places")
def list_places(q: str | None = Query(default=None), location_id: int | None = None, db: Session = Depends(get_db)):
    query = db.query(Place)
    if q:
        query = query.filter(Place.name.ilike(f"%{q}%"))
    if location_id:
        query = query.filter(Place.location_id == location_id)
    return query.order_by(Place.name).all()


@router.get("/search")
def search_all(q: str = Query(min_length=1), db: Session = Depends(get_db)):
    locations = db.query(Location).filter(Location.name.ilike(f"%{q}%")).limit(10).all()
    places = db.query(Place).filter(or_(Place.name.ilike(f"%{q}%"), Place.description.ilike(f"%{q}%"))).limit(10).all()
    return {"locations": locations, "places": places}
