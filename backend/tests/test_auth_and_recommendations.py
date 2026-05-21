def register_and_auth(client, email="a@example.com", password="password123"):
    response = client.post("/api/auth/register", json={"email": email, "password": password})
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_register_login_me(client):
    headers = register_and_auth(client)
    me = client.get("/api/auth/me", headers=headers)
    assert me.status_code == 200
    assert me.json()["email"] == "a@example.com"


def test_recommendations(client):
    from app.seed import run_seed

    run_seed()
    response = client.post(
        "/api/recommendations",
        json={"vibes": ["surf", "social", "budget"], "scope_location_id": 1, "traveler_type": "solo", "budget": "medium"},
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert "top_places" in data[0]
