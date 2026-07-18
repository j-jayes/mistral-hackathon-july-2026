"""
Velib station models for bike sharing stations.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from .location import Location


class VelibStationStatus(BaseModel):
    """Status information for a Velib station."""
    
    station_id: str = Field(..., description="Unique identifier for the station")
    is_renting: bool = Field(True, description="Whether bikes can be rented from this station")
    is_returning: bool = Field(True, description="Whether bikes can be returned to this station")
    last_updated: datetime = Field(..., description="Timestamp of last status update")
    num_bikes_available: int = Field(0, description="Number of bikes available for rent")
    num_docks_available: int = Field(0, description="Number of docks available for parking")
    num_bikes_available_types: dict = Field(default_factory=dict, description="Bike types available")
    num_docks_available_types: dict = Field(default_factory=dict, description="Dock types available")


class VelibStation(BaseModel):
    """Complete Velib station information."""
    
    station_id: str = Field(..., description="Unique identifier for the station")
    name: str = Field(..., description="Name of the station")
    location: Location = Field(..., description="Geographic location of the station")
    capacity: int = Field(0, description="Total capacity of the station (number of docks)")
    status: VelibStationStatus = Field(..., description="Current status of the station")
    
    @property
    def has_available_docks(self) -> bool:
        """Check if station has available docks for parking."""
        return self.status.num_docks_available > 0 and self.status.is_returning
    
    @property
    def has_available_bikes(self) -> bool:
        """Check if station has available bikes for rent."""
        return self.status.num_bikes_available > 0 and self.status.is_renting
    
    def distance_from(self, location: Location) -> float:
        """
        Calculate distance from this station to a given location.
        
        Args:
            location: Location to calculate distance from
            
        Returns:
            Distance in meters
        """
        return self.location.distance_to(location)
    
    class Config:
        json_schema_extra = {
            "example": {
                "station_id": "12345",
                "name": "Station Notre Dame",
                "location": {
                    "latitude": 48.8534,
                    "longitude": 2.3488
                },
                "capacity": 30,
                "status": {
                    "station_id": "12345",
                    "is_renting": True,
                    "is_returning": True,
                    "last_updated": "2024-01-15T10:30:00Z",
                    "num_bikes_available": 15,
                    "num_docks_available": 8,
                    "num_bikes_available_types": {"mechanical": 10, "electrical": 5},
                    "num_docks_available_types": {"mechanical": 5, "electrical": 3}
                }
            }
        }


class VelibStationSummary(BaseModel):
    """Summary information for a Velib station (used in lists)."""
    
    station_id: str = Field(..., description="Unique identifier for the station")
    name: str = Field(..., description="Name of the station")
    location: Location = Field(..., description="Geographic location")
    available_docks: int = Field(0, description="Number of available docks")
    available_bikes: int = Field(0, description="Number of available bikes")
    distance: Optional[float] = Field(None, description="Distance from user's location in meters")
    has_available_docks: bool = Field(False, description="Whether station has available docks")
    
    class Config:
        json_schema_extra = {
            "example": {
                "station_id": "12345",
                "name": "Station Notre Dame",
                "location": {"latitude": 48.8534, "longitude": 2.3488},
                "available_docks": 8,
                "available_bikes": 15,
                "distance": 500.5,
                "has_available_docks": True
            }
        }