import { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Location, VelibStation, VelibStationSummary, DestinationInput, ProcessingResult } from '@/types';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';
import { calculateBearing, haversineDistance, calculateRelativeDirection } from '@/lib/utils';
import { convertStationData, summarizeStations, findClosestStation } from '@/lib/stations';
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
  // Master list of every known station (converted once, stable availability).
  const [allStations, setAllStations] = useState<VelibStation[]>([]);
  const [nearbyStations, setNearbyStations] = useState<VelibStationSummary[]>([]);
  const [selectedStation, setSelectedStation] = useState<VelibStation | null>(null);
  const [targetDirection, setTargetDirection] = useState<number | null>(null);
  const [targetDistance, setTargetDistance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // True once the user hand-picks a station from the list; keeps their choice
  // sticky until they set a new destination (which resets it to auto-select).
  const manualSelection = useRef<boolean>(false);

  // Hooks
  const geolocation = useGeolocation({ enableHighAccuracy: true });
  const orientation = useDeviceOrientation();

  // The point we measure "closest station" from: the destination the user
  // entered if there is one, otherwise their current GPS position.
  const referencePoint: Location | null = destination?.location ?? geolocation.location;

  // ---- Load stations (cache first, then the bundled open-data snapshot) ----
  const loadStations = useCallback(async (forceBundled = false): Promise<VelibStation[]> => {
    try {
      if (!forceBundled) {
        const cached = await stationCache.loadStations();
        if (cached.stations.length > 0) {
          const stations = cached.stations.map(convertStationData);
          setAllStations(stations);
          setLastUpdated(cached.lastUpdated ?? Date.now());
          return stations;
        }
      }

      // Fall back to the bundled snapshot shipped with the app.
      const stations = velibStationsData.stations.map(convertStationData);
      await stationCache.saveStations(velibStationsData.stations, Date.now());
      setAllStations(stations);
      setLastUpdated(Date.now());
      return stations;
    } catch (err) {
      console.error('Error loading stations:', err);
      const stations = velibStationsData.stations.map(convertStationData);
      setAllStations(stations);
      setLastUpdated(Date.now());
      return stations;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStations();
  }, [loadStations]);

  // ---- Derive the nearby-station list, sorted by distance to the reference ----
  useEffect(() => {
    if (allStations.length === 0) return;
    setNearbyStations(summarizeStations(allStations, referencePoint));
  }, [allStations, referencePoint]);

  // ---- Auto-select the closest station with docks to the reference point ----
  // Runs whenever the destination or the user's location changes, so typing an
  // address immediately re-targets the compass. Skipped once the user has
  // hand-picked a station (until they set a new destination).
  useEffect(() => {
    if (isParked || manualSelection.current) return;
    if (allStations.length === 0 || !referencePoint) return;

    const closest = findClosestStation(allStations, referencePoint);
    if (closest) {
      setSelectedStation((prev) =>
        prev?.station_id === closest.station_id ? prev : closest
      );
    }
  }, [allStations, referencePoint, isParked]);

  // ---- Compass: bearing + distance from the user to the current target ----
  const getTargetLocation = useCallback((): Location | null => {
    if (isParked && destination?.location) {
      return destination.location;
    }
    if (selectedStation) {
      return selectedStation.location;
    }
    return null;
  }, [isParked, destination, selectedStation]);

  useEffect(() => {
    const userLocation = geolocation.location;
    const targetLocation = getTargetLocation();

    if (!userLocation || !targetLocation) {
      setTargetDirection(null);
      setTargetDistance(null);
      return;
    }

    const bearing = calculateBearing(
      userLocation.latitude,
      userLocation.longitude,
      targetLocation.latitude,
      targetLocation.longitude
    );
    const distance = haversineDistance(
      userLocation.latitude,
      userLocation.longitude,
      targetLocation.latitude,
      targetLocation.longitude
    );

    setTargetDirection(calculateRelativeDirection(orientation.heading, bearing));
    setTargetDistance(distance);
  }, [geolocation.location, orientation.heading, getTargetLocation]);

  // ---- Refresh: reload the bundled snapshot and re-stamp the timestamp ----
  const handleRefreshStations = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await loadStations(true);
    } catch (err) {
      console.error('Error refreshing stations:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [loadStations]);

  // ---- Destination handling ----
  // Applying a destination resets the manual selection so the app auto-targets
  // the closest station to that destination.
  const applyDestination = useCallback((address: string) => {
    const trimmed = address.trim();
    if (!trimmed) return;
    manualSelection.current = false;
    const base: DestinationInput = { address: trimmed };
    setDestination(base);
    setIsParked(false);
    geocodeAddress(trimmed)
      .then((location) => setDestination({ ...base, location }))
      .catch((err) => console.error('Error geocoding destination:', err));
  }, []);

  const handleVoiceResult = useCallback((result: ProcessingResult) => {
    if (result.success && result.destination && 'address' in result.destination) {
      applyDestination(result.destination.address);
    }
  }, [applyDestination]);

  // Demo mode: route to 21 rue des Gravilliers.
  const handleDemo = useCallback(() => {
    applyDestination('21 rue des Gravilliers, Paris');
  }, [applyDestination]);

  const toggleParkedStatus = useCallback(() => {
    setIsParked((prev) => !prev);
  }, []);

  // User hand-picked a station from the list — make it stick.
  const selectStation = useCallback((station: VelibStation) => {
    manualSelection.current = true;
    setSelectedStation(station);
    setIsParked(false);
  }, []);

  const clearError = useCallback(() => {
    // Location errors are surfaced as a toast by HomePage; nothing to persist.
  }, []);

  // Format last updated time for display
  const formatLastUpdated = useCallback(() => {
    if (!lastUpdated) return 'Never';

    const diffMins = Math.floor((Date.now() - lastUpdated) / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  }, [lastUpdated]);

  const loading = isLoading || geolocation.is_loading;

  return (
    <Router>
      <div className="min-h-screen app-bg text-foreground ios-safe-area-top">
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
                onSetDestination={applyDestination}
                onDemoMode={handleDemo}
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
