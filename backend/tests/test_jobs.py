import os
import sys
import io
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi import status


def get_auth_headers(client, email="jobs_test@example.com", password="Password123!", name="Job Tester"):
    client.post("/api/v1/auth/register", json={"email": email, "password": password, "full_name": name, "role": "candidate"})
    r = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    token = r.json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}


SAMPLE_RESUME_TEXT = b"""John Smith
john@example.com | 555-123-4567
SUMMARY
Senior Full Stack Engineer with 5+ years of experience.
SKILLS
Python, FastAPI, React, Next.js, TypeScript, PostgreSQL, Docker, AWS
EXPERIENCE
Senior Developer at Tech Corp (2020-Present)
- Developed APIs using Python and FastAPI
EDUCATION
B.S. Computer Science
"""


def test_get_job_recommendations(client):
    headers = get_auth_headers(client, email="recs_user@example.com")
    response = client.get("/api/v1/jobs/recommendations", headers=headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["success"] is True
    assert isinstance(data["data"], list)
    assert len(data["data"]) > 0


def test_analyze_job_match_without_resume(client):
    headers = get_auth_headers(client, email="no_resume_user@example.com")
    payload = {
        "title": "Full Stack Developer",
        "company": "Acme Inc",
        "description": "Looking for Python, React, and PostgreSQL developer."
    }
    response = client.post("/api/v1/jobs/analyze", headers=headers, json=payload)
    # Should fail if no resume uploaded
    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_analyze_job_match_with_resume(client):
    headers = get_auth_headers(client, email="match_user@example.com")
    
    # First upload a resume
    file_data = io.BytesIO(SAMPLE_RESUME_TEXT)
    upload_res = client.post(
        "/api/v1/resumes",
        headers=headers,
        files={"file": ("resume.pdf", file_data, "application/pdf")}
    )
    assert upload_res.status_code in [status.HTTP_201_CREATED, status.HTTP_422_UNPROCESSABLE_ENTITY]

    # Now analyze job match
    payload = {
        "title": "Senior Full Stack Engineer",
        "company": "Stripe",
        "description": "We need a Senior Engineer skilled in Python, FastAPI, React, Next.js, Docker, and PostgreSQL."
    }
    response = client.post("/api/v1/jobs/analyze", headers=headers, json=payload)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["success"] is True
    assert "data" in data
    assert "match_score" in data["data"]
    assert "breakdown" in data["data"]
    assert data["data"]["match_score"] > 0
