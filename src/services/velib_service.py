"""
VelibService for Velib Parking App.
Handles fetching and managing Velib station data.
"""

from typing import Optional, List, Callable, Dict, Any
from datetime import datetime
from ..domain.location import Location
from ..domain.velib_station import VelibStation


class VelibService:
    """
    Service for accessing Velib station data.
    
    Provides methods to find stations with available docks.
    Note: In production, this would connect to official Velib API.
    For demo purposes, we use mock data.
    """
    
    def __init__(self):
        """Initialize the Velib service."""
        self._stations: List[VelibStation] = []
        self._last_refresh_time: Optional[datetime] = None
        self._is_refreshing: bool = False
        self._on_stations_updated: Optional[Callable[[List[VelibStation]], None]] = None
        self._on_error: Optional[Callable[[str], None]] = None
        
        # Load initial mock data
        self._load_mock_data()
    
    @property
    def last_refresh_time(self) -> Optional[datetime]:
        """Get the time of last station data refresh."""
        return self._last_refresh_time
    
    @property
    def on_stations_updated(self) -> Optional[Callable[[List[VelibStation]], None]]:
        """Callback for when stations are updated."""
        return self._on_stations_updated
    
    @on_stations_updated.setter
    def on_stations_updated(self, callback: Optional[Callable[[List[VelibStation]], None]]) -> None:
        """Set callback for station updates."""
        self._on_stations_updated = callback
    
    @property
    def on_error(self) -> Optional[Callable[[str], None]]:
        """Callback for service errors."""
        return self._on_error
    
    @on_error.setter
    def on_error(self, callback: Optional[Callable[[str], None]]) -> None:
        """Set callback for errors."""
        self._on_error = callback
    
    def _load_mock_data(self) -> None:
        """Load mock Velib station data for Paris."""
        # Mock stations in central Paris
        mock_stations = [
            VelibStation(
                station_id="12345",
                name="Notre Dame",
                location=Location(latitude=48.8534, longitude=2.3488),
                total_docks=30,
                available_docks=8,
                available_bikes=15
            ),
            VelibStation(
                station_id="12346",
                name="Saint-Michel",
                location=Location(latitude=48.8520, longitude=2.3455),
                total_docks=25,
                available_docks=12,
                available_bikes=8
            ),
            VelibStation(
                station_id="12347",
                name="Châtelet",
                location=Location(latitude=48.8586, longitude=2.3463),
                total_docks=40,
                available_docks=5,
                available_bikes=20
            ),
            VelibStation(
                station_id="12348",
                name="Louvre",
                location=Location(latitude=48.8606, longitude=2.3376),
                total_docks=35,
                available_docks=15,
                available_bikes=10
            ),
            VelibStation(
                station_id="12349",
                name="Gare de Lyon",
                location=Location(latitude=48.8442, longitude=2.3732),
                total_docks=50,
                available_docks=20,
                available_bikes=25
            )
        ]
        
        self._stations = mock_stations
        self._last_refresh_time = datetime.now()
    
    def refresh_stations(self) -> None:
        """
        Refresh station data from API.
        
        In production, this would fetch from the official Velib API.
        For demo purposes, this reloads mock data.
        """
        if self._is_refreshing:
            return
        
        self._is_refreshing = True
        
        try:
            # In production:
            # response = requests.get("https://api.velib-metropole.fr/gbfs/en/station_status.json")
            # self._parse_api_response(response.json())
            
            # For demo, reload mock data
            self._load_mock_data()
            
            if self._on_stations_updated:
                self._on_stations_updated(self._stations)
                
        except Exception as e:
            if self._on_error:
                self._on_error(str(e))
        finally:
            self._is_refreshing = False
    
    def find_closest_station_with_available_docks(
        self, 
        location: Location, 
        max_distance_meters: float = 1000
    ) -> Optional[VelibStation]:
        """
        Find the closest Velib station with available docks to a given location.
        
        Args:
            location: Current user location
            max_distance_meters: Maximum distance to search (default: 1000m = 1km)
            
        Returns:
            Closest VelibStation with available docks, or None if none found
        """
        closest_station = None
        closest_distance = float('inf')
        
        for station in self._stations:
            if station.has_available_docks:
                distance = station.distance_from(location)
                if distance <= max_distance_meters and distance < closest_distance:
                    closest_distance = distance
                    closest_station = station
        
        return closest_station
    
    def get_stations_in_area(
        self, 
        center: Location, 
        radius_meters: float = 1000
    ) -> List[VelibStation]:
        """
        Get all stations within a certain radius of a location.
        
        Args:
            center: Center location to search around
            radius_meters: Search radius in meters
            
        Returns:
            List of VelibStation objects within the search area
        """
        stations_in_area = []
        
        for station in self._stations:
            distance = station.distance_from(center)
            if distance <= radius_meters:
                stations_in_area.append(station)
        
        # Sort by distance from center
        stations_in_area.sort(key=lambda s: s.distance_from(center))
        
        return stations_in_area
    
    def get_stations_with_available_docks(self) -> List[VelibStation]:
        """
        Get all stations that have available docks for parking.
        
        Returns:
            List of VelibStation objects with available docks
        """
        return [s for s in self._stations if s.has_available_docks]
    
    def get_all_stations(self) -> List[VelibStation]:
        """
        Get all available stations.
        
        Returns:
            List of all VelibStation objects
        """
        return self._stations.copy()
    
    def _parse_api_response(self, response: Dict[str, Any]) -> None:
        """
        Parse API response from Velib API (for production use).
        
        Args:
            response: JSON response from Velib API
        """
        # Implementation for production use
        # stations_data = response.get('data', {}).get('stations', [])
        # self._stations = []
        # for station_data in stations_data:
        #     station = self._create_station_from_data(station_data)
        #     self._stations.append(station)
        # self._last_refresh_time = datetime.now()
        pass
