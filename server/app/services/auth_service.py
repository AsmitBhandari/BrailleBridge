from sqlalchemy.orm import Session
from datetime import datetime
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.config import settings
from fastapi import HTTPException, status

class AuthService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_user(self, user: UserCreate) -> User:
        """Create a new user."""
        # Check if user already exists
        existing_user = self.db.query(User).filter(User.email == user.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user
        hashed_password = get_password_hash(user.password)
        db_user = User(
            name=user.name,
            email=user.email,
            hashed_password=hashed_password,
            role=user.role
        )
        
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user
    
    def authenticate_user(self, email: str, password: str) -> User:
        """Authenticate a user with email and password."""
        user = self.db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        if not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is deactivated"
            )
        
        # Update last login
        user.last_login = datetime.utcnow()
        self.db.commit()
        
        return user
    
    def get_user_by_id(self, user_id: int) -> User:
        """Get user by ID."""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return user
    
    def update_user(self, user_id: int, user_update: UserUpdate) -> User:
        """Update user information."""
        user = self.get_user_by_id(user_id)
        
        if user_update.name is not None:
            user.name = user_update.name
        
        if user_update.preferences is not None:
            user.preferences = user_update.preferences
        
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def create_access_token_for_user(self, user: User) -> str:
        """Create access token for user."""
        access_token = create_access_token(
            data={"sub": str(user.id)}
        )
        return access_token
