from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "mysql+pymysql://root:password@localhost:3306/braillebridge"
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_USER: str = "root"
    DB_PASSWORD: str = "password"
    DB_NAME: str = "braillebridge"
    
    # Server
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    NODE_ENV: str = "development"
    
    # JWT
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 7 * 24 * 60  # 7 days
    
    # File Upload
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    UPLOAD_DIR: str = "uploads"
    ALLOWED_EXTENSIONS: str = ".pdf,.png,.jpg,.jpeg,.docx,.txt"
    
    # OCR
    TESSERACT_CMD: Optional[str] = None
    OCR_LANGUAGES: str = "eng+hin+tam+tel+ben+guj+kan+mal+mar+ori+pan+urd"
    
    # Text-to-Speech
    TTS_LANGUAGE: str = "en"
    TTS_RATE: int = 150
    
    # Braille
    BRAILLE_GRADE: str = "grade1"  # grade1 or grade2
    
    # API Keys (for cloud services)
    OPENAI_API_KEY: Optional[str] = None
    GOOGLE_TTS_API_KEY: Optional[str] = None
    
    class Config:
        env_file = ".env"

settings = Settings()

# Create upload directory if it doesn't exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
