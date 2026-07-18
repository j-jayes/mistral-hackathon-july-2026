"""
Location domain model for Velib Parking App.
Represents a geographic location with latitude and longitude.
"""

import math
from dataclasses import dataclass
from typing import Optional


@dataclass
class Location:
    """
    Represents a geographic location with latitude and longitude coordinates.
    
    Attributes:
        latitude: The latitude coordinate in decimal degrees
        longitude: The longitude coordinate in decimal degrees
    """
    latitude: float
    longitude: float

    def distance_to(self, other: 'Location') -> float:
        """
        Calculate the distance to another location in meters using the Haversine formula.
        
        Args:
            other: The target location to calculate distance to
            
        Returns:
            Distance in meters between the two locations
        """
        # Earth radius in meters
        R = 6371000
        
        # Convert degrees to radians
        lat1, lon1 = math.radians(self.latitude), math.radians(self.longitude)
        lat2, lon2 = math.radians(other.latitude), math.radians(other.longitude)
        
        # Differences in coordinates
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        # Haversine formula
        a = (math.sin(dlat / 2) ** 2) + math.cos(lat1) * math.cos(lat2) * (math.sin(dlon / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        return R * c

    def bearing_to(self, other: 'Location') -> float:
        """
        Calculate the bearing (direction) from this location to another in degrees.
        
        Args:
            other: The target location to calculate bearing to
            
        Returns:
            Bearing in degrees (0-360) where 0 is north, 90 is east, etc.
        """
        # Convert degrees to radians
        lat1, lon1 = math.radians(self.latitude), math.radians(self.longitude)
        lat2, lon2 = math.radians(other.latitude), math.radians(other.longitude)
        
        # Differences in longitude
        dlon = lon2 - lon1
        
        # Calculate bearing
        y = math.sin(dlon) * math.cos(lat2)
        x = (math.cos(lat1) * math.sin(lat2) - 
             math.sin(lat1) * math.cos(lat2) * math.cos(dlon))
        
        bearing = math.degrees(math.atan2(y, x))
        
        # Normalize to 0-360 degrees
        return (bearing + 360) % 360

    def __eq__(self, other: object) -> bool:
        """Check if two locations are equal based on coordinates."""
        if not isinstance(other, Location):
            return False
        return (self.latitude == other.latitude and 
                self.longitude == other.longitude)

    def __repr__(self) -> str:
        """String representation of the location."""
        return f"Location(latitude={self.latitude}, longitude={self.longitude})"

    def __hash__(self) -> int:
        """Hash based on coordinates for use in sets/dicts."""
        return hash((self.latitude, self.longitude))
