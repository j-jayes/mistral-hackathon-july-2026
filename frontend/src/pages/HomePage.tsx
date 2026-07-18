import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Location, VelibStation, VelibStationSummary, DestinationInput, ProcessingResult, CompassPermission } from '@/types';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { formatDistance, getDirectionName } from '@/lib/utils';
import { convertStationData } from '@/lib/stations';
import Compass from '@/components/Compass';
import DistanceDisplay from '@/components/DistanceDisplay';
import VoiceInputButton from '@/components/VoiceInputButton';
import StationList from '@/components/StationList';
import Header from '@/components/Header';
import SettingsButton from '@/components/SettingsButton';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { RefreshCw, Clock, Navigation, Menu } from 'lucide-react';
import velibStationsData from '@/data/velibStations.json';

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
  const [compassSize, setCompassSize] = useState<number>(260);
  useEffect(() => {
    const computeSize = () => {
      const byWidth = window.innerWidth - 96;   // leave side padding
      const byHeight = window.innerHeight - 380; // leave room for header/status/card/controls
      setCompassSize(Math.max(170, Math.min(260, byWidth, byHeight)));
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

  const toggleStations = useCallback(() => {
    setShowStations(prev => !prev);
  }, []);

  const handleSettingsClick = useCallback(() => {
    navigate('/settings');
  }, [navigate]);

  // Resolve a list summary to a full station and hand it up to App.
  const handleSelectFromList = useCallback((summary: VelibStationSummary) => {
    const raw = velibStationsData.stations.find(
      s => s.station_id === summary.station_id
    );
    if (raw) {
      onSelectStation(convertStationData(raw));
      setShowStations(false);
    }
  }, [onSelectStation]);

  // Surface geolocation errors as a toast, once.
  useEffect(() => {
    if (locationError) {
      toast.error(locationError);
      onClearError();
    }
  }, [locationError, onClearError]);

  // One concise headline for the top of the screen.
  const statusHeadline = !currentLocation
    ? 'Waiting for your location…'
    : destination
      ? (isParked ? 'Parked — head to your destination' : 'Nearest station with a free dock')
      : selectedStation
        ? 'Nearest station with a free dock'
        : nearbyStations.length > 0
          ? `${nearbyStations.length} stations nearby`
          : 'Looking for stations…';

  const directionName = targetDirection !== null ? getDirectionName(targetDirection) : '--';

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <Header
        title="🚲 Velib Parking Guide"
        subtitle={destination ? destination.address : 'Point the compass to your station'}
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
      <main className="flex-1 flex flex-col items-center justify-between px-4 pt-3 pb-28 relative overflow-y-auto">
        {/* Status row: one headline + a single subtle meta line */}
        <div className="text-center shrink-0">
          <h2 className="text-base font-medium text-foreground">{statusHeadline}</h2>
          <div className="mt-1 flex items-center justify-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {lastUpdated}
            </span>
            <button
              onClick={onRefreshStations}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1 hover:text-primary transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Compass — the hero of the screen */}
        <div className="relative my-2 shrink-0">
          <Compass
            target_direction={targetDirection}
            target_distance={targetDistance}
            size={compassSize}
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <DistanceDisplay distance={targetDistance} />
          </div>
        </div>

        {/* Enable Compass (iOS requires a user gesture to grant orientation access) */}
        {showEnableCompass && (
          <div className="flex flex-col items-center gap-2 shrink-0">
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

        {/* One consolidated target card: destination + the station we're guiding to */}
        {selectedStation ? (
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm shadow-sm overflow-hidden shrink-0">
            {destination && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-secondary/60 text-secondary-foreground text-sm border-b border-border">
                <span>🎯</span>
                <span className="truncate">
                  {isParked ? 'Destination: ' : 'Parking near: '}
                  {destination.address}
                </span>
              </div>
            )}
            <div className="flex items-center gap-3 p-4">
              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center shrink-0">
                <span className="text-xl">🚲</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">{selectedStation.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedStation.status.num_docks_available} docks free
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-mono text-xl font-bold text-primary tabular-nums leading-none">
                  {formatDistance(targetDistance)}
                </p>
                <p className="font-mono text-xs text-muted-foreground mt-1">{directionName}</p>
              </div>
            </div>
          </div>
        ) : destination ? (
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm shadow-sm p-4 flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center shrink-0">
              <span className="text-xl">🎯</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">{destination.address}</h3>
              <p className="text-sm text-muted-foreground">Finding the nearest station…</p>
            </div>
          </div>
        ) : (
          <div className="shrink-0" aria-hidden="true" />
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
              <span className="text-2xl">{isParked ? '🚶' : '🚲'}</span>
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
                onSelectStation={handleSelectFromList}
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
