import pyttsx3
from gtts import gTTS
import os
import tempfile
from typing import Optional
from app.core.config import settings

class TTSService:
    def __init__(self):
        self.engine = None
        self._initialize_engine()
    
    def _initialize_engine(self):
        """Initialize the TTS engine."""
        try:
            self.engine = pyttsx3.init()
            
            # Set properties
            self.engine.setProperty('rate', settings.TTS_RATE)
            self.engine.setProperty('volume', 0.9)
            
            # Get available voices
            voices = self.engine.getProperty('voices')
            if voices:
                # Try to set a female voice if available
                for voice in voices:
                    if 'female' in voice.name.lower() or 'zira' in voice.name.lower():
                        self.engine.setProperty('voice', voice.id)
                        break
        except Exception as e:
            print(f"TTS engine initialization failed: {e}")
            self.engine = None
    
    def text_to_speech_local(self, text: str, output_path: str, language: str = "en") -> bool:
        """Convert text to speech using local engine."""
        try:
            if not self.engine:
                raise Exception("TTS engine not initialized")
            
            # Save to file
            self.engine.save_to_file(text, output_path)
            self.engine.runAndWait()
            
            return True
        except Exception as e:
            raise Exception(f"Local TTS conversion failed: {str(e)}")
    
    def text_to_speech_google(self, text: str, output_path: str, language: str = "en") -> bool:
        """Convert text to speech using Google TTS."""
        try:
            # Create gTTS object
            tts = gTTS(text=text, lang=language, slow=False)
            
            # Save to file
            tts.save(output_path)
            
            return True
        except Exception as e:
            raise Exception(f"Google TTS conversion failed: {str(e)}")
    
    def text_to_speech(self, text: str, output_path: str, language: str = "en", use_google: bool = False) -> bool:
        """Convert text to speech using specified method."""
        if use_google:
            return self.text_to_speech_google(text, output_path, language)
        else:
            return self.text_to_speech_local(text, output_path, language)
    
    def get_audio_duration(self, audio_path: str) -> Optional[float]:
        """Get duration of audio file in seconds."""
        try:
            # This is a simple implementation
            # In production, you might want to use librosa or similar
            import wave
            with wave.open(audio_path, 'rb') as audio_file:
                frames = audio_file.getnframes()
                rate = audio_file.getframerate()
                duration = frames / float(rate)
                return duration
        except Exception:
            return None
    
    def get_supported_languages(self) -> list:
        """Get list of supported languages."""
        return [
            {"code": "en", "name": "English"},
            {"code": "hi", "name": "Hindi"},
            {"code": "ta", "name": "Tamil"},
            {"code": "te", "name": "Telugu"},
            {"code": "bn", "name": "Bengali"},
            {"code": "gu", "name": "Gujarati"},
            {"code": "kn", "name": "Kannada"},
            {"code": "ml", "name": "Malayalam"},
            {"code": "mr", "name": "Marathi"},
            {"code": "or", "name": "Odia"},
            {"code": "pa", "name": "Punjabi"},
            {"code": "ur", "name": "Urdu"}
        ]
