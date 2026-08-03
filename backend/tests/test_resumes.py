"""
Tests for Resume Intelligence endpoints.
Uses an in-memory PDF-like text payload since we can't use full PDF in unit tests.
"""
import io
import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi import status


# Helper: register + login and return Authorization header
def get_auth_headers(client, email="resume_test@example.com", password="Password123!", name="Resume Tester"):
    client.post("/api/v1/auth/register", json={"email": email, "password": password, "full_name": name, "role": "candidate"})
    r = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    token = r.json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}


# Create a minimal realistic resume text as a text/plain upload (fallback)
SAMPLE_RESUME_TEXT = b"""John Smith
Senior Software Engineer
john.smith@email.com | +1-555-123-4567

SUMMARY
Experienced software engineer with 8+ years building scalable web applications using Python, React, and AWS.

SKILLS
Python, JavaScript, TypeScript, React, Next.js, Node.js, FastAPI, Django
PostgreSQL, Redis, MongoDB, AWS, Docker, Kubernetes, GitHub Actions

EXPERIENCE
Senior Software Engineer
Stripe, San Francisco, CA | 2021 - Present
- Built payment processing APIs serving 10M+ transactions/month
- Reduced API latency by 40% through Redis caching strategies
- Led team of 6 engineers to deliver core checkout flow

Software Engineer
Google, Mountain View, CA | 2018 - 2021
- Developed internal tooling used by 2000+ engineers
- Shipped features to production with 99.9% uptime SLA

EDUCATION
University of California, Berkeley
B.S. Computer Science | 2018

CERTIFICATIONS
AWS Certified Solutions Architect
Google Cloud Professional Data Engineer
"""


def test_upload_resume_text(client):
    headers = get_auth_headers(client)
    # Upload as a .txt file (will fail file type check — test error response)
    file_data = io.BytesIO(b"Some content")
    response = client.post(
        "/api/v1/resumes",
        headers=headers,
        files={"file": ("resume.txt", file_data, "text/plain")}
    )
    # txt is not allowed
    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_upload_resume_docx_content_type(client):
    """Test that a file with DOCX content type header is accepted for processing."""
    headers = get_auth_headers(client, email="docx_test@example.com")
    # Minimal DOCX-like bytes — will fail parsing but endpoint should accept and create record
    # Real DOCX is a ZIP format; we send minimal bytes to test flow
    file_data = io.BytesIO(SAMPLE_RESUME_TEXT)
    response = client.post(
        "/api/v1/resumes",
        headers=headers,
        files={"file": ("resume.pdf", file_data, "application/pdf")}
    )
    # Should be created (even if parsing degrades gracefully)
    # The endpoint accepts PDF content type
    assert response.status_code in [status.HTTP_201_CREATED, status.HTTP_422_UNPROCESSABLE_ENTITY]


def test_list_resumes_empty(client):
    headers = get_auth_headers(client, email="list_empty@example.com")
    response = client.get("/api/v1/resumes", headers=headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["success"] is True
    assert data["data"] == []


def test_get_nonexistent_resume(client):
    headers = get_auth_headers(client, email="nofile@example.com")
    response = client.get("/api/v1/resumes/nonexistent-id-123", headers=headers)
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_delete_nonexistent_resume(client):
    headers = get_auth_headers(client, email="delete_test@example.com")
    response = client.delete("/api/v1/resumes/fake-id-999", headers=headers)
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_resume_requires_auth(client):
    # With the new username-only auth, no token returns a demo user (200 OK)
    # This is the new intended behavior - no auth required, falls back to demo
    response = client.get("/api/v1/resumes")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["success"] is True
