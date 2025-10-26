# BrailleBridge Backend

AI-powered Braille Translator for Educational Materials - Python Backend

## Features

- **User Authentication**: JWT-based authentication with user registration and login
- **Document Processing**: Upload and process various document types (PDF, images, text)
- **OCR Integration**: Extract text from images and PDFs using Tesseract
- **Braille Conversion**: Convert text to Grade 1 and Grade 2 Braille using Louis
- **Text-to-Speech**: Generate audio files from text using pyttsx3 and gTTS
- **Multi-language Support**: Support for 12 Indian languages
- **File Management**: Secure file upload and storage
- **Translation Tracking**: Track and manage Braille translations

## Tech Stack

- **FastAPI**: Modern, fast web framework for building APIs
- **SQLAlchemy**: SQL toolkit and ORM
- **PostgreSQL/SQLite**: Database
- **JWT**: Authentication
- **Tesseract**: OCR engine
- **Louis**: Braille translation
- **pyttsx3/gTTS**: Text-to-speech
- **Pillow**: Image processing
- **PyPDF2**: PDF processing

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd BrailleBridge/server
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Install system dependencies**
   
   **For OCR (Tesseract):**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install tesseract-ocr tesseract-ocr-eng tesseract-ocr-hin
   
   # macOS
   brew install tesseract
   
   # Windows
   # Download from: https://github.com/UB-Mannheim/tesseract/wiki
   ```

5. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

6. **Run the application**
   ```bash
   python main.py
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update user profile
- `PUT /api/auth/preferences` - Update user preferences
- `POST /api/auth/logout` - Logout user

### Documents
- `POST /api/documents/upload` - Upload document
- `POST /api/documents/{id}/process` - Process document
- `GET /api/documents/` - Get user documents
- `GET /api/documents/{id}` - Get specific document
- `DELETE /api/documents/{id}` - Delete document

### Translations
- `GET /api/translations/` - Get user translations
- `GET /api/translations/{id}` - Get specific translation
- `PUT /api/translations/{id}/verify` - Verify translation
- `POST /api/translations/{id}/feedback` - Add feedback
- `GET /api/translations/stats/overview` - Get translation stats

## Configuration

### Environment Variables

- `DATABASE_URL`: Database connection string
- `SECRET_KEY`: JWT secret key
- `UPLOAD_DIR`: Directory for file uploads
- `MAX_FILE_SIZE`: Maximum file size in bytes
- `TESSERACT_CMD`: Path to Tesseract executable
- `OCR_LANGUAGES`: Supported OCR languages

### Supported Languages

- English (en)
- Hindi (hi)
- Tamil (ta)
- Telugu (te)
- Bengali (bn)
- Gujarati (gu)
- Kannada (kn)
- Malayalam (ml)
- Marathi (mr)
- Odia (or)
- Punjabi (pa)
- Urdu (ur)

## Development

### Running in Development Mode
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### API Documentation
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Production Deployment

1. **Set up production database** (PostgreSQL recommended)
2. **Configure environment variables**
3. **Set up reverse proxy** (Nginx)
4. **Use production WSGI server** (Gunicorn)
5. **Enable HTTPS**
6. **Set up monitoring and logging**

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.
