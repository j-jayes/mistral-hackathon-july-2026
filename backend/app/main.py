"""
Main FastAPI application for Velib Parking Guide.
"""

from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from typing import Optional, List
from datetime import datetime
from pathlib import Path
import logging
import os
import httpx

from ..config.settings import get_settings, get_geocoding_api_key
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
_cors_origins = settings.allowed_origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    # Browsers reject wildcard origin + credentials; the single-container deploy
    # is same-origin so credentials aren't needed there anyway.
    allow_credentials=_cors_origins != ["*"],
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

async def _google_geocode(address: str, api_key: str) -> Optional[LocationWithAddress]:
    """Call the Google Geocoding API to resolve an address to coordinates.

    Returns a LocationWithAddress on success, or None if the address could not
    be resolved (so the caller can decide how to fall back).
    """
    params = {
        "address": address,
        "key": api_key,
        # Bias results toward France / Paris so short queries resolve well.
        "region": "fr",
        "components": "country:FR",
    }
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(str(settings.GEOCODING_API_URL), params=params)
        resp.raise_for_status()
        data = resp.json()

    status = data.get("status")
    if status == "OK" and data.get("results"):
        result = data["results"][0]
        loc = result["geometry"]["location"]
        return LocationWithAddress(
            latitude=loc["lat"],
            longitude=loc["lng"],
            address=address,
            formatted_address=result.get("formatted_address", address),
        )

    if status == "ZERO_RESULTS":
        return None

    # REQUEST_DENIED / OVER_QUERY_LIMIT / INVALID_REQUEST etc.
    logger.warning(
        "Google Geocoding returned status=%s error=%s for address=%r",
        status, data.get("error_message"), address,
    )
    raise HTTPException(status_code=502, detail=f"Geocoding provider error: {status}")


@app.get("/api/location/geocode", response_model=LocationWithAddress)
async def geocode_address(
    address: str = Query(..., description="Address to geocode")
):
    """
    Convert an address to geographic coordinates using the Google Geocoding API.

    Falls back to Paris center when no API key is configured, so the demo keeps
    working; the frontend has its own pattern-matching fallback on top of this.
    """
    api_key = get_geocoding_api_key()

    if api_key:
        try:
            result = await _google_geocode(address, api_key)
            if result is not None:
                return result
            logger.info("Geocoding found no results for address=%r", address)
        except HTTPException:
            raise
        except Exception as exc:  # network/parse errors -> graceful fallback
            logger.warning("Geocoding request failed for %r: %s", address, exc)
    else:
        logger.info("GEOCODING_API_KEY not set; returning Paris-center fallback")

    # Fallback: Paris center (keeps the app usable without a key / when unresolved)
    return LocationWithAddress(
        latitude=48.8566,
        longitude=2.3522,
        address=address,
        formatted_address=f"{address}, Paris, France" if "paris" in address.lower() else address,
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


@app.get("/api")
async def api_root():
    """API information endpoint (the SPA is served at '/')."""
    return {
        "name": "Velib Parking Guide API",
        "version": "1.0.0",
        "description": "Backend API for finding Velib stations with available parking docks",
        "docs": "/docs",
        "redoc": "/redoc"
    }


# ==================== Frontend (SPA) Serving ====================
# In production (single-container deploy) the built React app is served from
# the same origin as the API. Enabled via SERVE_FRONTEND=true.
#
# The build directory is resolved from an absolute FRONTEND_BUILD_DIR if given,
# otherwise from this file's location (repo_root/frontend/build) -- NOT the
# process CWD, which would be wrong inside the container.
def _resolve_frontend_dir() -> Path:
    configured = settings.FRONTEND_BUILD_DIR
    if configured and os.path.isabs(configured):
        return Path(configured)
    # main.py lives at <root>/backend/app/main.py -> parents[2] == <root>
    return Path(__file__).resolve().parents[2] / "frontend" / "build"


FRONTEND_DIR = _resolve_frontend_dir()

if settings.SERVE_FRONTEND and FRONTEND_DIR.exists():
    logger.info("Serving frontend SPA from %s", FRONTEND_DIR)

    # Vite emits hashed assets under /assets; mount them for cache-friendly serving.
    assets_dir = FRONTEND_DIR / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    _INDEX_FILE = FRONTEND_DIR / "index.html"

    @app.get("/{full_path:path}")
    async def spa_catch_all(full_path: str):
        """Serve static files, falling back to index.html for SPA routing."""
        # Never let the SPA fallback shadow the API / docs surface.
        if full_path.startswith(("api", "docs", "redoc", "openapi.json")):
            raise HTTPException(status_code=404, detail="Not found")

        # Serve a real static file if it exists (favicon, manifest, icons, etc.).
        candidate = (FRONTEND_DIR / full_path).resolve()
        if str(candidate).startswith(str(FRONTEND_DIR.resolve())) and candidate.is_file():
            return FileResponse(str(candidate))

        # Otherwise return the SPA entry point (client-side routing handles it).
        return FileResponse(str(_INDEX_FILE))
elif settings.SERVE_FRONTEND:
    logger.warning(
        "SERVE_FRONTEND=true but build dir %s does not exist; serving API only",
        FRONTEND_DIR,
    )


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