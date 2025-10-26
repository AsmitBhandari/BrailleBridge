from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="user")  # user, admin
    is_active = Column(Boolean, default=True)
    preferences = Column(JSON, default={
        "language": "en",
        "braille_grade": "grade1",
        "audio_enabled": True
    })
    last_login = Column(DateTime)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    documents = relationship("Document", back_populates="user")
    # translations = relationship("Translation", foreign_keys="Translation.user_id", back_populates="user")
