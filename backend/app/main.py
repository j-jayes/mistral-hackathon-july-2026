"""
Main FastAPI application for Velib Parking Guide.
"""

from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from typing import Optional, List
from datetime import datetime
import logging
import os

from ..config.settings import get_settings
from ..models.location import Location, LocationWithAddress
from ..models.velib import VelibStation, VelibStationSummary
from ..models.user import UserInput, VoiceInput, ProcessingResult, DestinationInput
from ..services.velib_service import VelibService
from ..services.llm_service import LLMService
from ..services.voice_service import VoiceService

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Velib Parking Guide API",
    description="Backend API for the Velib Parking Guide web app. Helps users find the closest Velib station with available parking docks.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Add CORS middleware
settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
velib_service = VelibService()
llm_service = LLMService()
voice_service = VoiceService()


# Dependency to get services
def get_velib_service():
    return velib_service


def get_llm_service():
    return llm_service


def get_voice_service():
    return voice_service


@app.on_event("startup")
async def startup_event():
    """Initialize services on startup."""
    logger.info("Starting Velib Parking Guide API...")
    await llm_service.initialize()
    await voice_service.initialize()
    logger.info("Services initialized")


@app.on_event("shutdown")
async def shutdown_event():
    """Clean up services on shutdown."""
    logger.info("Shutting down Velib Parking Guide API...")
    await llm_service.close()
    await voice_service.close()
    logger.info("Services closed")


# ==================== Location Endpoints ====================

@app.get("/api/location/geocode", response_model=LocationWithAddress)
async def geocode_address(
    address: str = Query(..., description="Address to geocode")
):
    """
    Convert an address to geographic coordinates.
    
    In production, this would use a geocoding API.
    For demo purposes, returns mock coordinates for Paris addresses.
    """
    # Mock implementation - in production use geocoding API
    if "paris" in address.lower():
        return LocationWithAddress(
            latitude=48.8566,
            longitude=2.3522,
            address=address,
            formatted_address=f"{address}, Paris, France"
        )
    else:
        return LocationWithAddress(
            latitude=48.8566,
            longitude=2.3522,
            address=address,
            formatted_address=address
        )


# ==================== Velib Station Endpoints ====================

@app.get("/api/stations", response_model=List[VelibStationSummary])
async def get_stations(
    latitude: float = Query(..., description="User's latitude"),
    longitude: float = Query(..., description="User's longitude"),
    radius: float = Query(1000, description="Search radius in meters (default: 1000)"),
    force_refresh: bool = Query(False, description="Force refresh station data")
):
    """
    Get all Velib stations with available docks within a radius.
    
    Args:
        latitude: User's current latitude
        longitude: User's current longitude
        radius: Search radius in meters
        force_refresh: Whether to force refresh station data
    """
    user_location = Location(latitude=latitude, longitude=longitude)
    stations = await velib_service.get_stations_with_available_docks(
        user_location, 
        radius_meters=radius
    )
    return stations


@app.get("/api/stations/closest", response_model=VelibStation)
async def get_closest_station(
    latitude: float = Query(..., description="User's latitude"),
    longitude: float = Query(..., description="User's longitude"),
    max_distance: float = Query(1000, description="Maximum distance in meters (default: 1000)")
):
    """
    Find the closest Velib station with available docks.
    
    Args:
        latitude: User's current latitude
        longitude: User's current longitude
        max_distance: Maximum distance to search in meters
    """
    user_location = Location(latitude=latitude, longitude=longitude)
    station = await velib_service.get_closest_station_with_available_docks(
        user_location,
        max_distance_meters=max_distance
    )
    
    if not station:
        raise HTTPException(
            status_code=404,
            detail=f"No stations with available docks found within {max_distance}m"
        )
    
    return station


@app.get("/api/stations/{station_id}", response_model=VelibStation)
async def get_station_by_id(station_id: str):
    """
    Get a specific Velib station by its ID.
    
    Args:
        station_id: The station ID to retrieve
    """
    station = await velib_service.get_station_by_id(station_id)
    
    if not station:
        raise HTTPException(
            status_code=404,
            detail=f"Station with ID {station_id} not found"
        )
    
    return station


@app.post("/api/stations/refresh")
async def refresh_stations():
    """
    Force refresh of Velib station data.
    """
    velib_service.refresh_cache()
    return JSONResponse(content={"message": "Station data cache refreshed"})


# ==================== LLM / NLP Endpoints ====================

@app.post("/api/nlp/extract-destination", response_model=ProcessingResult)
async def extract_destination(
    user_input: UserInput
):
    """
    Extract destination from user input text using Mistral LLM.
    
    Args:
        user_input: UserInput object with text to process
    """
    result = await llm_service.extract_destination(user_input)
    return ProcessingResult(
        success=result.success,
        destination=result.destination,
        message=result.message,
        error=result.error
    )


@app.post("/api/nlp/analyze")
async def analyze_text(
    text: str,
    prompt: Optional[str] = None
):
    """
    Analyze text using Mistral LLM.
    
    Args:
        text: Text to analyze
        prompt: Custom prompt for analysis
    """
    result = await llm_service.analyze_text(text, prompt)
    return {"result": result}


# ==================== Voice Input Endpoints ====================

@app.post("/api/voice/transcribe", response_model=ProcessingResult)
async def transcribe_audio(
    audio_file: UploadFile = File(..., description="Audio file to transcribe"),
    language: str = Query("fr", description="Language of the audio")
):
    """
    Transcribe audio file using Mistral Vox.
    
    Args:
        audio_file: Audio file to transcribe
        language: Language of the audio (default: "fr")
    """
    result = await voice_service.transcribe_audio(audio_file, language)
    return ProcessingResult(
        success=result.success,
        destination=result.destination,
        message=result.message,
        error=result.error
    )


@app.post("/api/voice/process", response_model=ProcessingResult)
async def process_voice_input(
    audio_file: UploadFile = File(..., description="Audio file to process"),
    language: str = Query("fr", description="Language of the audio")
):
    """
    Process voice input: transcribe and extract destination in one step.
    
    Args:
        audio_file: Audio file to process
        language: Language of the audio (default: "fr")
    """
    result = await voice_service.process_voice_input(audio_file, language)
    return ProcessingResult(
        success=result.success,
        destination=result.destination,
        message=result.message,
        error=result.error
    )


@app.get("/api/voice/languages")
async def get_supported_languages():
    """
    Get list of supported languages for voice input.
    """
    return {"languages": voice_service.supported_languages}


# ==================== Health Check Endpoints ====================

@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "services": {
            "velib": "operational",
            "llm": "operational" if await llm_service._can_use_mistral_api() else "limited",
            "voice": "operational" if await voice_service._can_use_vox_api() else "limited"
        }
    }


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": "Velib Parking Guide API",
        "version": "1.0.0",
        "description": "Backend API for finding Velib stations with available parking docks",
        "docs": "/docs",
        "redoc": "/redoc"
    }


# Mount static files (for frontend in production)
# In development, frontend runs separately on port 3000
# In production, you can serve the built React app from here
# app.mount("/", StaticFiles(directory="../frontend/build", html=True), name="frontend")


if __name__ == "__main__":
    import uvicorn
    
    settings = get_settings()
    uvicorn.run(
        "app.main:app",
        host=settings.BACKEND_HOST,
        port=settings.BACKEND_PORT,
        reload=settings.DEBUG,
        log_level="debug" if settings.DEBUG else "info"
    )