"""
Velib Service - Manages Velib station data.
"""

import asyncio
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from cachetools import TTLCache
import httpx
from fastapi import HTTPException

from ..models.velib import VelibStation, VelibStationStatus, VelibStationSummary
from ..models.location import Location
from ..config.settings import get_settings


class VelibService:
    """
    Service for fetching and managing Velib station data.
    Uses caching to reduce API calls and improve performance.
    """
    
    def __init__(self):
        self._cache: TTLCache[str, List[VelibStation]] = TTLCache(
            maxsize=1,
            ttl=timedelta(minutes=get_settings().STATION_CACHE_MINUTES)
        )
        self._last_fetch_time: Optional[datetime] = None
        self._stations: List[VelibStation] = []
    
    async def get_all_stations(self, force_refresh: bool = False) -> List[VelibStation]:
        """
        Get all Velib stations.
        
        Args:
            force_refresh: Whether to bypass cache and fetch fresh data
            
        Returns:
            List of VelibStation objects
        """
        # Check cache first
        if not force_refresh and self._stations:
            return self._stations
        
        # Fetch from API
        stations = await self._fetch_stations_from_api()
        self._stations = stations
        self._last_fetch_time = datetime.now()
        self._cache["all_stations"] = stations
        
        return stations
    
    async def _fetch_stations_from_api(self) -> List[VelibStation]:
        """
        Fetch stations from the official Velib API.
        
        Returns:
            List of VelibStation objects
        """
        settings = get_settings()
        
        try:
            # In production, use official Velib API
            # For demo purposes, we'll use mock data
            return await self._get_mock_stations()
            
        except Exception as e:
            raise HTTPException(
                status_code=502,
                detail=f"Failed to fetch Velib data: {str(e)}"
            )
    
    async def _get_mock_stations(self) -> List[VelibStation]:
        """
        Get mock station data for development.
        
        Returns:
            List of mock VelibStation objects
        """
        mock_stations = [
            VelibStation(
                station_id="12345",
                name="Notre Dame",
                location=Location(latitude=48.8534, longitude=2.3488),
                capacity=30,
                status=VelibStationStatus(
                    station_id="12345",
                    is_renting=True,
                    is_returning=True,
                    last_updated=datetime.now(),
                    num_bikes_available=15,
                    num_docks_available=8,
                    num_bikes_available_types={"mechanical": 10, "electrical": 5},
                    num_docks_available_types={"mechanical": 5, "electrical": 3}
                )
            ),
            VelibStation(
                station_id="12346",
                name="Saint-Michel",
                location=Location(latitude=48.8520, longitude=2.3455),
                capacity=25,
                status=VelibStationStatus(
                    station_id="12346",
                    is_renting=True,
                    is_returning=True,
                    last_updated=datetime.now(),
                    num_bikes_available=8,
                    num_docks_available=12,
                    num_bikes_available_types={"mechanical": 6, "electrical": 2},
                    num_docks_available_types={"mechanical": 8, "electrical": 4}
                )
            ),
            VelibStation(
                station_id="12347",
                name="Châtelet",
                location=Location(latitude=48.8586, longitude=2.3463),
                capacity=40,
                status=VelibStationStatus(
                    station_id="12347",
                    is_renting=True,
                    is_returning=True,
                    last_updated=datetime.now(),
                    num_bikes_available=20,
                    num_docks_available=5,
                    num_bikes_available_types={"mechanical": 15, "electrical": 5},
                    num_docks_available_types={"mechanical": 3, "electrical": 2}
                )
            ),
            VelibStation(
                station_id="12348",
                name="Louvre",
                location=Location(latitude=48.8606, longitude=2.3376),
                capacity=35,
                status=VelibStationStatus(
                    station_id="12348",
                    is_renting=True,
                    is_returning=True,
                    last_updated=datetime.now(),
                    num_bikes_available=10,
                    num_docks_available=15,
                    num_bikes_available_types={"mechanical": 8, "electrical": 2},
                    num_docks_available_types={"mechanical": 10, "electrical": 5}
                )
            ),
            VelibStation(
                station_id="12349",
                name="Gare de Lyon",
                location=Location(latitude=48.8442, longitude=2.3732),
                capacity=50,
                status=VelibStationStatus(
                    station_id="12349",
                    is_renting=True,
                    is_returning=True,
                    last_updated=datetime.now(),
                    num_bikes_available=25,
                    num_docks_available=20,
                    num_bikes_available_types={"mechanical": 20, "electrical": 5},
                    num_docks_available_types={"mechanical": 15, "electrical": 5}
                )
            )
        ]
        
        return mock_stations
    
    async def get_closest_station_with_available_docks(
        self, 
        location: Location, 
        max_distance_meters: float = 1000
    ) -> Optional[VelibStation]:
        """
        Find the closest station with available docks to a given location.
        
        Args:
            location: User's current location
            max_distance_meters: Maximum distance to search (default: 1000m)
            
        Returns:
            Closest VelibStation with available docks, or None
        """
        stations = await self.get_all_stations()
        
        closest_station = None
        closest_distance = float('inf')
        
        for station in stations:
            if station.has_available_docks:
                distance = station.distance_from(location)
                if distance <= max_distance_meters and distance < closest_distance:
                    closest_distance = distance
                    closest_station = station
        
        return closest_station
    
    async def get_stations_with_available_docks(
        self, 
        location: Location, 
        radius_meters: float = 1000
    ) -> List[VelibStationSummary]:
        """
        Get all stations with available docks within a certain radius.
        
        Args:
            location: Center location to search around
            radius_meters: Search radius in meters
            
        Returns:
            List of VelibStationSummary objects sorted by distance
        """
        stations = await self.get_all_stations()
        
        result = []
        for station in stations:
            if station.has_available_docks:
                distance = station.distance_from(location)
                if distance <= radius_meters:
                    summary = VelibStationSummary(
                        station_id=station.station_id,
                        name=station.name,
                        location=station.location,
                        available_docks=station.status.num_docks_available,
                        available_bikes=station.status.num_bikes_available,
                        distance=distance,
                        has_available_docks=True
                    )
                    result.append(summary)
        
        # Sort by distance
        result.sort(key=lambda s: s.distance or float('inf'))
        
        return result
    
    async def get_station_by_id(self, station_id: str) -> Optional[VelibStation]:
        """
        Get a specific station by its ID.
        
        Args:
            station_id: The station ID to look up
            
        Returns:
            VelibStation object or None if not found
        """
        stations = await self.get_all_stations()
        
        for station in stations:
            if station.station_id == station_id:
                return station
        
        return None
    
    def refresh_cache(self) -> None:
        """Clear the cache to force fresh data on next request."""
        self._cache.clear()
        self._stations = []
        self._last_fetch_time = None