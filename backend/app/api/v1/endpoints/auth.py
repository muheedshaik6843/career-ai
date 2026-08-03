from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.api import deps
from app.schemas.auth import UserRegister, UserLogin, Token, RefreshTokenRequest, GoogleAuthRequest, GoogleCallbackRequest, GoogleTokenRequest, UsernameLogin
from app.schemas.user import UserResponse
from app.schemas.common import APIResponse
from app.services.auth_service import auth_service
from app.services.google_oauth_service import google_oauth_service
from app.repositories.user_repository import user_repository
from app.models.user import User

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


@router.post("/username", response_model=APIResponse[Token])
def username_login(
    login_in: UsernameLogin,
    db: Session = Depends(deps.get_db)
):
    """Simple username-only login - creates or finds user by username"""
    # Try to find user by email (using username as email-like identifier)
    # or by full_name. For simplicity, use username as email.
    user = user_repository.get_by_email(db, email=f"{login_in.username.lower().replace(' ', '.')}@example.com")
    
    if not user:
        # Create new user
        user_data = {
            "email": f"{login_in.username.lower().replace(' ', '.')}@example.com",
            "hashed_password": "",  # No password
            "full_name": login_in.username,
            "role": "candidate",
            "is_active": True,
        }
        user = user_repository.create(db, obj_in=user_data)
    
    # Generate tokens
    from app.core.security import create_access_token, create_refresh_token
    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)
    
    return APIResponse(
        success=True,
        message=f"Welcome, {login_in.username}!",
        data=Token(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer"
        )
    )


# ─── Google OAuth Endpoints ────────────────────────────────────────────

@router.get("/google/authorize")
def google_authorize(
    redirect_uri: str | None = None,
    state: str | None = None
):
    """Get Google OAuth authorization URL"""
    auth_url = google_oauth_service.get_authorization_url(redirect_uri=redirect_uri, state=state)
    return {"authorization_url": auth_url}


@router.post("/google/callback", response_model=APIResponse[Token])
def google_callback(
    callback: GoogleCallbackRequest,
    db: Session = Depends(deps.get_db)
):
    """Handle Google OAuth callback with authorization code"""
    # Exchange code for tokens
    tokens = google_oauth_service.exchange_code_for_tokens(
        code=callback.code,
        redirect_uri=callback.redirect_uri
    )

    # Verify ID token and get user info
    google_user = google_oauth_service.verify_id_token(tokens["id_token"])

    # Authenticate or create user
    token = google_oauth_service.authenticate_or_create_user(db, google_user)

    return APIResponse(
        success=True,
        message="Google authentication successful.",
        data=token
    )


@router.post("/google/token", response_model=APIResponse[Token])
def google_token(
    token_req: GoogleTokenRequest,
    db: Session = Depends(deps.get_db)
):
    """Authenticate with Google ID token directly (for One Tap / Sign In with Google button)"""
    # Verify ID token and get user info
    google_user = google_oauth_service.verify_id_token(token_req.id_token)

    # Authenticate or create user
    token = google_oauth_service.authenticate_or_create_user(db, google_user)

    return APIResponse(
        success=True,
        message="Google authentication successful.",
        data=token
    )
