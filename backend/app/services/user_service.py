from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.user_repository import user_repository
from app.schemas.user import UserUpdate, UserPasswordUpdate
from app.core.security import get_password_hash, verify_password
from app.models.user import User


class UserService:
    def update_profile(self, db: Session, user: User, user_in: UserUpdate) -> User:
        update_data = user_in.model_dump(exclude_unset=True)
        return user_repository.update(db, db_obj=user, obj_in=update_data)

    def change_password(self, db: Session, user: User, password_in: UserPasswordUpdate) -> bool:
        if not verify_password(password_in.old_password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect current password."
            )
        
        hashed_password = get_password_hash(password_in.new_password)
        user_repository.update(db, db_obj=user, obj_in={"hashed_password": hashed_password})
        return True


user_service = UserService()
