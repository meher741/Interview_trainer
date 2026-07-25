from sqlalchemy import Column, String, DateTime, func
from sqlalchemy.orm import relationship
from database import Base
import bcrypt

class User(Base):
    __tablename__ = "users"
    
    email = Column(String, primary_key=True, index=True)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")
    interview_sessions = relationship("InterviewSession", back_populates="user", cascade="all, delete-orphan")
    attempts = relationship("QuestionAttempt", back_populates="user", cascade="all, delete-orphan")
    
    def set_password(self, password: str):
        self.password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    
    def verify_password(self, password: str) -> bool:
        return bcrypt.checkpw(password.encode(), self.password_hash.encode())