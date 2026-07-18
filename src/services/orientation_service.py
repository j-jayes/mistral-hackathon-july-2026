"""
OrientationService for Velib Parking App.
Handles browser device orientation API to get compass heading.
"""

from typing import Optional, Callable
import math


class OrientationService:
    """
    Service for accessing the browser's device orientation API.
    
    Provides compass heading information for direction calculations.
    """
    
    def __init__(self):
        """Initialize the orientation service."""
        self._current_heading: float = 0.0
        self._on_heading_change: Optional[Callable[[float], None]] = None
        self._is_listening: bool = False
        self._listener_id: Optional[int] = None
    
    @property
    def current_heading(self) -> float:
        """Get the current compass heading in degrees (0-360)."""
        return self._current_heading
    
    @property
    def on_heading_change(self) -> Optional[Callable[[float], None]]:
        """Callback for when heading changes."""
        return self._on_heading_change
    
    @on_heading_change.setter
    def on_heading_change(self, callback: Optional[Callable[[float], None]]) -> None:
        """Set callback for heading changes."""
        self._on_heading_change = callback
    
    def get_current_heading(self) -> float:
        """
        Get the current compass heading.
        
        In a browser environment, this would use the DeviceOrientation API.
        For testing purposes, this returns a mock heading.
        
        Returns:
            Compass heading in degrees (0-360)
        """
        # In production, this would use:
        # window.orientation or DeviceOrientationEvent
        # For now, return a mock heading
        return self._current_heading
    
    def start_listening(self) -> None:
        """
        Start listening for device orientation changes.
        
        In a browser environment, this would add event listeners.
        """
        if self._is_listening:
            return
        
        self._is_listening = True
        # In production:
        # window.addEventListener('deviceorientation', self._handle_orientation)
    
    def stop_listening(self) -> None:
        """
        Stop listening for device orientation changes.
        """
        if not self._is_listening:
            return
        
        self._is_listening = False
        # In production:
        # window.removeEventListener('deviceorientation', self._handle_orientation)
    
    def _handle_orientation(self, event: dict) -> None:
        """
        Handle device orientation events.
        
        Args:
            event: DeviceOrientationEvent from browser
        """
        # Extract heading from event
        # Note: Some browsers use absolute orientation, others relative
        heading = event.get('absolute', False)
        alpha = event.get('alpha', 0)  # Compass heading in degrees
        
        if heading and alpha is not None:
            self._current_heading = alpha
            if self._on_heading_change:
                self._on_heading_change(self._current_heading)
    
    def set_heading(self, heading: float) -> None:
        """
        Set the heading manually (for testing purposes).
        
        Args:
            heading: Heading in degrees (0-360)
        """
        self._current_heading = heading % 360
        if self._on_heading_change:
            self._on_heading_change(self._current_heading)
