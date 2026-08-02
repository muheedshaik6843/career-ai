import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi import status


def get_auth_headers(client, email="ai_test@example.com", password="Password123!", name="AI Tester"):
    client.post("/api/v1/auth/register", json={"email": email, "password": password, "full_name": name, "role": "candidate"})
    r = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    token = r.json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_cover_letter_generation(client):
    headers = get_auth_headers(client, email="cover_letter@example.com")
    payload = {
        "job_title": "Senior Staff Engineer",
        "company": "Stripe",
        "tone": "Enthusiastic",
        "job_description": "Building high-scale payments infrastructure using Python and React."
    }
    response = client.post("/api/v1/ai/cover-letter", headers=headers, json=payload)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["success"] is True
    assert "cover_letter" in data["data"]
    assert "Senior Staff Engineer" in data["data"]["cover_letter"]
    assert "Stripe" in data["data"]["cover_letter"]


def test_bullet_optimization(client):
    headers = get_auth_headers(client, email="bullet_opt@example.com")
    payload = {
        "bullet_point": "Worked on python backend apis and helped the team.",
        "target_role": "Backend Engineer"
    }
    response = client.post("/api/v1/ai/optimize-bullets", headers=headers, json=payload)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]["optimized_bullets"]) > 0
    assert data["data"]["impact_score"] > 80


def test_career_roadmap_generation(client):
    headers = get_auth_headers(client, email="roadmap_test@example.com")
    payload = {
        "target_role": "Lead Architect",
        "current_level": "Intermediate",
        "timeline_months": 6
    }
    response = client.post("/api/v1/ai/roadmap", headers=headers, json=payload)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]["milestones"]) == 6


def test_mock_interview_lifecycle(client):
    headers = get_auth_headers(client, email="interview_test@example.com")

    # 1. Start Session
    start_payload = {
        "target_role": "Staff Full Stack Engineer",
        "difficulty": "Hard"
    }
    r_start = client.post("/api/v1/interviews/start", headers=headers, json=start_payload)
    assert r_start.status_code == status.HTTP_201_CREATED
    sess_data = r_start.json()["data"]
    session_id = sess_data["id"]
    assert len(sess_data["questions"]) > 0

    first_q = sess_data["questions"][0]

    # 2. Submit Answer
    answer_payload = {
        "question_id": first_q["id"],
        "user_answer": "I evaluated technical trade-offs between REST and GraphQL, selected REST with Redis caching, and improved response time by 45%."
    }
    r_ans = client.post(f"/api/v1/interviews/{session_id}/answer", headers=headers, json=answer_payload)
    assert r_ans.status_code == status.HTTP_200_OK
    fb = r_ans.json()["data"]
    assert fb["score"] >= 70

    # 3. Get Session details
    r_get = client.get(f"/api/v1/interviews/{session_id}", headers=headers)
    assert r_get.status_code == status.HTTP_200_OK
    assert len(r_get.json()["data"]["answers"]) == 1

    # 4. List User Sessions
    r_list = client.get("/api/v1/interviews", headers=headers)
    assert r_list.status_code == status.HTTP_200_OK
    assert len(r_list.json()["data"]) >= 1


def test_career_chat(client):
    headers = get_auth_headers(client, email="chat_test@example.com")
    payload = {
        "message": "How do I optimize my resume ATS score?",
        "target_role": "Full Stack Engineer"
    }
    response = client.post("/api/v1/ai/chat", headers=headers, json=payload)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["success"] is True
    assert "reply" in data["data"]
    assert len(data["data"]["suggested_followups"]) > 0

