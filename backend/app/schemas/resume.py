from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel


class EducationItem(BaseModel):
    institution: Optional[str] = None
    degree: Optional[str] = None
    field: Optional[str] = None
    year: Optional[str] = None


class ExperienceItem(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    duration: Optional[str] = None
    description: Optional[List[str]] = None


class ATSBreakdownItem(BaseModel):
    score: float
    max: int


class ResumeResponse(BaseModel):
    id: str
    user_id: str
    original_filename: str
    file_type: Optional[str] = None
    file_size: Optional[int] = None
    status: str
    version: int
    is_primary: bool

    # Parsed fields
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    summary: Optional[str] = None
    skills: Optional[List[str]] = None
    education: Optional[List[Any]] = None
    experience: Optional[List[Any]] = None
    projects: Optional[List[Any]] = None
    certifications: Optional[List[str]] = None
    languages: Optional[List[str]] = None

    # ATS
    ats_score: Optional[float] = None
    ats_feedback: Optional[List[str]] = None
    improvement_suggestions: Optional[List[str]] = None
    parse_error: Optional[str] = None

    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ResumeListItem(BaseModel):
    id: str
    original_filename: str
    file_type: Optional[str] = None
    file_size: Optional[int] = None
    status: str
    version: int
    is_primary: bool
    ats_score: Optional[float] = None
    skills_count: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

    @classmethod
    def from_resume(cls, resume):
        return cls(
            id=resume.id,
            original_filename=resume.original_filename,
            file_type=resume.file_type,
            file_size=resume.file_size,
            status=resume.status.value if hasattr(resume.status, 'value') else resume.status,
            version=resume.version,
            is_primary=resume.is_primary,
            ats_score=resume.ats_score,
            skills_count=len(resume.skills) if resume.skills else 0,
            created_at=resume.created_at,
        )
