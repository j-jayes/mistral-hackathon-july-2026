"""
User input models for voice and text processing.
"""

from pydantic import BaseModel, Field
from typing import Optional, Literal
from .location import Location


class UserInput(BaseModel):
    """Raw user input from voice or text."""
    
    text: str = Field(..., description="Raw text input from user")
    language: Optional[str] = Field("fr", description="Language of the input (default: French)")
    source: Optional[Literal["voice", "text"]] = Field("voice", description="Source of the input")
    
    class Config:
        json_schema_extra = {
            "example": {
                "text": "I am going to 21 rue des Gravilliers",
                "language": "fr",
                "source": "voice"
            }
        }


class DestinationInput(BaseModel):
    """Processed destination information."""
    
    address: str = Field(..., description="Extracted destination address")
    formatted_address: Optional[str] = Field(None, description="Formatted address from geocoding")
    location: Optional[Location] = Field(None, description="Geographic coordinates if geocoded")
    confidence: Optional[float] = Field(None, description="Confidence score of extraction (0-1)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "address": "21 rue des Gravilliers",
                "formatted_address": "21 Rue des Gravilliers, 75003 Paris, France",
                "location": {
                    "latitude": 48.8606,
                    "longitude": 2.3522
                },
                "confidence": 0.95
            }
        }


class VoiceInput(BaseModel):
    """Voice input data."""
    
    audio_data: str = Field(..., description="Base64 encoded audio data")
    audio_format: str = Field("wav", description="Format of audio data")
    sample_rate: int = Field(16000, description="Sample rate in Hz")
    language: str = Field("fr", description="Language of voice input")
    duration: Optional[float] = Field(None, description="Duration of recording in seconds")
    
    class Config:
        json_schema_extra = {
            "example": {
                "audio_data": "base64_encoded_audio_here",
                "audio_format": "wav",
                "sample_rate": 16000,
                "language": "fr",
                "duration": 2.5
            }
        }


class ProcessingResult(BaseModel):
    """Result from processing user input."""
    
    success: bool = Field(..., description="Whether processing was successful")
    destination: Optional[DestinationInput] = Field(None, description="Extracted destination")
    message: Optional[str] = Field(None, description="Message about the processing result")
    error: Optional[str] = Field(None, description="Error message if processing failed")
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "destination": {
                    "address": "21 rue des Gravilliers",
                    "formatted_address": "21 Rue des Gravilliers, 75003 Paris, France",
                    "location": {"latitude": 48.8606, "longitude": 2.3522},
                    "confidence": 0.95
                },
                "message": "Destination extracted successfully"
            }
        }