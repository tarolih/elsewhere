# Elsewhere MVP

Elsewhere is a mobile-first AI-personalized travel recommendation app.

## Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: FastAPI + SQLAlchemy + Alembic
- Database: PostgreSQL
- Auth: JWT
- Deployment: Docker Compose

## Project structure
- `backend/app`: API, models, schemas, routers, services, auth, seed
- `frontend/src`: api, components, pages, hooks, context, types

## Environment variables
Copy `.env.example` values:
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `DATABASE_URL`
- `JWT_SECRET`
- `VITE_API_URL`

## Local setup
### Backend
```bash
cd /home/runner/work/elsewhere/elsewhere/backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Seed data
```bash
cd /home/runner/work/elsewhere/elsewhere/backend
python -m app.seed
```

### Frontend
```bash
cd /home/runner/work/elsewhere/elsewhere/frontend
npm install
npm run dev
```

## Docker
```bash
cd /home/runner/work/elsewhere/elsewhere
docker compose up --build
```

- Frontend: `http://localhost:4173`
- Backend: `http://localhost:8000`
- Postgres: `localhost:5432`

## Main API endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/profile`
- `PUT /api/profile`
- `GET /api/locations`
- `GET /api/places`
- `GET /api/search?q=`
- `POST /api/recommendations`
- `POST /api/experiences`
- `GET /api/saved`
- `POST /api/saved`
- `GET /api/ideas`
- `POST /api/ideas`
- `POST /api/ideas/{idea_id}/vote`

## MVP flow
Discover vibe + scope → get recommendations → open locations/places → save items or add experiences.
