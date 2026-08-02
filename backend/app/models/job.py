import enum
from sqlalchemy import Column, String, Text, Float, ForeignKey, JSON, Enum as SQLEnum, DateTime, Integer
from datetime import datetime, timezone
from app.models.base import BaseModel


class ApplicationStatus(str, enum.Enum):
    SAVED = "saved"
    APPLIED = "applied"
    INTERVIEWING = "interviewing"
    OFFER = "offer"
    REJECTED = "rejected"


class JobDescription(BaseModel):
    __tablename__ = "job_descriptions"

    title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=False)
    location = Column(String(255), nullable=True)
    salary_range = Column(String(100), nullable=True)
    job_type = Column(String(100), nullable=True)  # Full-time, Remote, Hybrid, etc.
    description = Column(Text, nullable=False)
    
    # Extracted metadata
    required_skills = Column(JSON, nullable=True)     # List[str]
    preferred_skills = Column(JSON, nullable=True)    # List[str]
    keywords = Column(JSON, nullable=True)            # List[str]
    experience_level = Column(String(100), nullable=True)
    education_required = Column(String(255), nullable=True)


class JobMatch(BaseModel):
    __tablename__ = "job_matches"

    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    resume_id = Column(String(36), ForeignKey("resumes.id"), nullable=True, index=True)
    job_id = Column(String(36), ForeignKey("job_descriptions.id"), nullable=True, index=True)

    match_score = Column(Float, nullable=False)        # 0.0 - 100.0
    skill_score = Column(Float, nullable=False)        # 0.0 - 100.0
    experience_score = Column(Float, nullable=False)   # 0.0 - 100.0
    education_score = Column(Float, nullable=False)    # 0.0 - 100.0

    matching_skills = Column(JSON, nullable=True)      # List[str]
    missing_required_skills = Column(JSON, nullable=True)  # List[str]
    missing_preferred_skills = Column(JSON, nullable=True) # List[str]
    missing_keywords = Column(JSON, nullable=True)     # List[str]
    recommendations = Column(JSON, nullable=True)      # List[str]


class JobApplication(BaseModel):
    __tablename__ = "job_applications"

    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    job_title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=False)
    location = Column(String(255), nullable=True)
    salary = Column(String(100), nullable=True)
    url = Column(String(1000), nullable=True)
    
    status = Column(SQLEnum(ApplicationStatus), default=ApplicationStatus.SAVED, nullable=False)
    applied_date = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, nullable=True)
    match_score = Column(Float, nullable=True)
