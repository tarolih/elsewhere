def register_and_auth(client):
    response = client.post("/api/auth/register", json={"email": "user@example.com", "password": "password123"})
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_experience_adds_points(client):
    from app.seed import run_seed

    run_seed()
    headers = register_and_auth(client)
    payload = {
        "place_id": 1,
        "location_id": 4,
        "experience_type": "surf",
        "visited_month": 1,
        "visited_year": 2025,
        "social_score": 8,
        "party_score": 7,
        "safety_score": 8,
        "cleanliness_score": 7,
        "sleep_score": 7,
        "value_score": 8,
        "authenticity_score": 8,
        "fun_score": 9,
        "crowd_level": 3,
        "tags": ["sunset", "waves"],
        "short_tip": "Go early",
        "would_recommend": True,
    }
    res = client.post("/api/experiences", json=payload, headers=headers)
    assert res.status_code == 200
    assert res.json()["points_earned"] == 20
