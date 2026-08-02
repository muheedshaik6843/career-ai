from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict


# Cover Letter Schemas
class CoverLetterRequest(BaseModel):
    job_title: str
    company: str
    job_description: Optional[str] = None
    tone: Optional[str] = "Professional"  # Professional, Enthusiastic, Executive
    resume_id: Optional[str] = None


class CoverLetterResponse(BaseModel):
    job_title: str
    company: str
    tone: str
    cover_letter: str
    key_highlights: List[str]


# Bullet Optimizer Schemas
class BulletOptimizeRequest(BaseModel):
    bullet_point: str
    target_role: Optional[str] = None


class BulletOptimizeResponse(BaseModel):
    original_bullet: str
    optimized_bullets: List[str]
    action_verbs_used: List[str]
    impact_score: float


# Mock Interview Schemas
class InterviewStartRequest(BaseModel):
    target_role: str
    experience_level: Optional[str] = "Mid-Level"
    difficulty: Optional[str] = "Medium"
    resume_id: Optional[str] = None


class InterviewQuestion(BaseModel):
    id: str
    category: str  # Behavioral, Technical, System Design
    question: str
    model_answer: Optional[str] = None


class InterviewAnswerRequest(BaseModel):
    question_id: str
    user_answer: str


class QuestionFeedback(BaseModel):
    question_id: str
    question: str
    user_answer: str
    score: float  # 0 - 100
    rating: str   # Excellent, Good, Needs Improvement
    feedback: str
    key_improvements: List[str]


class InterviewSessionResponse(BaseModel):
    id: str
    user_id: str
    target_role: str
    difficulty: str
    status: str
    questions: List[InterviewQuestion]
    answers: List[QuestionFeedback] = []
    overall_score: Optional[float] = None
    strengths: Optional[List[str]] = []
    areas_for_improvement: Optional[List[str]] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Career Roadmap Schemas
class RoadmapRequest(BaseModel):
    target_role: str
    current_level: Optional[str] = "Intermediate"
    timeline_months: Optional[int] = 6
    resume_id: Optional[str] = None


class Milestone(BaseModel):
    month: int
    title: str
    focus: str
    key_actions: List[str]
    recommended_skills: List[str]
    project_idea: str


class CareerRoadmapResponse(BaseModel):
    target_role: str
    timeline_months: int
    milestones: List[Milestone]
    recommended_certifications: List[str]
    summary: str


# Chat Assistant Schemas
class ChatRequest(BaseModel):
    message: str
    target_role: Optional[str] = "Software Engineer"
    context: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    suggested_followups: List[str]
    actionable_tips: List[str]
