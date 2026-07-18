"""
LLMService for Velib Parking App.
Handles NLP processing using a small Mistral model for extracting destinations.
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from ..domain.user_input import UserInput, DestinationInput


class LLMService:
    """
    Service for processing user input using a small Mistral LLM.
    
    Extracts destinations from natural language user input.
    """
    
    def __init__(self):
        """Initialize the LLM service."""
        self._model_name: str = "mistral-small-latest"
        self._is_ready: bool = True
        self._last_request_time: Optional[datetime] = None
        self._request_count: int = 0
        
        # Simple patterns for destination extraction (for demo purposes)
        self._patterns = [
            r"going to (.*?)(?:\.|\?|$)",
            r"going (?:to|at) (.*?)(?:\.|\?|$)",
            r"want to go to (.*?)(?:\.|\?|$)",
            r"find (?:me )?a velib (?:station )?near (.*?)(?:\.|\?|$)",
            r"I am going to (.*?)(?:\.|\?|$)",
            r"Je vais (?:au|à la|à l')? (.*?)(?:\.|\?|$)",
            r"Je veux aller (?:au|à la|à l')? (.*?)(?:\.|\?|$)",
            r"Trouvez (?:une station velib|un velib) près de (.*?)(?:\.|\?|$)",
        ]
    
    @property
    def model_name(self) -> str:
        """Get the model name."""
        return self._model_name
    
    @property
    def is_ready(self) -> bool:
        """Check if the LLM is ready for requests."""
        return self._is_ready
    
    def extract_destination(self, user_input: UserInput) -> DestinationInput:
        """
        Extract destination from user input using the LLM.
        
        Args:
            user_input: UserInput object containing raw text
            
        Returns:
            DestinationInput object with extracted address
        """
        import re
        
        raw_text = user_input.raw_text.strip()
        
        # In production, this would call the Mistral API:
        # response = mistral_client.chat(
        #     model=self._model_name,
        #     messages=[
        #         {
        #             "role": "user",
        #             "content": f"Extract the destination address from this text: {raw_text}"
        #         }
        #     ]
        # )
        # address = response.choices[0].message.content
        
        # For demo/testing purposes, use pattern matching
        address = self._extract_destination_with_patterns(raw_text)
        
        # Clean up the extracted address
        if address:
            address = address.strip().rstrip('.?')
        else:
            # If no pattern matched, use the entire text as address
            address = raw_text
        
        self._request_count += 1
        self._last_request_time = datetime.now()
        
        return DestinationInput(address=address)
    
    def _extract_destination_with_patterns(self, text: str) -> str:
        """
        Extract destination using predefined patterns.
        
        Args:
            text: Text to search for destination
            
        Returns:
            Extracted destination address
        """
        import re
        
        for pattern in self._patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1)
        
        return ""
    
    def analyze_text(self, text: str, prompt: str = "") -> str:
        """
        Analyze text using the LLM (for more complex processing).
        
        Args:
            text: Text to analyze
            prompt: Custom prompt for analysis
            
        Returns:
            LLM-generated response
        """
        # In production, this would call the Mistral API
        if prompt:
            full_prompt = f"{prompt}\n\nText: {text}"
        else:
            full_prompt = text
        
        # For demo purposes
        return f"Processed: {text}"
    
    def get_request_stats(self) -> Dict[str, Any]:
        """
        Get statistics about LLM usage.
        
        Returns:
            Dictionary with request statistics
        """
        return {
            "model": self._model_name,
            "is_ready": self._is_ready,
            "request_count": self._request_count,
            "last_request_time": self._last_request_time
        }
