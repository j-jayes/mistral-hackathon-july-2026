import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Location, VelibStation, VelibStationSummary, DestinationInput, ProcessingResult, CompassPermission } from '@/types';
import { apiClient } from '@/api/client';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { formatDistance, getDirectionName, cn } from '@/lib/utils';
import Compass from '@/components/Compass';
import DistanceDisplay from '@/components/DistanceDisplay';
import VoiceInputButton from '@/components/VoiceInputButton';
import StationList from '@/components/StationList';
import Header from '@/components/Header';
import SettingsButton from '@/components/SettingsButton';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { RefreshCw, Clock, Navigation, Menu } from 'lucide-react';

interface HomePageProps {
  currentLocation: Location | null;
  locationError: string | null;
  destination: DestinationInput | null;
  selectedStation: VelibStation | null;
  nearbyStations: VelibStationSummary[];
  isParked: boolean;
  targetDirection: number | null;
  targetDistance: number | null;
  lastUpdated: string;
  isRefreshing: boolean;
  compassPermission: CompassPermission;
  onEnableCompass: () => void;
  onSetDestination: (address: string) => void;
  onDemoMode: () => void;
  onVoiceResult: (result: ProcessingResult) => void;
  onToggleParked: () => void;
  onSelectStation: (station: VelibStation) => void;
  onClearError: () => void;
  onRefreshStations: () => void;
}

export default function HomePage({
  currentLocation,
  locationError,
  destination,
  selectedStation,
  nearbyStations,
  isParked,
  targetDirection,
  targetDistance,
  lastUpdated,
  isRefreshing,
  compassPermission,
  onEnableCompass,
  onSetDestination,
  onDemoMode,
  onVoiceResult,
  onToggleParked,
  onSelectStation,
  onClearError,
  onRefreshStations,
}: HomePageProps) {
  const navigate = useNavigate();
  const [showStations, setShowStations] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Compass size adapts to the viewport so it fits small screens without
  // colliding with the status text or the bottom control bar.
  const [compassSize, setCompassSize] = useState<number>(280);
  useEffect(() => {
    const computeSize = () => {
      const byWidth = window.innerWidth - 96;   // leave side padding
      const byHeight = window.innerHeight - 400; // leave room for header/status/controls
      setCompassSize(Math.max(180, Math.min(280, byWidth, byHeight)));
    };
    computeSize();
    window.addEventListener('resize', computeSize);
    window.addEventListener('orientationchange', computeSize);
    return () => {
      window.removeEventListener('resize', computeSize);
      window.removeEventListener('orientationchange', computeSize);
    };
  }, []);

  const showEnableCompass =
    compassPermission === 'unknown' || compassPermission === 'denied';

  // Voice input hook
  const voiceInput = useVoiceInput({
    language: 'fr',
    onSuccess: onVoiceResult,
    onError: (error) => {
      toast.error(error);
    },
  });

  // Start voice recording
  const handleVoiceClick = useCallback(() => {
    if (voiceInput.is_recording) {
      voiceInput.stopRecording().then(() => {
        toast.promise(
          voiceInput.processAudio(voiceInput.audio_blob),
          {
            loading: 'Processing...',
            success: 'Destination set!',
            error: 'Failed to process',
          }
        );
      });
    } else {
      voiceInput.startRecording();
      toast.success('Speak your destination...');
    }
  }, [voiceInput]);

  // Show station list
  const toggleStations = useCallback(() => {
    setShowStations(prev => !prev);
  }, []);

  // Navigate to settings
  const handleSettingsClick = useCallback(() => {
    navigate('/settings');
  }, [navigate]);

  // Clear errors
  useEffect(() => {
    if (locationError) {
      toast.error(locationError);
      onClearError();
    }
  }, [locationError, onClearError]);

  // Get status message
  const getStatusMessage = useCallback(() => {
    if (!currentLocation) {
      return 'Waiting for location...';
    }
    
    if (destination) {
      return `Going to: ${destination.address}`;
    }
    
    if (selectedStation) {
      return `Target: ${selectedStation.name}`;
    }
    
    if (nearbyStations.length > 0) {
      return `${nearbyStations.length} stations with available docks nearby`;
    }
    
    return 'No stations found nearby';
  }, [currentLocation, destination, selectedStation, nearbyStations]);

  // Get sub-status message
  const getSubStatusMessage = useCallback(() => {
    if (!currentLocation) {
      return 'Enable location permissions to find nearby stations';
    }
    
    if (isParked && destination) {
      return 'Compass pointing to your destination';
    }
    
    if (selectedStation) {
      const distance = formatDistance(targetDistance);
      const direction = targetDirection !== null ? getDirectionName(targetDirection) : 'Unknown';
      return `Station is ${distance} away, direction: ${direction}`;
    }
    
    return 'Point the compass to navigate to the closest station with available docks';
  }, [currentLocation, isParked, destination, selectedStation, targetDistance, targetDirection]);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <Header
        title="🚲 Velib Parking Guide"
        subtitle={getSubStatusMessage()}
        leftContent={
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-11 h-11 rounded-full bg-card border border-border flex items-center justify-center text-primary hover:bg-secondary transition-colors btn-raised"
            aria-label="Open destination menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        }
        rightContent={
          <SettingsButton onClick={handleSettingsClick} />
        }
      />

      {/* Collapsible sidebar: typed destination + demo mode */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSetDestination={onSetDestination}
        onDemo={onDemoMode}
        currentDestination={destination?.address ?? null}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-28 relative overflow-y-auto">
        {/* Status Message */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
            <h2 className="text-lg font-medium text-foreground">
              {getStatusMessage()}
            </h2>

            {/* Last Updated Badge */}
            <div className="inline-flex items-center gap-1 bg-card border border-border rounded-full px-3 py-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{lastUpdated}</span>
            </div>
          </div>

          {/* Refresh Button */}
          <div className="mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefreshStations}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>

          {/* Parked Status */}
          {isParked && (
            <div className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground rounded-full px-4 py-2 text-sm">
              <span className="w-2 h-2 bg-success rounded-full"></span>
              <span>Parked! Compass pointing to destination</span>
            </div>
          )}

          {/* Not Parked Status */}
          {!isParked && selectedStation && (
            <div className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground rounded-full px-4 py-2 text-sm">
              <span className="w-2 h-2 bg-primary rounded-full"></span>
              <span>Heading to station with available docks</span>
            </div>
          )}
        </div>

        {/* Compass */}
        <div className="relative mb-6">
          <Compass
            target_direction={targetDirection}
            target_distance={targetDistance}
            size={compassSize}
          />

          {/* Distance Display (centered in compass) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <DistanceDisplay distance={targetDistance} />
          </div>
        </div>

        {/* Enable Compass (iOS requires a user gesture to grant orientation access) */}
        {showEnableCompass && (
          <div className="mb-6 flex flex-col items-center gap-2">
            <Button
              variant="secondary"
              size="lg"
              onClick={onEnableCompass}
              className="rounded-full px-6 gap-2 shadow-lg"
            >
              <Navigation className="w-5 h-5" />
              <span>Enable Compass</span>
            </Button>
            <p className="text-xs text-muted-foreground max-w-[16rem] text-center">
              {compassPermission === 'denied'
                ? 'Compass access was blocked. Enable Motion & Orientation in Safari settings, then tap again.'
                : 'Tap to allow motion and orientation so the needle can point the way.'}
            </p>
          </div>
        )}

        {/* Target Info */}
        {selectedStation && (
          <div className="bg-card border border-border rounded-xl p-4 mb-8 w-full max-w-md shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                <span className="text-xl">🚲</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">{selectedStation.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedStation.status.num_docks_available} docks available
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-xl font-bold text-primary tabular-nums">
                  {formatDistance(targetDistance)}
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                  {targetDirection !== null ? getDirectionName(targetDirection) : '--'}
                </p>
              </div>
            </div>
          </div>
        )}

        {destination && !isParked && (
          <div className="bg-card border border-border rounded-xl p-4 mb-8 w-full max-w-md shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                <span className="text-xl">🎯</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">{destination.address}</h3>
                <p className="text-sm text-muted-foreground">
                  Destination set
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bottom control bar — single row, clears the iOS home indicator via
            safe-area padding, so the three controls never overlap on short screens. */}
        <div className="absolute inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 px-4 pt-2 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          {/* Stations Toggle Button */}
          <Button
            variant="outline"
            size="lg"
            onClick={toggleStations}
            className="w-14 h-14 p-0 rounded-full shrink-0"
            aria-label="Show nearby stations"
          >
            <span className="text-2xl">📍</span>
          </Button>

          {/* Voice Input Button */}
          <VoiceInputButton
            is_recording={voiceInput.is_recording}
            onClick={handleVoiceClick}
            className="flex-1 max-w-[12rem]"
          />

          {/* Parked Toggle Button (placeholder keeps the voice button centered) */}
          {selectedStation ? (
            <Button
              variant={isParked ? "secondary" : "outline"}
              size="lg"
              onClick={onToggleParked}
              className="w-14 h-14 p-0 rounded-full shrink-0"
              aria-label={isParked ? "Navigate to station" : "Mark as parked"}
            >
              {isParked ? (
                <span className="text-2xl">🚶</span>
              ) : (
                <span className="text-2xl">🚲</span>
              )}
            </Button>
          ) : (
            <div className="w-14 h-14 shrink-0" aria-hidden="true" />
          )}
        </div>

        {/* Station List (bottom sheet) */}
        {showStations && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex flex-col ios-safe-area-bottom">
            <div className="flex-1 overflow-y-auto">
              <StationList
                stations={nearbyStations}
                onSelectStation={(station) => {
                  // Find full station details from pre-bundled data
                  import('@/data/velibStations.json').then(module => {
                    const fullStationData = module.default.stations.find(
                      s => s.station_id === station.station_id
                    );
                    if (fullStationData) {
                      // Convert to VelibStation format
                      const fullStation: VelibStation = {
                        station_id: fullStationData.station_id,
                        name: fullStationData.name,
                        location: fullStationData.location,
                        capacity: fullStationData.capacity || 30,
                        status: {
                          station_id: fullStationData.station_id,
                          is_renting: true,
                          is_returning: true,
                          last_updated: fullStationData.last_updated || new Date().toISOString(),
                          num_bikes_available: Math.floor(Math.random() * 15) + 5,
                          num_docks_available: Math.floor(Math.random() * 10) + 3,
                          num_bikes_available_types: { mechanical: Math.floor(Math.random() * 10) + 3, electrical: Math.floor(Math.random() * 5) + 1 },
                          num_docks_available_types: { mechanical: Math.floor(Math.random() * 6) + 2, electrical: Math.floor(Math.random() * 4) + 1 }
                        },
                        has_available_docks: true,
                        has_available_bikes: true
                      };
                      onSelectStation(fullStation);
                      setShowStations(false);
                    }
                  }).catch(() => {
                    // Fallback to API if pre-bundled data not available
                    apiClient.get_station_by_id(station.station_id)
                      .then(fullStation => {
                        if (fullStation) {
                          onSelectStation(fullStation);
                          setShowStations(false);
                        }
                      });
                  });
                }}
                selected_station_id={selectedStation?.station_id || null}
              />
            </div>
            <div className="p-4 bg-white/90 backdrop-blur-md border-t border-border">
              <Button
                variant="ghost"
                size="lg"
                onClick={toggleStations}
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}