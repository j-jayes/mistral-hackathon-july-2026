import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Location, VelibStation, VelibStationSummary, DestinationInput, ProcessingResult } from '@/types';
import { apiClient } from '@/api/client';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';
import { calculateBearing, haversineDistance, calculateRelativeDirection } from '@/lib/utils';
import { stationCache } from '@/lib/stationCache';
import { geocodeAddress } from '@/lib/geocoding';
import HomePage from '@/pages/HomePage';
import SettingsPage from '@/pages/SettingsPage';
import LoadingSpinner from '@/components/LoadingSpinner';
import velibStationsData from '@/data/velibStations.json';

function App() {
  // State
  const [destination, setDestination] = useState<DestinationInput | null>(null);
  const [isParked, setIsParked] = useState<boolean>(false);
  const [nearbyStations, setNearbyStations] = useState<VelibStationSummary[]>([]);
  const [selectedStation, setSelectedStation] = useState<VelibStation | null>(null);
  const [targetDirection, setTargetDirection] = useState<number | null>(null);
  const [targetDistance, setTargetDistance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Hooks
  const geolocation = useGeolocation({ enableHighAccuracy: true });
  const orientation = useDeviceOrientation();

  // Convert pre-bundled station data to VelibStation format
  const convertStationData = useCallback((stationData: any): VelibStation => {
    return {
      station_id: stationData.station_id,
      name: stationData.name,
      location: stationData.location,
      capacity: stationData.capacity || 30,
      status: {
        station_id: stationData.station_id,
        is_renting: true,
        is_returning: true,
        last_updated: stationData.last_updated || new Date().toISOString(),
        num_bikes_available: Math.floor(Math.random() * 15) + 5, // Random bikes for demo
        num_docks_available: Math.floor(Math.random() * 10) + 3, // Random docks for demo
        num_bikes_available_types: { mechanical: Math.floor(Math.random() * 10) + 3, electrical: Math.floor(Math.random() * 5) + 1 },
        num_docks_available_types: { mechanical: Math.floor(Math.random() * 6) + 2, electrical: Math.floor(Math.random() * 4) + 1 }
      },
      has_available_docks: true,
      has_available_bikes: true
    };
  }, []);

  // Load pre-bundled stations
  const loadPreBundledStations = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Convert JSON data to VelibStation array
      const stations = velibStationsData.stations.map(convertStationData);
      
      // Save to cache
      await stationCache.saveStations(stations, Date.now());
      
      // Update last updated time
      setLastUpdated(Date.now());
      
      return stations;
    } catch (error) {
      console.error('Error loading pre-bundled stations:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [convertStationData]);

  // Calculate direction and distance to target
  const calculateTargetInfo = useCallback((
    userLocation: Location | null,
    targetLocation: Location | null,
    deviceHeading: number | null
  ) => {
    if (!userLocation || !targetLocation) {
      setTargetDirection(null);
      setTargetDistance(null);
      return;
    }

    // Calculate bearing from user to target
    const bearing = calculateBearing(
      userLocation.latitude,
      userLocation.longitude,
      targetLocation.latitude,
      targetLocation.longitude
    );

    // Calculate distance
    const distance = haversineDistance(
      userLocation.latitude,
      userLocation.longitude,
      targetLocation.latitude,
      targetLocation.longitude
    );

    // Calculate relative direction based on device heading
    const relativeDirection = calculateRelativeDirection(deviceHeading, bearing);

    setTargetDirection(relativeDirection);
    setTargetDistance(distance);
  }, []);

  // Get the current target location
  const getTargetLocation = useCallback((): Location | null => {
    if (isParked && destination?.location) {
      return destination.location;
    }
    
    if (selectedStation) {
      return selectedStation.location;
    }
    
    return null;
  }, [isParked, destination, selectedStation]);

  // Update target info when location or orientation changes
  useEffect(() => {
    const targetLocation = getTargetLocation();
    calculateTargetInfo(geolocation.location, targetLocation, orientation.heading);
  }, [geolocation.location, orientation.heading, getTargetLocation, calculateTargetInfo]);

  // Update target when isParked changes
  useEffect(() => {
    const targetLocation = getTargetLocation();
    calculateTargetInfo(geolocation.location, targetLocation, orientation.heading);
  }, [isParked, destination, selectedStation, geolocation.location, orientation.heading, getTargetLocation, calculateTargetInfo]);

  // Update stations when destination changes (sort by distance from destination)
  useEffect(() => {
    if (!destination?.location || nearbyStations.length === 0) return;
    
    // Sort stations by distance from destination (not user location)
    const sortedStations = [...nearbyStations].sort((a, b) => {
      const distA = a.location ? haversineDistance(
        destination.location!.latitude,
        destination.location!.longitude,
        a.location.latitude,
        a.location.longitude
      ) : Infinity;
      
      const distB = b.location ? haversineDistance(
        destination.location!.latitude,
        destination.location!.longitude,
        b.location.latitude,
        b.location.longitude
      ) : Infinity;
      
      return distA - distB;
    });
    
    setNearbyStations(sortedStations);
    
    // Auto-select the closest station to destination if none selected
    if (sortedStations.length > 0 && !selectedStation && !isParked) {
      // Find the closest station with available docks
      const closestStation = sortedStations.find(s => s.has_available_docks);
      if (closestStation) {
        // Find full station details from pre-bundled data
        const fullStationData = velibStationsData.stations.find(
          s => s.station_id === closestStation.station_id
        );
        if (fullStationData) {
          setSelectedStation(convertStationData(fullStationData));
        }
      }
    }
  }, [destination, nearbyStations, selectedStation, isParked, convertStationData]);

  // Load stations from cache or pre-bundled data
  useEffect(() => {
    const loadStations = async () => {
      try {
        // Try to load from cache first
        const cached = await stationCache.loadStations();
        
        if (cached.stations.length > 0) {
          // Use cached stations
          const stations = cached.stations.map(convertStationData);
          setLastUpdated(cached.lastUpdated || Date.now());
          
          // Filter stations with available docks near user location if available
          if (geolocation.location) {
            const stationsWithDistance = stations
              .filter(station => station.has_available_docks)
              .map(station => {
                const distance = haversineDistance(
                  geolocation.location!.latitude,
                  geolocation.location!.longitude,
                  station.location.latitude,
                  station.location.longitude
                );
                return {
                  ...station,
                  distance_from_user: distance
                };
              })
              .sort((a, b) => (a.distance_from_user || 0) - (b.distance_from_user || 0));
            
            setNearbyStations(stationsWithDistance.map(station => ({
              station_id: station.station_id,
              name: station.name,
              location: station.location,
              available_docks: station.status.num_docks_available,
              available_bikes: station.status.num_bikes_available,
              distance: station.distance_from_user,
              has_available_docks: station.has_available_docks
            })));
          } else {
            // If no location yet, just use all stations
            setNearbyStations(cached.stations.map(station => ({
              station_id: station.station_id,
              name: station.name,
              location: station.location,
              available_docks: station.status.num_docks_available,
              available_bikes: station.status.num_bikes_available,
              distance: null,
              has_available_docks: station.has_available_docks
            })));
          }
          
          // Auto-select the closest station if none selected
          if (stationsWithDistance?.length > 0 && !selectedStation && !isParked) {
            setSelectedStation(stationsWithDistance[0]);
          }
        } else {
          // Fall back to pre-bundled data
          await loadPreBundledStations();
        }
      } catch (error) {
        console.error('Error loading stations from cache:', error);
        // Fall back to pre-bundled data
        await loadPreBundledStations();
      }
    };
    
    loadStations();
  }, [geolocation.location, selectedStation, isParked, loadPreBundledStations, convertStationData]);

  // Handle refresh button click
  const handleRefreshStations = useCallback(async () => {
    try {
      setIsRefreshing(true);
      
      // Try to refresh from API
      if (geolocation.location) {
        try {
          const freshStations = await apiClient.get_stations(geolocation.location, 1000);
          setNearbyStations(freshStations);
          
          // Also update the pre-bundled stations with fresh data
          const stations = velibStationsData.stations.map(convertStationData);
          await stationCache.saveStations(stations, Date.now());
          setLastUpdated(Date.now());
          
          // Auto-select the closest station if none selected
          if (freshStations.length > 0 && !selectedStation && !isParked) {
            const fullStation = await apiClient.get_station_by_id(freshStations[0].station_id);
            if (fullStation) {
              setSelectedStation(fullStation);
            }
          }
        } catch (apiError) {
          console.warn('API refresh failed, using pre-bundled data:', apiError);
          // Fall back to reloading pre-bundled data
          await loadPreBundledStations();
        }
      } else {
        await loadPreBundledStations();
      }
    } catch (error) {
      console.error('Error refreshing stations:', error);
      setError('Failed to refresh station data');
    } finally {
      setIsRefreshing(false);
    }
  }, [geolocation.location, selectedStation, isParked, loadPreBundledStations, convertStationData]);

  // Handle voice input result
  const handleVoiceResult = useCallback((result: ProcessingResult) => {
    if (result.success && result.destination) {
      const destinationInput = result.destination as DestinationInput;
      setDestination(destinationInput);
      setIsParked(false);
      
      // Geocode the destination to get location
      if (destinationInput.address) {
        geocodeAddress(destinationInput.address)
          .then(location => {
            const updatedDestination: DestinationInput = {
              ...destinationInput,
              location,
            };
            setDestination(updatedDestination);
          })
          .catch(err => {
            console.error('Error geocoding destination:', err);
          });
      }
    }
  }, []);

  // Toggle parked status
  const toggleParkedStatus = useCallback(() => {
    setIsParked(prev => !prev);
  }, []);

  // Select a station
  const selectStation = useCallback((station: VelibStation) => {
    setSelectedStation(station);
    setIsParked(false);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Format last updated time for display
  const formatLastUpdated = useCallback(() => {
    if (!lastUpdated) return 'Never';
    
    const now = Date.now();
    const diffMs = now - lastUpdated;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffMins < 1440) {
      const hours = Math.floor(diffMins / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffMins / 1440);
      return `${days}d ago`;
    }
  }, [lastUpdated]);

  // Check if data is loading
  const loading = isLoading || geolocation.is_loading;

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] ios-safe-area-top">
        {/* Loading Overlay */}
        {loading && <LoadingSpinner className="fixed inset-0 z-50" />}
        
        {/* Routes */}
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                currentLocation={geolocation.location}
                locationError={geolocation.error}
                destination={destination}
                selectedStation={selectedStation}
                nearbyStations={nearbyStations}
                isParked={isParked}
                targetDirection={targetDirection}
                targetDistance={targetDistance}
                lastUpdated={formatLastUpdated()}
                isRefreshing={isRefreshing}
                compassPermission={orientation.permission}
                onEnableCompass={orientation.requestPermission}
                onVoiceResult={handleVoiceResult}
                onToggleParked={toggleParkedStatus}
                onSelectStation={selectStation}
                onClearError={clearError}
                onRefreshStations={handleRefreshStations}
              />
            }
          />
          <Route
            path="/settings"
            element={
              <SettingsPage
                onGoBack={() => window.history.back()}
              />
            }
          />
        </Routes>
        
        {/* Toaster for notifications */}
        <Toaster
          position="top-center"
          toastOptions={{
            className: "bg-white/90 backdrop-blur-md text-foreground border border-border",
            duration: 4000,
          }}
        />
      </div>
    </Router>
  );
}

export default App;