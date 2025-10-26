from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from app.database import get_db
from app.models.user import User
from app.models.document import Translation
from app.middleware.auth import get_current_active_user

router = APIRouter()

@router.get("/")
async def get_user_translations(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 10,
    language: Optional[str] = None,
    grade: Optional[str] = None
):
    """Get user's translations with optional filters."""
    
    query = db.query(Translation).filter(Translation.user_id == current_user.id)
    
    if language:
        query = query.filter(Translation.language == language)
    
    if grade:
        query = query.filter(Translation.grade == grade)
    
    translations = query.offset(skip).limit(limit).all()
    total = query.count()
    
    return {
        "translations": translations,
        "total": total,
        "skip": skip,
        "limit": limit
    }

@router.get("/{translation_id}")
async def get_translation(
    translation_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get specific translation details."""
    
    translation = db.query(Translation).filter(
        Translation.id == translation_id,
        Translation.user_id == current_user.id
    ).first()
    
    if not translation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Translation not found"
        )
    
    return translation

@router.put("/{translation_id}/verify")
async def verify_translation(
    translation_id: int,
    is_verified: bool,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Verify a translation."""
    
    translation = db.query(Translation).filter(
        Translation.id == translation_id,
        Translation.user_id == current_user.id
    ).first()
    
    if not translation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Translation not found"
        )
    
    translation.is_verified = is_verified
    translation.verified_by = current_user.id
    translation.verified_at = db.query(func.now()).scalar()
    
    db.commit()
    db.refresh(translation)
    
    return {
        "message": "Translation verification updated",
        "translation": translation
    }

@router.post("/{translation_id}/feedback")
async def add_translation_feedback(
    translation_id: int,
    rating: int,
    comment: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Add feedback to a translation."""
    
    if rating < 1 or rating > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rating must be between 1 and 5"
        )
    
    translation = db.query(Translation).filter(
        Translation.id == translation_id,
        Translation.user_id == current_user.id
    ).first()
    
    if not translation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Translation not found"
        )
    
    translation.feedback = {
        "rating": rating,
        "comment": comment
    }
    
    db.commit()
    db.refresh(translation)
    
    return {
        "message": "Feedback added successfully",
        "translation": translation
    }

@router.get("/stats/overview")
async def get_translation_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get translation statistics for the user."""
    
    total_translations = db.query(Translation).filter(
        Translation.user_id == current_user.id
    ).count()
    
    verified_translations = db.query(Translation).filter(
        Translation.user_id == current_user.id,
        Translation.is_verified == True
    ).count()
    
    # Get translations by language
    language_stats = db.query(
        Translation.language,
        db.func.count(Translation.id).label('count')
    ).filter(
        Translation.user_id == current_user.id
    ).group_by(Translation.language).all()
    
    # Get translations by grade
    grade_stats = db.query(
        Translation.grade,
        db.func.count(Translation.id).label('count')
    ).filter(
        Translation.user_id == current_user.id
    ).group_by(Translation.grade).all()
    
    return {
        "total_translations": total_translations,
        "verified_translations": verified_translations,
        "verification_rate": verified_translations / total_translations if total_translations > 0 else 0,
        "by_language": [{"language": lang, "count": count} for lang, count in language_stats],
        "by_grade": [{"grade": grade, "count": count} for grade, count in grade_stats]
    }
