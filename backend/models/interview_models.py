from sqlalchemy import Column, String, Integer, Float, DateTime, func, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base
import uuid


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_email = Column(String, ForeignKey("users.email"), nullable=False, index=True)
    role = Column(String, nullable=False)
    topic = Column(String, nullable=False)
    total_score = Column(Float, default=0.0)
    average_score = Column(Float, default=0.0)
    question_count = Column(Integer, default=0)
    duration_seconds = Column(Integer, default=0)
    completed = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="interview_sessions")
    attempts = relationship("QuestionAttempt", back_populates="session", cascade="all, delete-orphan")


class QuestionAttempt(Base):
    __tablename__ = "question_attempts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_email = Column(String, ForeignKey("users.email"), nullable=False, index=True)
    session_id = Column(String, ForeignKey("interview_sessions.id"), nullable=True, index=True)
    role = Column(String, nullable=False)
    topic = Column(String, nullable=False)
    difficulty = Column(String, nullable=False)
    question_text = Column(String, nullable=False)
    answer_text = Column(String, nullable=False)
    score = Column(Integer, nullable=False)
    strengths = Column(JSON, default=list)
    weaknesses = Column(JSON, default=list)
    missing_topics = Column(JSON, default=list)
    expected_topics = Column(JSON, default=list)
    question_category = Column(String, default="")
    confidence = Column(String, default="")
    next_difficulty = Column(String, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="attempts")
    session = relationship("InterviewSession", back_populates="attempts")
