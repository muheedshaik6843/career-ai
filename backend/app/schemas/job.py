from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.job import ApplicationStatus


class JobAnalyzeRequest(BaseModel):
    description: str
    title: Optional[str] = "Target Role"
    company: Optional[str] = "Target Company"
    resume_id: Optional[str] = None


class SkillGapBreakdown(BaseModel):
    match_score: float
    skill_score: float
    experience_score: float
    education_score: float
    matching_skills: List[str] = []
    missing_required_skills: List[str] = []
    missing_preferred_skills: List[str] = []
    missing_keywords: List[str] = []
    recommendations: List[str] = []


class JobMatchResponse(BaseModel):
    job_title: str
    company: str
    location: Optional[str] = None
    match_score: float
    breakdown: SkillGapBreakdown
    # Extra live-job metadata
    apply_url: Optional[str] = None
    source: Optional[str] = None
    salary_range: Optional[str] = None


class JobDescriptionResponse(BaseModel):
    id: str
    title: str
    company: str
    location: Optional[str] = None
    salary_range: Optional[str] = None
    job_type: Optional[str] = None
    description: str
    required_skills: Optional[List[str]] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ApplicationCreate(BaseModel):
    job_title: str
    company: str
    location: Optional[str] = None
    salary: Optional[str] = None
    url: Optional[str] = None
    status: Optional[ApplicationStatus] = ApplicationStatus.SAVED
    notes: Optional[str] = None
    match_score: Optional[float] = None


class ApplicationUpdate(BaseModel):
    job_title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    salary: Optional[str] = None
    url: Optional[str] = None
    status: Optional[ApplicationStatus] = None
    notes: Optional[str] = None
    applied_date: Optional[datetime] = None


class ApplicationResponse(BaseModel):
    id: str
    user_id: str
    job_title: str
    company: str
    location: Optional[str] = None
    salary: Optional[str] = None
    url: Optional[str] = None
    status: str
    applied_date: Optional[datetime] = None
    notes: Optional[str] = None
    match_score: Optional[float] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def from_orm_app(cls, app):
        return cls(
            id=app.id,
            user_id=app.user_id,
            job_title=app.job_title,
            company=app.company,
            location=app.location,
            salary=app.salary,
            url=app.url,
            status=app.status.value if hasattr(app.status, 'value') else str(app.status),
            applied_date=app.applied_date,
            notes=app.notes,
            match_score=app.match_score,
            created_at=app.created_at,
            updated_at=app.updated_at,
        )
