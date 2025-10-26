from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    
    # Original file information
    original_filename = Column(String(255), nullable=False)
    original_filepath = Column(String(500), nullable=False)
    original_mimetype = Column(String(100), nullable=False)
    original_size = Column(Integer, nullable=False)
    
    # Extracted content
    extracted_text = Column(Text, default="")
    
    # Braille translation
    braille_content = Column(Text, default="")
    braille_grade = Column(String(20), default="grade1")
    braille_language = Column(String(10), default="en")
    
    # Audio file information
    audio_filename = Column(String(255))
    audio_filepath = Column(String(500))
    audio_duration = Column(Integer)  # in seconds
    
    # Processing status
    status = Column(String(20), default="uploaded")  # uploaded, processing, completed, failed
    processing_steps = Column(JSON, default={
        "ocr": {"completed": False, "timestamp": None, "error": None},
        "braille": {"completed": False, "timestamp": None, "error": None},
        "audio": {"completed": False, "timestamp": None, "error": None}
    })
    
    # Document metadata
    doc_metadata = Column(JSON, default={
        "page_count": 0,
        "word_count": 0,
        "character_count": 0,
        "processing_time": 0
    })
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="documents")
    translations = relationship("Translation", back_populates="document")

class Translation(Base):
    __tablename__ = "translations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    
    original_text = Column(Text, nullable=False)
    braille_text = Column(Text, nullable=False)
    language = Column(String(10), nullable=False)
    grade = Column(String(20), default="grade1")
    
    confidence = Column(Integer, default=80)  # 0-100
    is_verified = Column(Boolean, default=False)
    verified_by = Column(Integer, ForeignKey("users.id"))
    verified_at = Column(DateTime)
    
    feedback = Column(JSON, default={
        "rating": None,
        "comment": None
    })
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    document = relationship("Document", back_populates="translations")
    # verifier = relationship("User", foreign_keys=[verified_by])
