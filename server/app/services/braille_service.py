import re

class BrailleService:
    def __init__(self):
        # Simple Braille mapping for demonstration
        # In production, you would use a proper Braille library like Louis
        self.braille_map = {
            'a': '⠁', 'b': '⠃', 'c': '⠉', 'd': '⠙', 'e': '⠑',
            'f': '⠋', 'g': '⠛', 'h': '⠓', 'i': '⠊', 'j': '⠚',
            'k': '⠅', 'l': '⠇', 'm': '⠍', 'n': '⠝', 'o': '⠕',
            'p': '⠏', 'q': '⠟', 'r': '⠗', 's': '⠎', 't': '⠞',
            'u': '⠥', 'v': '⠧', 'w': '⠺', 'x': '⠭', 'y': '⠽',
            'z': '⠵', ' ': ' ', '.': '⠲', ',': '⠂', '!': '⠖',
            '?': '⠦', ':': '⠒', ';': '⠆', '-': '⠤', '(': '⠐⠣',
            ')': '⠐⠜', '0': '⠴', '1': '⠂', '2': '⠆', '3': '⠒',
            '4': '⠲', '5': '⠢', '6': '⠖', '7': '⠶', '8': '⠦',
            '9': '⠔'
        }
    
    def text_to_braille_grade1(self, text: str, language: str = "en") -> str:
        """Convert text to Grade 1 Braille."""
        try:
            # Clean text
            cleaned_text = self._clean_text(text)
            
            # Convert to Grade 1 Braille using simple mapping
            braille_text = self._simple_braille_conversion(cleaned_text)
            
            return braille_text
        except Exception as e:
            raise Exception(f"Grade 1 Braille conversion failed: {str(e)}")
    
    def text_to_braille_grade2(self, text: str, language: str = "en") -> str:
        """Convert text to Grade 2 Braille (contracted)."""
        try:
            # Clean text
            cleaned_text = self._clean_text(text)
            
            # For Grade 2, we'll use the same mapping for now
            # In production, you would implement proper Grade 2 contractions
            braille_text = self._simple_braille_conversion(cleaned_text)
            
            return braille_text
        except Exception as e:
            raise Exception(f"Grade 2 Braille conversion failed: {str(e)}")
    
    def text_to_braille(self, text: str, grade: str = "grade1", language: str = "en") -> str:
        """Convert text to Braille with specified grade."""
        if grade == "grade1":
            return self.text_to_braille_grade1(text, language)
        elif grade == "grade2":
            return self.text_to_braille_grade2(text, language)
        else:
            raise Exception(f"Invalid Braille grade: {grade}")
    
    def _clean_text(self, text: str) -> str:
        """Clean and prepare text for Braille conversion."""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove special characters that might cause issues
        text = re.sub(r'[^\w\s.,!?;:()\-]', '', text)
        
        # Ensure proper spacing
        text = text.strip()
        
        return text
    
    def _simple_braille_conversion(self, text: str) -> str:
        """Simple Braille conversion using character mapping."""
        braille_text = ""
        for char in text.lower():
            if char in self.braille_map:
                braille_text += self.braille_map[char]
            else:
                braille_text += char  # Keep unknown characters as-is
        return braille_text
    
    def get_braille_info(self, text: str) -> dict:
        """Get information about the Braille conversion."""
        try:
            grade1_braille = self.text_to_braille_grade1(text)
            grade2_braille = self.text_to_braille_grade2(text)
            
            return {
                "original_length": len(text),
                "grade1_length": len(grade1_braille),
                "grade2_length": len(grade2_braille),
                "grade1_ratio": len(grade1_braille) / len(text) if text else 0,
                "grade2_ratio": len(grade2_braille) / len(text) if text else 0
            }
        except Exception as e:
            raise Exception(f"Braille analysis failed: {str(e)}")
