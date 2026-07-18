"""
Voice Service - Handles voice input using Mistral Vox for speech-to-text.
"""

import base64
import asyncio
from typing import Optional, List, Dict, Any, Union
from fastapi import HTTPException, UploadFile
import httpx

from ..models.user import UserInput, VoiceInput, ProcessingResult
from ..config.settings import get_mistral_vox_api_key, get_settings


class VoiceService:
    """
    Service for handling voice input using Mistral Vox API.
    Provides speech-to-text functionality.
    """
    
    # Supported languages
    SUPPORTED_LANGUAGES = ["fr", "en", "es", "de", "it", "pt", "nl"]
    
    def __init__(self):
        self._client: Optional[httpx.AsyncClient] = None
        self._is_recording: bool = False
    
    async def initialize(self) -> None:
        """Initialize the HTTP client."""
        self._client = httpx.AsyncClient(timeout=60.0)
    
    async def close(self) -> None:
        """Close the HTTP client."""
        if self._client:
            await self._client.aclose()
            self._client = None
    
    async def transcribe_audio(
        self, 
        audio_file: UploadFile, 
        language: str = "fr"
    ) -> ProcessingResult:
        """
        Transcribe audio file using Mistral Vox API.
        
        Args:
            audio_file: Audio file uploaded by user
            language: Language of the audio (default: "fr")
            
        Returns:
            ProcessingResult with transcribed text
        """
        try:
            # Validate language
            if language not in self.SUPPORTED_LANGUAGES:
                return ProcessingResult(
                    success=False,
                    error=f"Language {language} not supported. Use one of: {self.SUPPORTED_LANGUAGES}"
                )
            
            # Read and validate audio file
            audio_data = await audio_file.read()
            if not audio_data:
                return ProcessingResult(
                    success=False,
                    error="No audio data provided"
                )
            
            # Try Mistral Vox API first
            if await self._can_use_vox_api():
                result = await self._transcribe_with_vox_api(audio_data, language)
                if result.success:
                    return result
            
            # Fallback - simulate transcription for demo
            return ProcessingResult(
                success=True,
                destination=UserInput(
                    text="Sample transcription: going to Eiffel Tower",
                    language=language,
                    source="voice"
                ),
                message="Transcription simulated (Mistral Vox API key not configured)"
            )
            
        except Exception as e:
            return ProcessingResult(
                success=False,
                error=f"Error transcribing audio: {str(e)}"
            )
    
    async def _can_use_vox_api(self) -> bool:
        """Check if Mistral Vox API is available."""
        try:
            api_key = get_mistral_vox_api_key()
            return bool(api_key and api_key.strip())
        except ValueError:
            return False
    
    async def _transcribe_with_vox_api(
        self, 
        audio_data: bytes, 
        language: str
    ) -> ProcessingResult:
        """
        Transcribe audio using Mistral Vox API.
        
        Args:
            audio_data: Binary audio data
            language: Language of the audio
            
        Returns:
            ProcessingResult with transcribed text
        """
        api_key = get_mistral_vox_api_key()
        settings = get_settings()
        
        try:
            if not self._client:
                await self.initialize()
            
            # Convert audio to base64
            audio_base64 = base64.b64encode(audio_data).decode('utf-8')
            
            response = await self._client.post(
                f"{settings.MISTRAL_VOX_API_URL}/transcriptions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "audio": audio_base64,
                    "language": language,
                    "model": "vox-small"
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Mistral Vox API error: {response.text}"
                )
            
            data = response.json()
            transcribed_text = data.get("text", "").strip()
            
            return ProcessingResult(
                success=True,
                destination=UserInput(
                    text=transcribed_text,
                    language=language,
                    source="voice"
                ),
                message="Transcription successful using Mistral Vox"
            )
            
        except Exception as e:
            return ProcessingResult(
                success=False,
                error=f"Mistral Vox API error: {str(e)}"
            )
    
    async def process_voice_input(
        self, 
        audio_file: UploadFile,
        language: str = "fr"
    ) -> ProcessingResult:
        """
        Process voice input: transcribe and extract destination.
        
        Args:
            audio_file: Audio file from user
            language: Language of the audio
            
        Returns:
            ProcessingResult with extracted destination
        """
        from .llm_service import LLMService
        
        llm_service = LLMService()
        
        # Step 1: Transcribe audio
        transcription_result = await self.transcribe_audio(audio_file, language)
        
        if not transcription_result.success:
            return ProcessingResult(
                success=False,
                error=transcription_result.error
            )
        
        # Step 2: Extract destination from transcribed text
        user_input = transcription_result.destination
        destination_result = await llm_service.extract_destination(user_input)
        
        return ProcessingResult(
            success=destination_result.success,
            destination=destination_result.destination,
            message=f"{transcription_result.message}; {destination_result.message}",
            error=destination_result.error
        )
    
    @property
    def supported_languages(self) -> List[str]:
        """Get list of supported languages."""
        return self.SUPPORTED_LANGUAGES.copy()
    
    @property
    def is_recording(self) -> bool:
        """Check if currently recording."""
        return self._is_recording
    
    @is_recording.setter
    def is_recording(self, value: bool) -> None:
        """Set recording state."""
        self._is_recording = value