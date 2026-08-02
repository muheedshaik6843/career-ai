from fastapi import status


def test_health_check(client):
    response = client.get("/api/v1/health")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["success"] is True
    assert data["data"]["status"] == "healthy"


def test_register_user(client):
    payload = {
        "email": "candidate@example.com",
        "password": "Password123!",
        "full_name": "Test Candidate",
        "role": "candidate"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["success"] is True
    assert data["data"]["email"] == "candidate@example.com"
    assert data["data"]["full_name"] == "Test Candidate"
    assert "hashed_password" not in data["data"]


def test_register_duplicate_email(client):
    payload = {
        "email": "duplicate@example.com",
        "password": "Password123!",
        "full_name": "Duplicate User",
        "role": "candidate"
    }
    response1 = client.post("/api/v1/auth/register", json=payload)
    assert response1.status_code == status.HTTP_201_CREATED

    response2 = client.post("/api/v1/auth/register", json=payload)
    assert response2.status_code == status.HTTP_400_BAD_REQUEST


def test_login_success(client):
    # First register
    reg_payload = {
        "email": "loginuser@example.com",
        "password": "Password123!",
        "full_name": "Login User",
        "role": "candidate"
    }
    client.post("/api/v1/auth/register", json=reg_payload)

    # Login
    login_payload = {
        "email": "loginuser@example.com",
        "password": "Password123!"
    }
    response = client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["success"] is True
    assert "access_token" in data["data"]
    assert "refresh_token" in data["data"]


def test_login_invalid_password(client):
    reg_payload = {
        "email": "wrongpass@example.com",
        "password": "Password123!",
        "full_name": "Wrong Pass",
        "role": "candidate"
    }
    client.post("/api/v1/auth/register", json=reg_payload)

    login_payload = {
        "email": "wrongpass@example.com",
        "password": "WrongPassword!"
    }
    response = client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_get_current_user_profile(client):
    # Register & Login
    reg_payload = {
        "email": "profile@example.com",
        "password": "Password123!",
        "full_name": "Profile User",
        "role": "candidate"
    }
    client.post("/api/v1/auth/register", json=reg_payload)
    
    login_response = client.post("/api/v1/auth/login", json={"email": "profile@example.com", "password": "Password123!"})
    tokens = login_response.json()["data"]
    access_token = tokens["access_token"]

    # Request Me
    headers = {"Authorization": f"Bearer {access_token}"}
    me_response = client.get("/api/v1/users/me", headers=headers)
    assert me_response.status_code == status.HTTP_200_OK
    me_data = me_response.json()["data"]
    assert me_data["email"] == "profile@example.com"
    assert me_data["full_name"] == "Profile User"


def test_refresh_token_flow(client):
    reg_payload = {
        "email": "refresh@example.com",
        "password": "Password123!",
        "full_name": "Refresh User",
        "role": "candidate"
    }
    client.post("/api/v1/auth/register", json=reg_payload)
    
    login_response = client.post("/api/v1/auth/login", json={"email": "refresh@example.com", "password": "Password123!"})
    tokens = login_response.json()["data"]
    refresh_token = tokens["refresh_token"]

    refresh_response = client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert refresh_response.status_code == status.HTTP_200_OK
    new_tokens = refresh_response.json()["data"]
    assert "access_token" in new_tokens
    assert "refresh_token" in new_tokens
