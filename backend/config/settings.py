"""
Application settings and configuration using Pydantic Settings Management.
"""

from functools import lru_cache
from typing import List, Optional
from pydantic import BaseSettings, AnyHttpUrl
from pydantic.env_settings import SettingsSourceCallable
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # App info
    APP_NAME: str = "Velib Parking Guide"
    DEBUG: bool = True
    VERSION: str = "1.0.0"
    
    # Backend configuration
    BACKEND_HOST: str = "localhost"
    BACKEND_PORT: int = 8000
    
    # Frontend configuration
    FRONTEND_URL: AnyHttpUrl = "http://localhost:3000"
    
    # Mistral API Configuration
    MISTRAL_API_KEY: Optional[str] = None
    MISTRAL_VOX_API_KEY: Optional[str] = None
    MISTRAL_API_URL: AnyHttpUrl = "https://api.mistral.ai/v1"
    MISTRAL_VOX_API_URL: AnyHttpUrl = "https://api.mistral.ai/v1/vox"
    
    # CORS Configuration
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    # Rate limiting
    RATE_LIMIT: int = 60  # requests per minute
    
    # Cache configuration
    STATION_CACHE_MINUTES: int = 5
    
    # External API endpoints
    VELIB_API_URL: AnyHttpUrl = "https://api.velib-metropole.fr/gbfs/en"
    GEOCODING_API_URL: AnyHttpUrl = "https://api.openrouteservice.org/geocode"
    
    # API keys for external services
    VELIB_API_KEY: Optional[str] = None
    GEOCODING_API_KEY: Optional[str] = None
    
    # Database (for future use)
    DATABASE_URL: str = "sqlite:///./velib_app.db"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


def get_mistral_api_key() -> str:
    """Get Mistral API key or raise error if not configured."""
    settings = get_settings()
    if not settings.MISTRAL_API_KEY:
        raise ValueError("MISTRAL_API_KEY not configured in environment variables")
    return settings.MISTRAL_API_KEY


def get_mistral_vox_api_key() -> str:
    """Get Mistral Vox API key or raise error if not configured."""
    settings = get_settings()
    if not settings.MISTRAL_VOX_API_KEY:
        raise ValueError("MISTRAL_VOX_API_KEY not configured in environment variables")
    return settings.MISTRAL_VOX_API_KEY