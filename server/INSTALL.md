# BrailleBridge Backend Installation Guide

## Prerequisites

### System Requirements
- Python 3.8 or higher
- Tesseract OCR engine
- FFmpeg (for audio processing)
- Git

### Supported Operating Systems
- Windows 10/11
- macOS 10.15+
- Ubuntu 18.04+ / Debian 10+
- CentOS 7+ / RHEL 7+

## Installation Steps

### 1. Clone the Repository
```bash
git clone <repository-url>
cd BrailleBridge/server
```

### 2. Create Virtual Environment
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 3. Install System Dependencies

#### Windows
1. **Install Tesseract:**
   - Download from: https://github.com/UB-Mannheim/tesseract/wiki
   - Install to default location: `C:\Program Files\Tesseract-OCR`
   - Add to PATH or set `TESSERACT_CMD` in .env

2. **Install FFmpeg:**
   - Download from: https://ffmpeg.org/download.html
   - Extract and add to PATH

#### macOS
```bash
# Install using Homebrew
brew install tesseract tesseract-lang
brew install ffmpeg
```

#### Ubuntu/Debian
```bash
# Install Tesseract with multiple languages
sudo apt-get update
sudo apt-get install tesseract-ocr tesseract-ocr-eng tesseract-ocr-hin
sudo apt-get install ffmpeg

# Install additional language packs
sudo apt-get install tesseract-ocr-tam tesseract-ocr-tel tesseract-ocr-ben
```

#### CentOS/RHEL
```bash
# Install EPEL repository
sudo yum install epel-release

# Install Tesseract
sudo yum install tesseract tesseract-langpack-eng tesseract-langpack-hin
sudo yum install ffmpeg
```

### 4. Install Python Dependencies
```bash
# Install requirements
pip install -r requirements.txt

# Or install individually
pip install fastapi uvicorn sqlalchemy python-jose passlib
pip install pytesseract pillow PyPDF2 python-docx
pip install pyttsx3 gtts louis
```

### 5. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit configuration
nano .env  # or use your preferred editor
```

### 6. Database Setup
```bash
# For SQLite (default, no setup required)
# Database will be created automatically

# For PostgreSQL (recommended for production)
# Install PostgreSQL and create database
createdb braillebridge
# Update DATABASE_URL in .env
```

### 7. Create Required Directories
```bash
mkdir -p uploads logs
```

## Quick Start

### Option 1: Automated Setup
```bash
# Run the setup script
python start.py
```

### Option 2: Manual Setup
```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Set up environment
cp .env.example .env
# Edit .env with your configuration

# 3. Create directories
mkdir -p uploads logs

# 4. Start the server
python main.py
```

### Option 3: Development Mode
```bash
# Start with auto-reload
python run_dev.py

# Or using uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Configuration

### Environment Variables (.env)
```env
# Database
DATABASE_URL=sqlite:///./braillebridge.db

# Server
PORT=8000
HOST=0.0.0.0

# JWT
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads

# OCR
TESSERACT_CMD=/usr/bin/tesseract  # Windows: C:\Program Files\Tesseract-OCR\tesseract.exe
OCR_LANGUAGES=eng+hin+tam+tel+ben+guj+kan+mal+mar+ori+pan+urd

# TTS
TTS_LANGUAGE=en
TTS_RATE=150

# Braille
BRAILLE_GRADE=grade1
```

### Tesseract Configuration
```bash
# Check installed languages
tesseract --list-langs

# Test OCR
tesseract image.png output -l eng
```

## Verification

### 1. Check Installation
```bash
# Test Python dependencies
python -c "import fastapi, sqlalchemy, pytesseract, louis, pyttsx3; print('All dependencies installed')"

# Test Tesseract
tesseract --version

# Test FFmpeg
ffmpeg -version
```

### 2. Start the Server
```bash
python main.py
```

### 3. Test API Endpoints
```bash
# Health check
curl http://localhost:8000/api/health

# API documentation
open http://localhost:8000/docs
```

## Troubleshooting

### Common Issues

#### 1. Tesseract Not Found
```bash
# Error: tesseract is not installed or it's not in your PATH
# Solution: Install Tesseract and add to PATH
export PATH=$PATH:/usr/bin/tesseract
# Or set TESSERACT_CMD in .env
```

#### 2. Permission Denied
```bash
# Error: Permission denied for uploads directory
# Solution: Set proper permissions
chmod 755 uploads
```

#### 3. Database Connection Error
```bash
# Error: Database connection failed
# Solution: Check DATABASE_URL in .env
# For SQLite: DATABASE_URL=sqlite:///./braillebridge.db
# For PostgreSQL: DATABASE_URL=postgresql://user:password@localhost/braillebridge
```

#### 4. Import Errors
```bash
# Error: ModuleNotFoundError
# Solution: Install missing dependencies
pip install -r requirements.txt
```

### Performance Optimization

#### 1. Database Optimization
```python
# For production, use PostgreSQL
DATABASE_URL=postgresql://user:password@localhost/braillebridge
```

#### 2. File Storage
```python
# Use cloud storage for production
# AWS S3, Google Cloud Storage, etc.
```

#### 3. Caching
```python
# Add Redis for caching
pip install redis
```

## Production Deployment

### 1. Use Production Server
```bash
# Install Gunicorn
pip install gunicorn

# Run with Gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### 2. Set up Reverse Proxy
```nginx
# Nginx configuration
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 3. Environment Variables
```bash
# Set production environment
export NODE_ENV=production
export SECRET_KEY=your-production-secret-key
export DATABASE_URL=postgresql://user:password@localhost/braillebridge
```

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the logs in the `logs/` directory
3. Check the API documentation at `/docs`
4. Create an issue on GitHub

## License

This project is licensed under the MIT License.
