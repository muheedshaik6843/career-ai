from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.resume import Resume, ResumeStatus
from app.repositories.base import BaseRepository


class ResumeRepository(BaseRepository[Resume]):
    def __init__(self):
        super().__init__(Resume)

    def get_user_resumes(self, db: Session, user_id: str, skip: int = 0, limit: int = 20) -> List[Resume]:
        return (
            db.query(Resume)
            .filter(Resume.user_id == user_id, Resume.is_deleted == False)
            .order_by(Resume.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def count_user_resumes(self, db: Session, user_id: str) -> int:
        return db.query(Resume).filter(Resume.user_id == user_id, Resume.is_deleted == False).count()

    def get_user_resume(self, db: Session, resume_id: str, user_id: str) -> Optional[Resume]:
        return (
            db.query(Resume)
            .filter(Resume.id == resume_id, Resume.user_id == user_id, Resume.is_deleted == False)
            .first()
        )

    def get_primary_resume(self, db: Session, user_id: str) -> Optional[Resume]:
        return (
            db.query(Resume)
            .filter(Resume.user_id == user_id, Resume.is_primary == True, Resume.is_deleted == False)
            .first()
        )

    def unset_all_primary(self, db: Session, user_id: str) -> None:
        db.query(Resume).filter(
            Resume.user_id == user_id, Resume.is_primary == True
        ).update({"is_primary": False})
        db.commit()


resume_repository = ResumeRepository()
