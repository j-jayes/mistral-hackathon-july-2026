"""
User input domain models for Velib Parking App.
Represents different types of user input.
"""

from dataclasses import dataclass, field
from typing import Optional


@dataclass
class UserInput:
    """
    Represents raw user input, typically from voice recognition.
    
    Attributes:
        raw_text: The raw text input from the user
    """
    raw_text: str


@dataclass
class DestinationInput:
    """
    Represents a processed destination input.
    
    Attributes:
        address: The extracted destination address
    """
    address: str


@dataclass
class VoiceInput:
    """
    Represents voice input with audio data.
    
    Attributes:
        audio_data: Binary audio data from the microphone
        language: Language of the voice input (default: 'fr' for French)
    """
    audio_data: bytes
    language: str = "fr"
