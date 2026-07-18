import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Location, VelibStation, VelibStationSummary, DestinationInput, ProcessingResult } from '@/types';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { formatDistance, getDirectionName, cn } from '@/lib/utils';
import Compass from '@/components/Compass';
import DistanceDisplay from '@/components/DistanceDisplay';
import VoiceInputButton from '@/components/VoiceInputButton';
import StationList from '@/components/StationList';
import Header from '@/components/Header';
import SettingsButton from '@/components/SettingsButton';
import { Button } from '@/components/ui/button';
import { RefreshCw, Clock } from 'lucide-react';

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
  onVoiceResult,
  onToggleParked,
  onSelectStation,
  onClearError,
  onRefreshStations,
}: HomePageProps) {
  const navigate = useNavigate();
  const [showStations, setShowStations] = useState<boolean>(false);

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
        rightContent={
          <SettingsButton onClick={handleSettingsClick} />
        }
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 relative">
        {/* Status Message */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h2 className="text-xl font-semibold text-white/90">
              {getStatusMessage()}
            </h2>
            
            {/* Last Updated Badge */}
            <div className="inline-flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-white/70">
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
              className="inline-flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>
          
          {/* Parked Status */}
          {isParked && (
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-white">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              <span>Parked! Compass pointing to destination</span>
            </div>
          )}
          
          {/* Not Parked Status */}
          {!isParked && selectedStation && (
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-white">
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              <span>Heading to station with available docks</span>
            </div>
          )}
        </div>

        {/* Compass */}
        <div className="relative mb-8">
          <Compass
            target_direction={targetDirection}
            target_distance={targetDistance}
            size={280}
          />
          
          {/* Distance Display (centered in compass) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <DistanceDisplay 
              distance={targetDistance}
              className="text-2xl font-bold text-white drop-shadow-lg"
            />
          </div>
        </div>

        {/* Target Info */}
        {selectedStation && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-8 w-full max-w-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-xl">🚲</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">{selectedStation.name}</h3>
                <p className="text-sm text-white/70">
                  {selectedStation.status.num_docks_available} docks available
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-white">
                  {formatDistance(targetDistance)}
                </p>
                <p className="text-xs text-white/60">
                  {targetDirection !== null ? getDirectionName(targetDirection) : '--'}
                </p>
              </div>
            </div>
          </div>
        )}

        {destination && !isParked && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-8 w-full max-w-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-xl">🎯</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">{destination.address}</h3>
                <p className="text-sm text-white/70">
                  Destination set
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Voice Input Button */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
          <VoiceInputButton
            is_recording={voiceInput.is_recording}
            onClick={handleVoiceClick}
            className="w-48"
          />
        </div>

        {/* Parked Toggle Button */}
        {selectedStation && (
          <div className="absolute bottom-20 right-4">
            <Button
              variant={isParked ? "secondary" : "outline"}
              size="lg"
              onClick={onToggleParked}
              className="w-14 h-14 p-0 rounded-full"
            >
              {isParked ? (
                <span className="text-2xl">🚶</span>
              ) : (
                <span className="text-2xl">🚲</span>
              )}
            </Button>
          </div>
        )}

        {/* Stations Toggle Button */}
        <div className="absolute bottom-20 left-4">
          <Button
            variant="outline"
            size="lg"
            onClick={toggleStations}
            className="w-14 h-14 p-0 rounded-full"
          >
            <span className="text-2xl">📍</span>
          </Button>
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