import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi import status


def get_auth_headers(client, email="app_tracker@example.com", password="Password123!", name="Tracker User"):
    client.post("/api/v1/auth/register", json={"email": email, "password": password, "full_name": name, "role": "candidate"})
    r = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    token = r.json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_application_lifecycle(client):
    headers = get_auth_headers(client)

    # 1. List applications (empty initially)
    r_list = client.get("/api/v1/applications", headers=headers)
    assert r_list.status_code == status.HTTP_200_OK
    assert r_list.json()["data"] == []

    # 2. Create application
    payload = {
        "job_title": "Staff Frontend Architect",
        "company": "Vercel",
        "location": "Remote",
        "salary": "$180k - $210k",
        "status": "saved",
        "notes": "Met recruiter at conference."
    }
    r_create = client.post("/api/v1/applications", headers=headers, json=payload)
    assert r_create.status_code == status.HTTP_201_CREATED
    app_data = r_create.json()["data"]
    app_id = app_data["id"]
    assert app_data["job_title"] == "Staff Frontend Architect"
    assert app_data["status"] == "saved"

    # 3. Update application status to applied
    update_payload = {
        "status": "applied",
        "notes": "Submitted application via referral."
    }
    r_update = client.put(f"/api/v1/applications/{app_id}", headers=headers, json=update_payload)
    assert r_update.status_code == status.HTTP_200_OK
    updated_data = r_update.json()["data"]
    assert updated_data["status"] == "applied"
    assert updated_data["applied_date"] is not None

    # 4. Get single application
    r_get = client.get(f"/api/v1/applications/{app_id}", headers=headers)
    assert r_get.status_code == status.HTTP_200_OK
    assert r_get.json()["data"]["id"] == app_id

    # 5. Delete application
    r_del = client.delete(f"/api/v1/applications/{app_id}", headers=headers)
    assert r_del.status_code == status.HTTP_200_OK
    assert r_del.json()["data"] is True

    # 6. Verify non-existent after deletion
    r_get_after = client.get(f"/api/v1/applications/{app_id}", headers=headers)
    assert r_get_after.status_code == status.HTTP_404_NOT_FOUND
