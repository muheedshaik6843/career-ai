import uuid
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.interview import InterviewSession
from app.schemas.assistant import (
    InterviewStartRequest,
    InterviewQuestion,
    QuestionFeedback,
    InterviewSessionResponse,
)

QUESTION_BANK = [
    {
        "id": "q1",
        "category": "Behavioral",
        "question": "Tell me about a challenging technical decision you had to make under tight deadlines. What was the outcome?",
        "model_answer": "Use the STAR method (Situation, Task, Action, Result). State the context, explain technical trade-offs evaluated, detail your explicit action, and quantify positive impact (e.g. delivered on time with zero downtime)."
    },
    {
        "id": "q2",
        "category": "Technical",
        "question": "How do you design a RESTful API for high availability and handle rate limiting across multiple backend instances?",
        "model_answer": "Discuss stateless architecture, token bucket / leaky bucket algorithms, Redis distributed caching, API Gateway integration, and 429 Too Many Requests status handling."
    },
    {
        "id": "q3",
        "category": "System Design",
        "question": "Walk me through how you would architect a real-time notification system serving millions of concurrent active users.",
        "model_answer": "Cover WebSockets / SSE for push connection management, message queues (Kafka/RabbitMQ) for decoupled event ingestion, worker pools, and fallback channels."
    },
    {
        "id": "q4",
        "category": "Behavioral",
        "question": "Describe a scenario where you disagreed with a product or engineering decision. How did you resolve it?",
        "model_answer": "Focus on data-driven discussion, active listening, advocating for technical quality while keeping business priorities in mind, and committing to the final team decision."
    }
]


class InterviewService:

    def start_session(self, db: Session, user_id: str, request: InterviewStartRequest) -> InterviewSession:
        questions = QUESTION_BANK[:4]

        session = InterviewSession(
            user_id=user_id,
            target_role=request.target_role,
            experience_level=request.experience_level,
            difficulty=request.difficulty or "Medium",
            questions=questions,
            answers=[],
            status="in_progress"
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        return session

    def submit_answer(self, db: Session, session_id: str, user_id: str, question_id: str, user_answer: str) -> QuestionFeedback:
        session = db.query(InterviewSession).filter(
            InterviewSession.id == session_id,
            InterviewSession.user_id == user_id
        ).first()

        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interview session not found."
            )

        # Locate question in session
        questions = session.questions or []
        target_q = next((q for q in questions if q["id"] == question_id), None)
        if not target_q:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Question ID not found in this interview session."
            )

        # Grade user answer
        answer_length = len(user_answer.strip())
        if answer_length > 150:
            score = 90.0
            rating = "Excellent"
            fb = "Great answer! You provided thorough context and clear technical explanation."
            improvements = ["Quantify results with metrics where applicable."]
        elif answer_length > 50:
            score = 75.0
            rating = "Good"
            fb = "Good response. Consider expanding with more concrete examples and system trade-offs."
            improvements = ["Use the STAR method (Situation, Task, Action, Result) to structure behavioral answers."]
        else:
            score = 50.0
            rating = "Needs Improvement"
            fb = "Response was brief. Elaborate on your technical process and specific actions taken."
            improvements = ["Provide a step-by-step technical breakdown.", "Add real-world project context."]

        feedback_obj = {
            "question_id": question_id,
            "question": target_q["question"],
            "user_answer": user_answer,
            "score": score,
            "rating": rating,
            "feedback": fb,
            "key_improvements": improvements
        }

        # Update session answers
        existing_answers = session.answers or []
        # Replace if answered before, or append
        existing_answers = [a for a in existing_answers if a["question_id"] != question_id]
        existing_answers.append(feedback_obj)
        session.answers = existing_answers

        # Calculate overall score if all questions answered
        if len(existing_answers) >= len(questions):
            session.status = "completed"
            session.overall_score = round(sum(a["score"] for a in existing_answers) / len(existing_answers), 1)
            session.strengths = ["Clear architectural communication", "Strong technical problem-solving methodology"]
            session.areas_for_improvement = ["Quantify achievements with metrics", "Expand on conflict resolution details"]

        db.add(session)
        db.commit()
        db.refresh(session)

        return QuestionFeedback(**feedback_obj)

    def get_session(self, db: Session, session_id: str, user_id: str) -> InterviewSession:
        session = db.query(InterviewSession).filter(
            InterviewSession.id == session_id,
            InterviewSession.user_id == user_id
        ).first()

        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interview session not found."
            )
        return session

    def list_user_sessions(self, db: Session, user_id: str) -> List[InterviewSession]:
        return db.query(InterviewSession).filter(
            InterviewSession.user_id == user_id
        ).order_by(InterviewSession.created_at.desc()).all()


interview_service = InterviewService()
