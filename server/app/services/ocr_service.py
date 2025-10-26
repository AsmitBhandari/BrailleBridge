import pytesseract
from PIL import Image
import PyPDF2
import io
from typing import Optional
import os
from pdf2image import convert_from_path
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
        """Extract text from PDF file using PyPDF2 (fallback method)."""
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
    
    def extract_text_from_pdf_with_ocr(self, pdf_path: str, language: str = "eng") -> str:
        """Extract text from PDF using OCR (better for scanned PDFs and multipage documents)."""
        try:
            # Convert PDF to images
            images = convert_from_path(pdf_path, dpi=300)
            
            all_text = []
            for i, image in enumerate(images):
                # Configure Tesseract for better OCR
                config = f'--oem 3 --psm 6 -l {language}'
                
                # Extract text from each page
                page_text = pytesseract.image_to_string(image, config=config)
                if page_text.strip():
                    all_text.append(f"--- Page {i + 1} ---\n{page_text.strip()}\n")
            
            return "\n".join(all_text).strip()
        except Exception as e:
            # Fallback to PyPDF2 if pdf2image fails
            return self.extract_text_from_pdf(pdf_path)
    
    def extract_text_from_document(self, file_path: str, file_type: str, language: str = "eng") -> str:
        """Extract text from various document types."""
        if file_type.lower() in ['.png', '.jpg', '.jpeg']:
            return self.extract_text_from_image(file_path, language)
        elif file_type.lower() == '.pdf':
            # Use OCR-based PDF extraction for better results with multipage PDFs
            return self.extract_text_from_pdf_with_ocr(file_path, language)
        else:
            raise Exception(f"Unsupported file type: {file_type}")
