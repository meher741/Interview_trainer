from sqlalchemy import Column, String, DateTime, func, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
import uuid
from datetime import datetime, timedelta


class Session(Base):
    __tablename__ = "sessions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_email = Column(String, ForeignKey("users.email"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=False)

    user = relationship("User", back_populates="sessions")

    @classmethod
    def create(cls, user_email: str, days: int = 7) -> "Session":
        session = cls(user_email=user_email)
        session.expires_at = datetime.utcnow() + timedelta(days=days)
        return session

    def is_valid(self) -> bool:
        return datetime.utcnow() < self.expires_at