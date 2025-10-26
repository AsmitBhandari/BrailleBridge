import pytesseract
from PIL import Image
import PyPDF2
import io
from typing import Optional
import os
from app.core.config import settings

class OCRService:
    def __init__(self):
        # Set Tesseract command if specified
        if settings.TESSERACT_CMD:
            pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD
    
    def extract_text_from_image(self, image_path: str, language: str = "eng") -> str:
        """Extract text from image using OCR."""
        try:
            # Open image
            image = Image.open(image_path)
            
            # Configure Tesseract
            config = f'--oem 3 --psm 6 -l {language}'
            
            # Extract text
            text = pytesseract.image_to_string(image, config=config)
            
            return text.strip()
        except Exception as e:
            raise Exception(f"OCR extraction failed: {str(e)}")
    
    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extract text from PDF file."""
        try:
            text = ""
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                
                for page_num in range(len(pdf_reader.pages)):
                    page = pdf_reader.pages[page_num]
                    text += page.extract_text() + "\n"
            
            return text.strip()
        except Exception as e:
            raise Exception(f"PDF text extraction failed: {str(e)}")
    
    def extract_text_from_document(self, file_path: str, file_type: str, language: str = "eng") -> str:
        """Extract text from various document types."""
        if file_type.lower() in ['.png', '.jpg', '.jpeg']:
            return self.extract_text_from_image(file_path, language)
        elif file_type.lower() == '.pdf':
            return self.extract_text_from_pdf(file_path)
        else:
            raise Exception(f"Unsupported file type: {file_type}")
