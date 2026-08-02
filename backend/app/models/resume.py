import enum
import json
from sqlalchemy import Column, String, Text, Integer, Float, ForeignKey, JSON, Enum as SQLEnum, Boolean
from app.models.base import BaseModel


class ResumeStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class Resume(BaseModel):
    __tablename__ = "resumes"

    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    filename = Column(String(500), nullable=False)
    original_filename = Column(String(500), nullable=False)
    file_url = Column(String(1000), nullable=True)
    file_size = Column(Integer, nullable=True)
    file_type = Column(String(50), nullable=True)  # pdf, docx

    # Parsed data stored as JSON
    raw_text = Column(Text, nullable=True)
    full_name = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(100), nullable=True)
    location = Column(String(500), nullable=True)
    summary = Column(Text, nullable=True)
    skills = Column(JSON, nullable=True)           # List[str]
    education = Column(JSON, nullable=True)        # List[dict]
    experience = Column(JSON, nullable=True)       # List[dict]
    projects = Column(JSON, nullable=True)         # List[dict]
    certifications = Column(JSON, nullable=True)   # List[dict]
    languages = Column(JSON, nullable=True)        # List[str]

    # ATS
    ats_score = Column(Float, nullable=True)
    ats_feedback = Column(JSON, nullable=True)     # List[str]
    improvement_suggestions = Column(JSON, nullable=True)  # List[str]

    # State
    status = Column(SQLEnum(ResumeStatus), default=ResumeStatus.PENDING, nullable=False)
    version = Column(Integer, default=1, nullable=False)
    is_primary = Column(Boolean, default=False, nullable=False)
    parse_error = Column(Text, nullable=True)
