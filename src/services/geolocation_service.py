"""
GeolocationService for Velib Parking App.
Handles browser geolocation API to get user's current location.
"""

from typing import Optional, Callable
from ..domain.location import Location


class GeolocationService:
    """
    Service for accessing the browser's geolocation API.
    
    Provides current user location and handles geolocation events.
    """
    
    def __init__(self):
        """Initialize the geolocation service."""
        self._current_location: Optional[Location] = None
        self._on_location_change: Optional[Callable[[Location], None]] = None
        self._on_error: Optional[Callable[[str], None]] = None
        self._watch_id: Optional[int] = None
    
    @property
    def current_location(self) -> Optional[Location]:
        """Get the current user location."""
        return self._current_location
    
    @property
    def on_location_change(self) -> Optional[Callable[[Location], None]]:
        """Callback for when location changes."""
        return self._on_location_change
    
    @on_location_change.setter
    def on_location_change(self, callback: Optional[Callable[[Location], None]]) -> None:
        """Set callback for location changes."""
        self._on_location_change = callback
    
    @property
    def on_error(self) -> Optional[Callable[[str], None]]:
        """Callback for geolocation errors."""
        return self._on_error
    
    @on_error.setter
    def on_error(self, callback: Optional[Callable[[str], None]]) -> None:
        """Set callback for geolocation errors."""
        self._on_error = callback
    
    def get_current_location(self) -> Location:
        """
        Get the current user location.
        
        In a browser environment, this would use the Geolocation API.
        For testing purposes, this returns a mock location.
        
        Returns:
            Location object with current user coordinates
        """
        # In production, this would use:
        # navigator.geolocation.getCurrentPosition()
        # For now, return a mock location for Paris
        if self._current_location is None:
            self._current_location = Location(latitude=48.8566, longitude=2.3522)
        return self._current_location
    
    def start_watching_position(self) -> None:
        """
        Start watching the user's position for changes.
        
        In a browser environment, this would use watchPosition().
        """
        # In production:
        # self._watch_id = navigator.geolocation.watchPosition()
        pass
    
    def stop_watching_position(self) -> None:
        """
        Stop watching the user's position.
        """
        # In production:
        # if self._watch_id:
        #     navigator.geolocation.clearWatch(self._watch_id)
        self._watch_id = None
    
    def _handle_location_success(self, position: dict) -> None:
        """
        Handle successful location retrieval.
        
        Args:
            position: Position data from geolocation API
        """
        # Extract coordinates from position
        latitude = position.get('coords', {}).get('latitude', 0)
        longitude = position.get('coords', {}).get('longitude', 0)
        
        self._current_location = Location(latitude=latitude, longitude=longitude)
        
        if self._on_location_change:
            self._on_location_change(self._current_location)
    
    def _handle_location_error(self, error: str) -> None:
        """
        Handle geolocation errors.
        
        Args:
            error: Error message
        """
        if self._on_error:
            self._on_error(error)
