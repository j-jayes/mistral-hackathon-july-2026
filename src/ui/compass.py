"""
Compass UI component for Velib Parking App.
Displays a compass that points toward the target location.
"""

from typing import Optional
from ..domain.location import Location


class Compass:
    """
    Compass UI component that points toward a target location.
    
    Uses the user's current location and device orientation to show direction.
    """
    
    def __init__(self, target_location: Optional[Location] = None):
        """
        Initialize the compass.
        
        Args:
            target_location: The location to point toward
        """
        self._target_location: Optional[Location] = target_location
        self._current_user_location: Optional[Location] = None
        self._current_heading: float = 0.0  # Current device heading in degrees
        self._direction_to_target: Optional[float] = None  # Direction to target relative to device
        self._distance_to_target: Optional[float] = None  # Distance to target in meters
    
    @property
    def target_location(self) -> Optional[Location]:
        """Get the target location."""
        return self._target_location
    
    @target_location.setter
    def target_location(self, location: Optional[Location]) -> None:
        """Set the target location."""
        self._target_location = location
        self._update_calculations()
    
    @property
    def current_user_location(self) -> Optional[Location]:
        """Get the current user location."""
        return self._current_user_location
    
    @current_user_location.setter
    def current_user_location(self, location: Optional[Location]) -> None:
        """Set the current user location."""
        self._current_user_location = location
        self._update_calculations()
    
    @property
    def current_heading(self) -> float:
        """Get the current device heading."""
        return self._current_heading
    
    @current_heading.setter
    def current_heading(self, heading: float) -> None:
        """Set the current device heading."""
        self._current_heading = heading % 360
        self._update_calculations()
    
    @property
    def direction_to_target(self) -> Optional[float]:
        """Get the compass direction to target (0-360 degrees)."""
        return self._direction_to_target
    
    @property
    def distance_to_target(self) -> Optional[float]:
        """Get the distance to target in meters."""
        return self._distance_to_target
    
    def _update_calculations(self) -> None:
        """Update direction and distance calculations."""
        if (self._current_user_location is None or 
            self._target_location is None):
            self._direction_to_target = None
            self._distance_to_target = None
            return
        
        # Calculate absolute direction from user to target
        absolute_direction = self._current_user_location.bearing_to(self._target_location)
        
        # Calculate relative direction based on device heading
        relative_direction = (absolute_direction - self._current_heading) % 360
        
        self._direction_to_target = relative_direction
        self._distance_to_target = self._current_user_location.distance_to(self._target_location)
    
    def calculate_direction(self) -> Optional[float]:
        """
        Calculate the direction to point the compass.
        
        Returns:
            Direction in degrees (0-360) relative to current device orientation
        """
        self._update_calculations()
        return self._direction_to_target
    
    def render(self) -> str:
        """
        Render the compass as HTML.
        
        Returns:
            HTML representation of the compass
        """
        direction = self.calculate_direction()
        distance = self.distance_to_target
        
        # Create compass HTML
        compass_style = f"transform: rotate({direction if direction is not None else 0}deg)"
        
        distance_text = ""
        if distance is not None:
            if distance < 1000:
                distance_text = f"{distance:.0f}m"
            else:
                distance_text = f"{distance/1000:.1f}km"
        
        html = f'''
        <div class="compass-container">
            <div class="compass">
                <div class="compass-needle" style="{compass_style}"></div>
                <div class="compass-rose">
                    <span class="compass-direction north">N</span>
                    <span class="compass-direction east">E</span>
                    <span class="compass-direction south">S</span>
                    <span class="compass-direction west">W</span>
                </div>
            </div>
            <div class="compass-distance">{distance_text}</div>
        </div>
        '''
        
        return html
    
    def get_css(self) -> str:
        """
        Get CSS styles for the compass.
        
        Returns:
            CSS string for styling the compass
        """
        return '''
        .compass-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 100%;
            max-width: 300px;
            margin: 20px auto;
        }
        
        .compass {
            position: relative;
            width: 200px;
            height: 200px;
            border: 3px solid #333;
            border-radius: 50%;
            background: white;
            overflow: hidden;
        }
        
        .compass-needle {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 60%;
            height: 3px;
            background: linear-gradient(to right, #ff4444, #ff6666);
            transform-origin: center;
            transition: transform 0.3s ease;
            z-index: 10;
        }
        
        .compass-needle::before {
            content: '';
            position: absolute;
            right: -8px;
            top: -4px;
            width: 0;
            height: 0;
            border-left: 8px solid #ff4444;
            border-top: 4px solid transparent;
            border-bottom: 4px solid transparent;
        }
        
        .compass-rose {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: 50%;
        }
        
        .compass-direction {
            position: absolute;
            font-weight: bold;
            font-size: 16px;
        }
        
        .compass-direction.north {{ top: 5px; left: 50%; transform: translateX(-50%); }}
        .compass-direction.south {{ bottom: 5px; left: 50%; transform: translateX(-50%); }}
        .compass-direction.east {{ right: 5px; top: 50%; transform: translateY(-50%); }}
        .compass-direction.west {{ left: 5px; top: 50%; transform: translateY(-50%); }}
        
        .compass-distance {
            margin-top: 10px;
            font-size: 18px;
            font-weight: bold;
            color: #333;
        }
        '''
