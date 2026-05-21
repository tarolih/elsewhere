from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import admin, auth, experiences, ideas, locations, profile, recommendations, saved

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Elsewhere API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin.router)
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(locations.router)
app.include_router(recommendations.router)
app.include_router(experiences.router)
app.include_router(saved.router)
app.include_router(ideas.router)


@app.get("/health")
def health():
    return {"status": "ok"}
