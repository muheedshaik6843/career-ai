from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator
from app.models.user import UserRole


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=72, description="Password must be 8-72 characters long")
    full_name: str = Field(..., min_length=2, max_length=100)
    role: UserRole = UserRole.CANDIDATE

    @field_validator("password")
    @classmethod
    def validate_password_bytes(cls, v: str) -> str:
        """Ensure password doesn't exceed 72 bytes when UTF-8 encoded."""
        if len(v.encode("utf-8")) > 72:
            raise ValueError("Password cannot exceed 72 bytes when encoded")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def validate_password_bytes(cls, v: str) -> str:
        if len(v.encode("utf-8")) > 72:
            raise ValueError("Password cannot exceed 72 bytes when encoded")
        return v


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    type: Optional[str] = None
