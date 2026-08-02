from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.api import deps
from app.schemas.user import UserResponse, UserUpdate, UserPasswordUpdate
from app.schemas.common import APIResponse
from app.models.user import User
from app.services.user_service import user_service

router = APIRouter()


@router.get("/me", response_model=APIResponse[UserResponse])
def get_current_user_profile(
    current_user: User = Depends(deps.get_current_user)
):
    return APIResponse(
        success=True,
        message="User profile retrieved.",
        data=UserResponse.model_validate(current_user)
    )


@router.put("/me", response_model=APIResponse[UserResponse])
def update_user_profile(
    user_in: UserUpdate,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    updated_user = user_service.update_profile(db, user=current_user, user_in=user_in)
    return APIResponse(
        success=True,
        message="User profile updated successfully.",
        data=UserResponse.model_validate(updated_user)
    )


@router.put("/me/password", response_model=APIResponse[bool])
def update_user_password(
    password_in: UserPasswordUpdate,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    result = user_service.change_password(db, user=current_user, password_in=password_in)
    return APIResponse(
        success=True,
        message="Password updated successfully.",
        data=result
    )
