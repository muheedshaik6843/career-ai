from sqlalchemy import Column, String, Text, Float, ForeignKey, JSON, Integer
from app.models.base import BaseModel


class InterviewSession(BaseModel):
    __tablename__ = "interview_sessions"

    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    target_role = Column(String(255), nullable=False)
    experience_level = Column(String(100), nullable=True)  # Entry, Mid, Senior, Lead
    difficulty = Column(String(50), default="Medium", nullable=False)  # Easy, Medium, Hard
    
    questions = Column(JSON, nullable=False)      # List[dict] -> {id, question, category, model_answer}
    answers = Column(JSON, nullable=True)         # List[dict] -> {question_id, user_answer, feedback, rating, score}
    
    overall_score = Column(Float, nullable=True)  # 0.0 - 100.0
    strengths = Column(JSON, nullable=True)       # List[str]
    areas_for_improvement = Column(JSON, nullable=True) # List[str]
    status = Column(String(50), default="in_progress", nullable=False)  # in_progress, completed
