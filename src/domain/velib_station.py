"""
VelibStation domain model for Velib Parking App.
Represents a Velib bike sharing station.
"""

from dataclasses import dataclass, field
from typing import Optional
from .location import Location


@dataclass
class VelibStation:
    """
    Represents a Velib bike sharing station.
    
    Attributes:
        station_id: Unique identifier for the station
        name: Human-readable name of the station
        location: Geographic location of the station
        total_docks: Total number of docks at the station
        available_docks: Number of available docks for parking
        available_bikes: Number of available bikes for rental
    """
    station_id: str
    name: str
    location: Location
    total_docks: int
    available_docks: int
    available_bikes: int = 0

    @property
    def has_available_docks(self) -> bool:
        """Check if the station has available docks for parking."""
        return self.available_docks > 0

    def distance_from(self, location: Location) -> float:
        """
        Calculate the distance from this station to a given location.
        
        Args:
            location: The location to calculate distance from
            
        Returns:
            Distance in meters from the station to the location
        """
        return self.location.distance_to(location)

    def __eq__(self, other: object) -> bool:
        """Check if two stations are equal based on station_id."""
        if not isinstance(other, VelibStation):
            return False
        return self.station_id == other.station_id

    def __repr__(self) -> str:
        """String representation of the Velib station."""
        return (f"VelibStation(station_id={self.station_id}, "
                f"name='{self.name}', "
                f"location={self.location}, "
                f"total_docks={self.total_docks}, "
                f"available_docks={self.available_docks}, "
                f"available_bikes={self.available_bikes})")

    def __hash__(self) -> int:
        """Hash based on station_id for use in sets/dicts."""
        return hash(self.station_id)
