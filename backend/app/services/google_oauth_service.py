from typing import Optional
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from google_auth_oauthlib.flow import Flow
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.schemas.auth import GoogleUserInfo, Token
from app.services.auth_service import auth_service
from app.repositories.user_repository import user_repository
from app.models.user import User
from app.core.config import settings
from app.core.security import create_access_token, create_refresh_token


class GoogleOAuthService:
    """Handle Google OAuth authentication flows"""

    def __init__(self):
        self.client_id = settings.GOOGLE_CLIENT_ID
        self.client_secret = settings.GOOGLE_CLIENT_SECRET
        self.redirect_uri = settings.GOOGLE_REDIRECT_URI

    def get_authorization_url(self, redirect_uri: Optional[str] = None, state: Optional[str] = None) -> str:
        """Generate Google OAuth authorization URL"""
        if not self.client_id or not self.client_secret:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET."
            )

        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "redirect_uris": [redirect_uri or self.redirect_uri],
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                }
            },
            scopes=[
                "openid",
                "https://www.googleapis.com/auth/userinfo.email",
                "https://www.googleapis.com/auth/userinfo.profile",
            ],
            redirect_uri=redirect_uri or self.redirect_uri,
        )

        authorization_url, _ = flow.authorization_url(
            access_type="offline",
            include_granted_scopes="true",
            prompt="consent",
            state=state,
        )
        return authorization_url

    def exchange_code_for_tokens(self, code: str, redirect_uri: Optional[str] = None) -> dict:
        """Exchange authorization code for access/refresh tokens"""
        if not self.client_id or not self.client_secret:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Google OAuth not configured"
            )

        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "redirect_uris": [redirect_uri or self.redirect_uri],
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                }
            },
            scopes=[
                "openid",
                "https://www.googleapis.com/auth/userinfo.email",
                "https://www.googleapis.com/auth/userinfo.profile",
            ],
            redirect_uri=redirect_uri or self.redirect_uri,
        )

        flow.fetch_token(code=code)
        credentials = flow.credentials
        return {
            "access_token": credentials.token,
            "refresh_token": credentials.refresh_token,
            "id_token": credentials.id_token,
        }

    def verify_id_token(self, id_token_str: str) -> GoogleUserInfo:
        """Verify Google ID token and extract user info"""
        if not self.client_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Google OAuth not configured"
            )

        try:
            # Verify the ID token
            idinfo = id_token.verify_oauth2_token(
                id_token_str,
                google_requests.Request(),
                self.client_id
            )

            # Verify the token is from Google
            if idinfo["iss"] not in ["accounts.google.com", "https://accounts.google.com"]:
                raise ValueError("Wrong issuer")

            return GoogleUserInfo(
                sub=idinfo["sub"],
                email=idinfo["email"],
                name=idinfo.get("name", ""),
                given_name=idinfo.get("given_name"),
                family_name=idinfo.get("family_name"),
                picture=idinfo.get("picture"),
                email_verified=idinfo.get("email_verified", False),
            )
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid Google ID token: {str(e)}",
            )

    def authenticate_or_create_user(self, db: Session, google_user: GoogleUserInfo) -> Token:
        """Find existing user by Google ID or email, or create new user"""
        # First try to find user by Google ID (stored in a field we'd add)
        # For now, find by email
        user = user_repository.get_by_email(db, email=google_user.email)

        if user:
            # Existing user - update Google ID if not set
            # We'd add a google_id field to User model for this
            pass
        else:
            # Create new user
            user_data = {
                "email": google_user.email.lower(),
                "hashed_password": "",  # No password for OAuth users
                "full_name": google_user.name or google_user.email.split("@")[0],
                "role": "candidate",
                "is_active": True,
                "avatar_url": google_user.picture,
            }
            user = user_repository.create(db, obj_in=user_data)

        # Generate our own JWT tokens
        access_token = create_access_token(subject=user.id)
        refresh_token = create_refresh_token(subject=user.id)

        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer"
        )


google_oauth_service = GoogleOAuthService()