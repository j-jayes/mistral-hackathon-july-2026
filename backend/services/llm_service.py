"""
LLM Service - Processes user input using Mistral models.
"""

import asyncio
import json
import re
from typing import Optional, List, Dict, Any
from fastapi import HTTPException
import httpx

from ..models.user import UserInput, DestinationInput, ProcessingResult
from ..config.settings import get_mistral_api_key, get_settings


class LLMService:
    """
    Service for processing user input using Mistral LLM models.
    Handles destination extraction and NLP tasks.
    """
    
    # Patterns for destination extraction (fallback if API fails)
    DESTINATION_PATTERNS = [
        r"going to (.*?)(?:\.|\?|$)",
        r"going (?:to|at) (.*?)(?:\.|\?|$)",
        r"want to go to (.*?)(?:\.|\?|$)",
        r"find (?:me )?a velib (?:station )?near (.*?)(?:\.|\?|$)",
        r"I am going to (.*?)(?:\.|\?|$)",
        r"find a station near (.*?)(?:\.|\?|$)",
        r"je vais (?:au|à la|à l')? (.*?)(?:\.|\?|$)",
        r"je veux aller (?:au|à la|à l')? (.*?)(?:\.|\?|$)",
        r"trouvez (?:une station velib|un velib) près de (.*?)(?:\.|\?|$)",
        r"proche de (.*?)(?:\.|\?|$)",
        r"près de (.*?)(?:\.|\?|$)",
        r"at (.*?)(?:\.|\?|$)",
        r"to (.*?)(?:\.|\?|$)",
    ]
    
    def __init__(self):
        self._client: Optional[httpx.AsyncClient] = None
        self._model_name: str = "mistral-small-latest"
    
    async def initialize(self) -> None:
        """Initialize the HTTP client."""
        self._client = httpx.AsyncClient(timeout=30.0)
    
    async def close(self) -> None:
        """Close the HTTP client."""
        if self._client:
            await self._client.aclose()
            self._client = None
    
    async def extract_destination(self, user_input: UserInput) -> ProcessingResult:
        """
        Extract destination from user input using Mistral LLM.
        
        Args:
            user_input: UserInput object with text to process
            
        Returns:
            ProcessingResult with extracted destination
        """
        try:
            # First, try to use Mistral API
            if await self._can_use_mistral_api():
                result = await self._extract_with_mistral_api(user_input)
                if result.success:
                    return result
            
            # Fallback to pattern matching
            return await self._extract_with_patterns(user_input)
            
        except Exception as e:
            return ProcessingResult(
                success=False,
                error=f"Error extracting destination: {str(e)}"
            )
    
    async def _can_use_mistral_api(self) -> bool:
        """Check if Mistral API is available."""
        try:
            api_key = get_mistral_api_key()
            return bool(api_key and api_key.strip())
        except ValueError:
            return False
    
    async def _extract_with_mistral_api(self, user_input: UserInput) -> ProcessingResult:
        """
        Extract destination using Mistral API.
        
        Args:
            user_input: UserInput object
            
        Returns:
            ProcessingResult with extracted destination
        """
        api_key = get_mistral_api_key()
        settings = get_settings()
        
        prompt = f"""
        You are a helpful assistant that extracts destination addresses from user input.
        The user is speaking about where they want to go in Paris and wants to find a Velib station.
        
        Extract the destination address from the following text.
        Only return the destination address as plain text, without any additional commentary.
        
        User input: "{user_input.text}"
        
        Destination address:
        """
        
        try:
            if not self._client:
                await self.initialize()
            
            response = await self._client.post(
                f"{settings.MISTRAL_API_URL}/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": self._model_name,
                    "messages": [
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "temperature": 0.1,
                    "max_tokens": 200
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Mistral API error: {response.text}"
                )
            
            data = response.json()
            extracted_address = data["choices"][0]["message"]["content"].strip()
            
            # Clean up the address
            extracted_address = extracted_address.replace('"', '').replace("'", "")
            
            return ProcessingResult(
                success=True,
                destination=DestinationInput(
                    address=extracted_address,
                    confidence=0.95
                ),
                message="Destination extracted using Mistral LLM"
            )
            
        except Exception as e:
            return ProcessingResult(
                success=False,
                error=f"Mistral API error: {str(e)}"
            )
    
    async def _extract_with_patterns(self, user_input: UserInput) -> ProcessingResult:
        """
        Extract destination using pattern matching (fallback method).
        
        Args:
            user_input: UserInput object
            
        Returns:
            ProcessingResult with extracted destination
        """
        text = user_input.text.strip()
        
        # Try each pattern
        for pattern in self.DESTINATION_PATTERNS:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                address = match.group(1).strip().rstrip('.?')
                return ProcessingResult(
                    success=True,
                    destination=DestinationInput(
                        address=address,
                        confidence=0.8
                    ),
                    message="Destination extracted using pattern matching"
                )
        
        # If no pattern matched, use the entire text as address
        return ProcessingResult(
            success=True,
            destination=DestinationInput(
                address=text,
                confidence=0.5
            ),
            message="Used entire input as destination"
        )
    
    async def analyze_text(self, text: str, prompt: str = "") -> str:
        """
        Analyze text using Mistral LLM.
        
        Args:
            text: Text to analyze
            prompt: Custom prompt for analysis
            
        Returns:
            LLM-generated response
        """
        try:
            api_key = get_mistral_api_key()
            settings = get_settings()
            
            if not api_key:
                return f"Processed: {text}"  # Fallback
            
            full_prompt = f"{prompt}\n\nText: {text}" if prompt else text
            
            if not self._client:
                await self.initialize()
            
            response = await self._client.post(
                f"{settings.MISTRAL_API_URL}/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": self._model_name,
                    "messages": [
                        {
                            "role": "user",
                            "content": full_prompt
                        }
                    ],
                    "temperature": 0.7,
                    "max_tokens": 500
                }
            )
            
            if response.status_code != 200:
                return f"Error: {response.text}"
            
            data = response.json()
            return data["choices"][0]["message"]["content"].strip()
            
        except Exception as e:
            return f"Error: {str(e)}"