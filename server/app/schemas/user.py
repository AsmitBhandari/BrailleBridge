from pydantic import BaseModel, EmailStr, validator
from typing import Optional, Dict, Any
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str
    role: Optional[str] = "user"
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters long')
        if len(v) > 72:
            raise ValueError('Password must be 72 characters or less')
        return v

class UserUpdate(BaseModel):
    name: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None

class UserPreferences(BaseModel):
    language: str = "en"
    braille_grade: str = "grade1"
    audio_enabled: bool = True

class UserResponse(UserBase):
    id: int
    role: str
    is_active: bool
    preferences: Dict[str, Any]
    last_login: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) > 72:
            raise ValueError('Password must be 72 characters or less')
        return v

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
    success: bool = True

class TokenData(BaseModel):
    user_id: Optional[int] = None
