from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.user_repository import user_repository
from app.schemas.auth import UserRegister, UserLogin, Token
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token, decode_token
from app.models.user import User


class AuthService:
    def register_user(self, db: Session, user_in: UserRegister) -> User:
        existing_user = user_repository.get_by_email(db, email=user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists."
            )
        
        user_data = {
            "email": user_in.email.lower(),
            "hashed_password": get_password_hash(user_in.password),
            "full_name": user_in.full_name,
            "role": user_in.role
        }
        return user_repository.create(db, obj_in=user_data)

    def authenticate_user(self, db: Session, login_data: UserLogin) -> Token:
        user = user_repository.get_by_email(db, email=login_data.email)
        if not user or not verify_password(login_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user account."
            )

        access_token = create_access_token(subject=user.id)
        refresh_token = create_refresh_token(subject=user.id)
        return Token(access_token=access_token, refresh_token=refresh_token)

    def refresh_token(self, db: Session, refresh_token: str) -> Token:
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        user_id = payload.get("sub")
        user = user_repository.get(db, id=user_id)
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User inactive or no longer exists."
            )

        new_access_token = create_access_token(subject=user.id)
        new_refresh_token = create_refresh_token(subject=user.id)
        return Token(access_token=new_access_token, refresh_token=new_refresh_token)


auth_service = AuthService()
