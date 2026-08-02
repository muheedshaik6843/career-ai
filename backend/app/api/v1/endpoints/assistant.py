from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.schemas.common import APIResponse
from app.schemas.assistant import (
    CoverLetterRequest,
    CoverLetterResponse,
    BulletOptimizeRequest,
    BulletOptimizeResponse,
    RoadmapRequest,
    CareerRoadmapResponse,
    ChatRequest,
    ChatResponse,
)
from app.services.cover_letter_service import cover_letter_service
from app.services.resume_optimizer_service import resume_optimizer_service
from app.services.roadmap_service import roadmap_service
from app.services.chat_service import chat_service
from app.services.resume_service import resume_service
from app.models.user import User

router = APIRouter()


@router.post("/cover-letter", response_model=APIResponse[CoverLetterResponse], status_code=status.HTTP_200_OK)
def generate_cover_letter(
    request: CoverLetterRequest,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Generate tailored, high-converting AI cover letter."""
    resume = None
    if request.resume_id:
        resume = resume_service.get_resume(db, resume_id=request.resume_id, user_id=current_user.id)
    else:
        resumes = resume_service.get_user_resumes(db, user_id=current_user.id)
        if resumes:
            resume = next((r for r in resumes if r.is_primary), resumes[0])

    result = cover_letter_service.generate_cover_letter(
        job_title=request.job_title,
        company=request.company,
        job_description=request.job_description,
        tone=request.tone or "Professional",
        resume=resume
    )
    return APIResponse(
        success=True,
        message="Cover letter generated successfully.",
        data=result
    )


@router.post("/optimize-bullets", response_model=APIResponse[BulletOptimizeResponse], status_code=status.HTTP_200_OK)
def optimize_bullets(
    request: BulletOptimizeRequest,
    current_user: User = Depends(deps.get_current_user)
):
    """Optimize resume experience bullet points with action verbs and impact metrics."""
    result = resume_optimizer_service.optimize_bullet(
        bullet_point=request.bullet_point,
        target_role=request.target_role
    )
    return APIResponse(
        success=True,
        message="Bullet point optimized successfully.",
        data=result
    )


@router.post("/roadmap", response_model=APIResponse[CareerRoadmapResponse], status_code=status.HTTP_200_OK)
def generate_roadmap(
    request: RoadmapRequest,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Generate 3-6 month personalized career path roadmap."""
    resume = None
    if request.resume_id:
        resume = resume_service.get_resume(db, resume_id=request.resume_id, user_id=current_user.id)
    else:
        resumes = resume_service.get_user_resumes(db, user_id=current_user.id)
        if resumes:
            resume = next((r for r in resumes if r.is_primary), resumes[0])

    result = roadmap_service.generate_roadmap(
        target_role=request.target_role,
        current_level=request.current_level or "Intermediate",
        timeline_months=request.timeline_months or 6,
        resume=resume
    )
    return APIResponse(
        success=True,
        message="Career roadmap generated successfully.",
        data=result
    )


@router.post("/chat", response_model=APIResponse[ChatResponse], status_code=status.HTTP_200_OK)
def career_chat(
    request: ChatRequest,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Conversational AI Career Copilot for instant advice and guidance."""
    resumes = resume_service.get_user_resumes(db, user_id=current_user.id)
    resume = next((r for r in resumes if r.is_primary), resumes[0]) if resumes else None

    result = chat_service.process_message(
        message=request.message,
        target_role=request.target_role,
        context=request.context,
        resume=resume
    )
    return APIResponse(
        success=True,
        message="Chat response generated.",
        data=result
    )
