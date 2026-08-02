from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.api import deps
from app.schemas.common import APIResponse
from app.schemas.job import ApplicationCreate, ApplicationUpdate, ApplicationResponse
from app.services.application_service import application_service
from app.models.job import ApplicationStatus
from app.models.user import User

router = APIRouter()


@router.get("", response_model=APIResponse[List[ApplicationResponse]])
def list_applications(
    status_filter: Optional[ApplicationStatus] = Query(None, alias="status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """List all tracked job applications for current user."""
    apps = application_service.get_user_applications(
        db, user_id=current_user.id, status_filter=status_filter, skip=skip, limit=limit
    )
    items = [ApplicationResponse.from_orm_app(a) for a in apps]
    return APIResponse(
        success=True,
        message=f"Retrieved {len(items)} application(s).",
        data=items
    )


@router.post("", response_model=APIResponse[ApplicationResponse], status_code=status.HTTP_201_CREATED)
def create_application(
    app_in: ApplicationCreate,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Create a new job application entry in the tracker."""
    app_obj = application_service.create_application(db, user_id=current_user.id, app_in=app_in)
    return APIResponse(
        success=True,
        message="Job application tracked successfully.",
        data=ApplicationResponse.from_orm_app(app_obj)
    )


@router.get("/{application_id}", response_model=APIResponse[ApplicationResponse])
def get_application(
    application_id: str,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Get single application details."""
    app_obj = application_service.get_application(db, application_id=application_id, user_id=current_user.id)
    return APIResponse(
        success=True,
        message="Application retrieved successfully.",
        data=ApplicationResponse.from_orm_app(app_obj)
    )


@router.put("/{application_id}", response_model=APIResponse[ApplicationResponse])
def update_application(
    application_id: str,
    app_in: ApplicationUpdate,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Update job application details or stage status."""
    app_obj = application_service.update_application(
        db, application_id=application_id, user_id=current_user.id, app_in=app_in
    )
    return APIResponse(
        success=True,
        message="Application updated successfully.",
        data=ApplicationResponse.from_orm_app(app_obj)
    )


@router.delete("/{application_id}", response_model=APIResponse[bool])
def delete_application(
    application_id: str,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Remove a job application from tracker."""
    result = application_service.delete_application(db, application_id=application_id, user_id=current_user.id)
    return APIResponse(
        success=True,
        message="Application deleted successfully.",
        data=result
    )
