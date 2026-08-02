from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.api import deps
from app.schemas.auth import UserRegister, UserLogin, Token, RefreshTokenRequest
from app.schemas.user import UserResponse
from app.schemas.common import APIResponse
from app.services.auth_service import auth_service

router = APIRouter()


@router.post("/register", response_model=APIResponse[UserResponse], status_code=status.HTTP_201_CREATED)
def register(
    user_in: UserRegister,
    db: Session = Depends(deps.get_db)
):
    user = auth_service.register_user(db, user_in=user_in)
    return APIResponse(
        success=True,
        message="User registered successfully.",
        data=UserResponse.model_validate(user)
    )


@router.post("/login", response_model=APIResponse[Token])
def login(
    login_in: UserLogin,
    db: Session = Depends(deps.get_db)
):
    token = auth_service.authenticate_user(db, login_data=login_in)
    return APIResponse(
        success=True,
        message="Authentication successful.",
        data=token
    )


@router.post("/login/form", response_model=Token)
def login_swagger_form(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(deps.get_db)
):
    login_data = UserLogin(email=form_data.username, password=form_data.password)
    return auth_service.authenticate_user(db, login_data=login_data)


@router.post("/refresh", response_model=APIResponse[Token])
def refresh_token(
    token_in: RefreshTokenRequest,
    db: Session = Depends(deps.get_db)
):
    token = auth_service.refresh_token(db, refresh_token=token_in.refresh_token)
    return APIResponse(
        success=True,
        message="Token refreshed successfully.",
        data=token
    )
