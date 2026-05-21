from datetime import datetime
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import JSON

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    vibe_points: Mapped[int] = mapped_column(Integer, default=0)
    trust_level: Mapped[int] = mapped_column(Integer, default=1)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    travel_profile = relationship("TravelProfile", back_populates="user", uselist=False)


class TravelProfile(Base):
    __tablename__ = "travel_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)
    traveler_type: Mapped[str] = mapped_column(String(50), default="solo")
    preferred_vibes: Mapped[list] = mapped_column(JSON, default=list)
    preferred_budget: Mapped[str] = mapped_column(String(20), default="medium")
    interests: Mapped[list] = mapped_column(JSON, default=list)

    user = relationship("User", back_populates="travel_profile")


class Location(Base):
    __tablename__ = "locations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), index=True)
    type: Mapped[str] = mapped_column(String(20), index=True)
    parent_id: Mapped[int | None] = mapped_column(ForeignKey("locations.id"), nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    country_code: Mapped[str | None] = mapped_column(String(2), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    parent = relationship("Location", remote_side=[id], back_populates="children")
    children = relationship("Location", back_populates="parent")
    vibe_profile = relationship("LocationVibeProfile", back_populates="location", uselist=False)


class LocationVibeProfile(Base):
    __tablename__ = "location_vibe_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    location_id: Mapped[int] = mapped_column(ForeignKey("locations.id"), unique=True)
    social_score: Mapped[float] = mapped_column(Float, default=0)
    party_score: Mapped[float] = mapped_column(Float, default=0)
    nature_score: Mapped[float] = mapped_column(Float, default=0)
    beach_score: Mapped[float] = mapped_column(Float, default=0)
    surf_score: Mapped[float] = mapped_column(Float, default=0)
    safety_score: Mapped[float] = mapped_column(Float, default=0)
    budget_score: Mapped[float] = mapped_column(Float, default=0)
    digital_nomad_score: Mapped[float] = mapped_column(Float, default=0)
    food_score: Mapped[float] = mapped_column(Float, default=0)
    culture_score: Mapped[float] = mapped_column(Float, default=0)
    hidden_gem_score: Mapped[float] = mapped_column(Float, default=0)
    luxury_score: Mapped[float] = mapped_column(Float, default=0)
    best_season: Mapped[str | None] = mapped_column(String(50), nullable=True)
    average_budget_level: Mapped[str | None] = mapped_column(String(20), nullable=True)
    ai_summary: Mapped[str | None] = mapped_column(Text, nullable=True)

    location = relationship("Location", back_populates="vibe_profile")


class Place(Base):
    __tablename__ = "places"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    location_id: Mapped[int] = mapped_column(ForeignKey("locations.id"), index=True)
    name: Mapped[str] = mapped_column(String(255), index=True)
    type: Mapped[str] = mapped_column(String(50), index=True)
    address: Mapped[str | None] = mapped_column(String(255), nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    google_place_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    booking_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    hostelworld_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    agoda_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    price_level: Mapped[str | None] = mapped_column(String(20), nullable=True)
    main_photo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    external_links: Mapped[dict] = mapped_column(JSON, default=dict)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    vibe_score = relationship("PlaceVibeScore", back_populates="place", uselist=False)


class ExternalRating(Base):
    __tablename__ = "external_ratings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    place_id: Mapped[int] = mapped_column(ForeignKey("places.id"), index=True)
    source: Mapped[str] = mapped_column(String(50))
    external_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    rating: Mapped[float] = mapped_column(Float, default=0)
    review_count: Mapped[int] = mapped_column(Integer, default=0)
    rating_breakdown: Mapped[dict] = mapped_column(JSON, default=dict)
    last_synced_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class PlaceVibeScore(Base):
    __tablename__ = "place_vibe_scores"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    place_id: Mapped[int] = mapped_column(ForeignKey("places.id"), unique=True)
    social_score: Mapped[float] = mapped_column(Float, default=0)
    party_score: Mapped[float] = mapped_column(Float, default=0)
    cleanliness_score: Mapped[float] = mapped_column(Float, default=0)
    safety_score: Mapped[float] = mapped_column(Float, default=0)
    sleep_score: Mapped[float] = mapped_column(Float, default=0)
    value_score: Mapped[float] = mapped_column(Float, default=0)
    solo_friendly_score: Mapped[float] = mapped_column(Float, default=0)
    digital_nomad_score: Mapped[float] = mapped_column(Float, default=0)
    surf_score: Mapped[float] = mapped_column(Float, default=0)
    nature_score: Mapped[float] = mapped_column(Float, default=0)
    food_score: Mapped[float] = mapped_column(Float, default=0)
    review_count: Mapped[int] = mapped_column(Integer, default=0)
    last_updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    place = relationship("Place", back_populates="vibe_score")


class Experience(Base):
    __tablename__ = "experiences"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    place_id: Mapped[int | None] = mapped_column(ForeignKey("places.id"), nullable=True)
    location_id: Mapped[int] = mapped_column(ForeignKey("locations.id"), index=True)
    experience_type: Mapped[str] = mapped_column(String(50))
    visited_month: Mapped[int] = mapped_column(Integer)
    visited_year: Mapped[int] = mapped_column(Integer)
    social_score: Mapped[float] = mapped_column(Float, default=0)
    party_score: Mapped[float] = mapped_column(Float, default=0)
    safety_score: Mapped[float] = mapped_column(Float, default=0)
    cleanliness_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    sleep_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    value_score: Mapped[float] = mapped_column(Float, default=0)
    authenticity_score: Mapped[float] = mapped_column(Float, default=0)
    fun_score: Mapped[float] = mapped_column(Float, default=0)
    crowd_level: Mapped[int] = mapped_column(Integer, default=3)
    tags: Mapped[list] = mapped_column(JSON, default=list)
    short_tip: Mapped[str] = mapped_column(String(500))
    would_recommend: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class AISummary(Base):
    __tablename__ = "ai_summaries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    target_type: Mapped[str] = mapped_column(String(50), index=True)
    target_id: Mapped[int] = mapped_column(Integer, index=True)
    summary_text: Mapped[str] = mapped_column(Text)
    best_for: Mapped[list] = mapped_column(JSON, default=list)
    not_good_for: Mapped[list] = mapped_column(JSON, default=list)
    common_positives: Mapped[list] = mapped_column(JSON, default=list)
    common_negatives: Mapped[list] = mapped_column(JSON, default=list)
    generated_from_count: Mapped[int] = mapped_column(Integer, default=0)
    generated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class SavedItem(Base):
    __tablename__ = "saved_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    item_type: Mapped[str] = mapped_column(String(50))
    item_id: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class AppIdea(Base):
    __tablename__ = "app_ideas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(50))
    status: Mapped[str] = mapped_column(String(20), default="suggested")
    vote_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class AppIdeaVote(Base):
    __tablename__ = "app_idea_votes"
    __table_args__ = (UniqueConstraint("user_id", "idea_id", name="uq_user_idea_vote"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    idea_id: Mapped[int] = mapped_column(ForeignKey("app_ideas.id"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class VibePointsTransaction(Base):
    __tablename__ = "vibe_points_transactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    action_type: Mapped[str] = mapped_column(String(100))
    points: Mapped[int] = mapped_column(Integer)
    reference_type: Mapped[str] = mapped_column(String(100))
    reference_id: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
