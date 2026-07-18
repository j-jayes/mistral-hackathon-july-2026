"""
Location model for geographic coordinates.
"""

from pydantic import BaseModel, Field
from typing import Optional
import math


class Location(BaseModel):
    """Geographic location with latitude and longitude."""
    
    latitude: float = Field(..., description="Latitude in decimal degrees")
    longitude: float = Field(..., description="Longitude in decimal degrees")
    
    def distance_to(self, other: 'Location') -> float:
        """
        Calculate distance to another location in meters using Haversine formula.
        
        Args:
            other: Target location
            
        Returns:
            Distance in meters
        """
        R = 6371000  # Earth radius in meters
        
        lat1, lon1 = math.radians(self.latitude), math.radians(self.longitude)
        lat2, lon2 = math.radians(other.latitude), math.radians(other.longitude)
        
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = (math.sin(dlat / 2) ** 2) + math.cos(lat1) * math.cos(lat2) * (math.sin(dlon / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        return R * c
    
    def bearing_to(self, other: 'Location') -> float:
        """
        Calculate bearing (direction) to another location in degrees.
        
        Args:
            other: Target location
            
        Returns:
            Bearing in degrees (0-360)
        """
        lat1, lon1 = math.radians(self.latitude), math.radians(self.longitude)
        lat2, lon2 = math.radians(other.latitude), math.radians(other.longitude)
        
        dlon = lon2 - lon1
        
        y = math.sin(dlon) * math.cos(lat2)
        x = (math.cos(lat1) * math.sin(lat2) - 
             math.sin(lat1) * math.cos(lat2) * math.cos(dlon))
        
        bearing = math.degrees(math.atan2(y, x))
        return (bearing + 360) % 360
    
    class Config:
        json_schema_extra = {
            "example": {
                "latitude": 48.8566,
                "longitude": 2.3522
            }
        }


class LocationWithAddress(Location):
    """Location with address information."""
    
    address: str = Field(..., description="Human-readable address")
    formatted_address: Optional[str] = Field(None, description="Fully formatted address")
    
    class Config:
        json_schema_extra = {
            "example": {
                "latitude": 48.8566,
                "longitude": 2.3522,
                "address": "21 rue des Gravilliers, Paris",
                "formatted_address": "21 Rue des Gravilliers, 75003 Paris, France"
            }
        }