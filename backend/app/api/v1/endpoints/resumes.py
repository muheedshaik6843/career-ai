from fastapi import APIRouter, Depends, UploadFile, File, status, Query
from sqlalchemy.orm import Session
from typing import List

from app.api import deps
from app.schemas.common import APIResponse, PaginatedResponse
from app.schemas.resume import ResumeResponse, ResumeListItem
from app.services.resume_service import resume_service
from app.models.user import User

router = APIRouter()


@router.post("", response_model=APIResponse[ResumeResponse], status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Upload and parse a resume (PDF or DOCX). Returns parsed data and ATS score."""
    resume = await resume_service.upload_and_parse(db, user_id=current_user.id, file=file)
    return APIResponse(
        success=True,
        message="Resume uploaded and parsed successfully.",
        data=ResumeResponse.model_validate(resume)
    )


@router.get("", response_model=APIResponse[List[ResumeListItem]])
def list_resumes(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """List all resumes for the current user."""
    resumes = resume_service.get_user_resumes(db, user_id=current_user.id, skip=skip, limit=limit)
    items = [ResumeListItem.from_resume(r) for r in resumes]
    return APIResponse(
        success=True,
        message=f"Found {len(items)} resume(s).",
        data=items
    )


@router.get("/{resume_id}", response_model=APIResponse[ResumeResponse])
def get_resume(
    resume_id: str,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Get a specific resume with full parsed data and ATS score."""
    resume = resume_service.get_resume(db, resume_id=resume_id, user_id=current_user.id)
    return APIResponse(
        success=True,
        message="Resume retrieved successfully.",
        data=ResumeResponse.model_validate(resume)
    )


@router.put("/{resume_id}/set-primary", response_model=APIResponse[ResumeResponse])
def set_primary_resume(
    resume_id: str,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Set a resume as the primary/active resume."""
    resume = resume_service.set_primary(db, resume_id=resume_id, user_id=current_user.id)
    return APIResponse(
        success=True,
        message="Primary resume updated.",
        data=ResumeResponse.model_validate(resume)
    )


@router.delete("/{resume_id}", response_model=APIResponse[bool])
def delete_resume(
    resume_id: str,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Soft-delete a resume."""
    result = resume_service.delete_resume(db, resume_id=resume_id, user_id=current_user.id)
    return APIResponse(
        success=True,
        message="Resume deleted successfully.",
        data=result
    )
