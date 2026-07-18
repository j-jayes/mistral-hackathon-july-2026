"""
DistanceDisplay UI component for Velib Parking App.
Displays the distance to the target location.
"""

from typing import Optional


class DistanceDisplay:
    """
    Distance display UI component.
    
    Shows the distance to the current target in meters or kilometers.
    """
    
    def __init__(self):
        """Initialize the distance display."""
        self._distance: Optional[float] = None
        self._units: str = "meters"  # "meters" or "km"
    
    @property
    def distance(self) -> Optional[float]:
        """Get the distance value."""
        return self._distance
    
    @distance.setter
    def distance(self, value: Optional[float]) -> None:
        """Set the distance value."""
        self._distance = value
    
    @property
    def units(self) -> str:
        """Get the distance units."""
        return self._units
    
    @units.setter
    def units(self, value: str) -> None:
        """Set the distance units."""
        if value in ["meters", "km"]:
            self._units = value
        else:
            self._units = "meters"
    
    def _format_distance(self) -> str:
        """
        Format the distance for display.
        
        Returns:
            Formatted distance string
        """
        if self._distance is None:
            return "---"
        
        if self._units == "km":
            return f"{self._distance / 1000:.2f} km"
        else:
            return f"{self._distance:.0f} m"
    
    def render(self) -> str:
        """
        Render the distance display as HTML.
        
        Returns:
            HTML representation of the distance display
        """
        formatted_distance = self._format_distance()
        
        html = f'''
        <div class="distance-display">
            <span class="distance-label">Distance:</span>
            <span class="distance-value">{formatted_distance}</span>
        </div>
        '''
        
        return html
    
    def get_css(self) -> str:
        """
        Get CSS styles for the distance display.
        
        Returns:
            CSS string for styling the distance display
        """
        return '''
        .distance-display {
            display: inline-flex;
            align-items: center;
            background: #f8f8f8;
            padding: 10px 20px;
            border-radius: 25px;
            margin: 10px;
            font-family: Arial, sans-serif;
        }
        
        .distance-label {
            font-size: 14px;
            color: #666;
            margin-right: 5px;
        }
        
        .distance-value {
            font-size: 18px;
            font-weight: bold;
            color: #333;
        }
        '''
