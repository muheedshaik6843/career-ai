from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime, timezone

from app.models.job import JobApplication, ApplicationStatus
from app.schemas.job import ApplicationCreate, ApplicationUpdate


class ApplicationService:

    def create_application(self, db: Session, user_id: str, app_in: ApplicationCreate) -> JobApplication:
        db_obj = JobApplication(
            user_id=user_id,
            job_title=app_in.job_title,
            company=app_in.company,
            location=app_in.location,
            salary=app_in.salary,
            url=app_in.url,
            status=app_in.status or ApplicationStatus.SAVED,
            notes=app_in.notes,
            match_score=app_in.match_score,
            applied_date=datetime.now(timezone.utc) if app_in.status == ApplicationStatus.APPLIED else None
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_user_applications(
        self, db: Session, user_id: str, status_filter: Optional[ApplicationStatus] = None, skip: int = 0, limit: int = 100
    ) -> List[JobApplication]:
        query = db.query(JobApplication).filter(
            JobApplication.user_id == user_id,
            JobApplication.is_deleted == False
        )
        if status_filter:
            query = query.filter(JobApplication.status == status_filter)
        return query.order_by(JobApplication.created_at.desc()).offset(skip).limit(limit).all()

    def get_application(self, db: Session, application_id: str, user_id: str) -> JobApplication:
        app_obj = db.query(JobApplication).filter(
            JobApplication.id == application_id,
            JobApplication.user_id == user_id,
            JobApplication.is_deleted == False
        ).first()
        if not app_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found."
            )
        return app_obj

    def update_application(self, db: Session, application_id: str, user_id: str, app_in: ApplicationUpdate) -> JobApplication:
        app_obj = self.get_application(db, application_id, user_id)
        update_data = app_in.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            if value is not None:
                setattr(app_obj, field, value)

        if app_in.status == ApplicationStatus.APPLIED and not app_obj.applied_date:
            app_obj.applied_date = datetime.now(timezone.utc)

        db.add(app_obj)
        db.commit()
        db.refresh(app_obj)
        return app_obj

    def delete_application(self, db: Session, application_id: str, user_id: str) -> bool:
        app_obj = self.get_application(db, application_id, user_id)
        app_obj.is_deleted = True
        db.add(app_obj)
        db.commit()
        return True


application_service = ApplicationService()
