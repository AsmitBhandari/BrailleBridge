from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import uuid
from datetime import datetime

from app.database import get_db
from app.models.user import User
from app.models.document import Document, Translation
from app.middleware.auth import get_current_active_user
from app.services.ocr_service import OCRService
from app.services.braille_service import BrailleService
from app.services.tts_service import TTSService
from app.core.config import settings

router = APIRouter()

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Upload a document for processing."""
    
    # Validate file type
    file_extension = os.path.splitext(file.filename)[1].lower()
    allowed_extensions = settings.ALLOWED_EXTENSIONS.split(',')
    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type {file_extension} not supported"
        )
    
    # Validate file size
    if file.size > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum limit"
        )
    
    try:
        # Generate unique filename
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Create document record
        document = Document(
            user_id=current_user.id,
            title=title,
            original_filename=file.filename,
            original_filepath=file_path,
            original_mimetype=file.content_type,
            original_size=file.size,
            status="uploaded"
        )
        
        db.add(document)
        db.commit()
        db.refresh(document)
        
        return {
            "message": "Document uploaded successfully",
            "document_id": document.id,
            "status": "uploaded"
        }
        
    except Exception as e:
        # Clean up file if database operation fails
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upload failed: {str(e)}"
        )

@router.post("/{document_id}/process")
async def process_document(
    document_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Process uploaded document (OCR, Braille, TTS)."""
    
    # Get document
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    if document.status != "uploaded":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document already processed or processing"
        )
    
    try:
        # Update status to processing
        document.status = "processing"
        db.commit()
        
        # Initialize services
        ocr_service = OCRService()
        braille_service = BrailleService()
        tts_service = TTSService()
        
        # Step 1: OCR - Extract text
        try:
            extracted_text = ocr_service.extract_text_from_document(
                document.original_filepath,
                os.path.splitext(document.original_filename)[1],
                current_user.preferences.get("language", "en")
            )
            
            document.extracted_text = extracted_text
            document.processing_steps["ocr"]["completed"] = True
            document.processing_steps["ocr"]["timestamp"] = datetime.utcnow()
            
        except Exception as e:
            document.processing_steps["ocr"]["error"] = str(e)
            document.status = "failed"
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"OCR processing failed: {str(e)}"
            )
        
        # Step 2: Braille conversion
        try:
            braille_grade = current_user.preferences.get("braille_grade", "grade1")
            braille_content = braille_service.text_to_braille(
                extracted_text,
                braille_grade,
                current_user.preferences.get("language", "en")
            )
            
            document.braille_content = braille_content
            document.braille_grade = braille_grade
            document.braille_language = current_user.preferences.get("language", "en")
            document.processing_steps["braille"]["completed"] = True
            document.processing_steps["braille"]["timestamp"] = datetime.utcnow()
            
        except Exception as e:
            document.processing_steps["braille"]["error"] = str(e)
            document.status = "failed"
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Braille conversion failed: {str(e)}"
            )
        
        # Step 3: Text-to-Speech (if enabled)
        if current_user.preferences.get("audio_enabled", True):
            try:
                audio_filename = f"{uuid.uuid4()}.wav"
                audio_path = os.path.join(settings.UPLOAD_DIR, audio_filename)
                
                tts_service.text_to_speech(
                    extracted_text,
                    audio_path,
                    current_user.preferences.get("language", "en")
                )
                
                document.audio_filename = audio_filename
                document.audio_filepath = audio_path
                document.audio_duration = tts_service.get_audio_duration(audio_path)
                document.processing_steps["audio"]["completed"] = True
                document.processing_steps["audio"]["timestamp"] = datetime.utcnow()
                
            except Exception as e:
                document.processing_steps["audio"]["error"] = str(e)
                # Don't fail the entire process for TTS errors
        
        # Update metadata
        document.doc_metadata = {
            "word_count": len(extracted_text.split()),
            "character_count": len(extracted_text),
            "processing_time": 0  # Could be calculated
        }
        
        # Mark as completed
        document.status = "completed"
        db.commit()
        
        return {
            "message": "Document processed successfully",
            "document_id": document.id,
            "status": "completed",
            "extracted_text_length": len(extracted_text),
            "braille_content_length": len(document.braille_content)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        document.status = "failed"
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Processing failed: {str(e)}"
        )

@router.get("/")
async def get_user_documents(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 10
):
    """Get user's documents."""
    
    # Get total count for pagination
    total_count = db.query(Document).filter(
        Document.user_id == current_user.id
    ).count()
    
    documents = db.query(Document).filter(
        Document.user_id == current_user.id
    ).order_by(Document.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "documents": documents,
        "total": total_count,
        "skip": skip,
        "limit": limit
    }

@router.get("/recent")
async def get_recent_documents(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's recent documents (limited to 10)."""
    
    documents = db.query(Document).filter(
        Document.user_id == current_user.id
    ).order_by(Document.created_at.desc()).limit(10).all()
    
    return {
        "documents": documents,
        "total": len(documents)
    }

@router.get("/{document_id}")
async def get_document(
    document_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get specific document details."""
    
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    return document

@router.get("/{document_id}/audio")
async def get_document_audio(
    document_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get document audio file."""
    
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    if not document.audio_filepath or not os.path.exists(document.audio_filepath):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audio file not found"
        )
    
    from fastapi.responses import FileResponse
    return FileResponse(
        document.audio_filepath,
        media_type="audio/wav",
        filename=f"{document.title}_audio.wav"
    )

@router.delete("/{document_id}")
async def delete_document(
    document_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a document."""
    
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    try:
        # Delete files
        if os.path.exists(document.original_filepath):
            os.remove(document.original_filepath)
        
        if document.audio_filepath and os.path.exists(document.audio_filepath):
            os.remove(document.audio_filepath)
        
        # Delete from database
        db.delete(document)
        db.commit()
        
        return {"message": "Document deleted successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Deletion failed: {str(e)}"
        )
