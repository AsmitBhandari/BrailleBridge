from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token, UserUpdate, UserPreferences
from app.services.auth_service import AuthService
from app.middleware.auth import get_current_active_user
from app.models.user import User

router = APIRouter()

@router.post("/register", response_model=Token)
def register(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    auth_service = AuthService(db)
    db_user = auth_service.create_user(user)
    access_token = auth_service.create_access_token_for_user(db_user)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": db_user,
        "success": True
    }

@router.post("/login", response_model=Token)
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """Login user and return access token."""
    auth_service = AuthService(db)
    user = auth_service.authenticate_user(user_credentials.email, user_credentials.password)
    access_token = auth_service.create_access_token_for_user(user)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
        "success": True
    }

@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """Get current user information."""
    return current_user

@router.put("/me", response_model=UserResponse)
def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update current user information."""
    auth_service = AuthService(db)
    updated_user = auth_service.update_user(current_user.id, user_update)
    return updated_user

@router.put("/preferences", response_model=UserResponse)
def update_user_preferences(
    preferences: UserPreferences,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update user preferences."""
    auth_service = AuthService(db)
    user_update = UserUpdate(preferences=preferences.dict())
    updated_user = auth_service.update_user(current_user.id, user_update)
    return updated_user

@router.post("/logout")
def logout():
    """Logout user (client should remove token)."""
    return {"message": "Successfully logged out"}
