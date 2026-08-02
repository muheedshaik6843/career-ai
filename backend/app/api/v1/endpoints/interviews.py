from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.api import deps
from app.schemas.common import APIResponse
from app.schemas.assistant import (
    InterviewStartRequest,
    InterviewAnswerRequest,
    QuestionFeedback,
    InterviewSessionResponse,
)
from app.services.interview_service import interview_service
from app.models.user import User

router = APIRouter()


@router.post("/start", response_model=APIResponse[InterviewSessionResponse], status_code=status.HTTP_201_CREATED)
def start_interview_session(
    request: InterviewStartRequest,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Start a new AI Mock Interview session."""
    session = interview_service.start_session(db, user_id=current_user.id, request=request)
    return APIResponse(
        success=True,
        message="Interview session started.",
        data=InterviewSessionResponse.model_validate(session)
    )


@router.post("/{session_id}/answer", response_model=APIResponse[QuestionFeedback])
def submit_interview_answer(
    session_id: str,
    request: InterviewAnswerRequest,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Submit candidate response to a question and receive instant AI grading & feedback."""
    feedback = interview_service.submit_answer(
        db,
        session_id=session_id,
        user_id=current_user.id,
        question_id=request.question_id,
        user_answer=request.user_answer
    )
    return APIResponse(
        success=True,
        message="Answer evaluated successfully.",
        data=feedback
    )


@router.get("/{session_id}", response_model=APIResponse[InterviewSessionResponse])
def get_interview_session(
    session_id: str,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Get full details and overall score of an interview session."""
    session = interview_service.get_session(db, session_id=session_id, user_id=current_user.id)
    return APIResponse(
        success=True,
        message="Interview session retrieved.",
        data=InterviewSessionResponse.model_validate(session)
    )


@router.get("", response_model=APIResponse[List[InterviewSessionResponse]])
def list_interview_sessions(
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """List all past mock interview sessions for current user."""
    sessions = interview_service.list_user_sessions(db, user_id=current_user.id)
    items = [InterviewSessionResponse.model_validate(s) for s in sessions]
    return APIResponse(
        success=True,
        message=f"Found {len(items)} interview session(s).",
        data=items
    )
