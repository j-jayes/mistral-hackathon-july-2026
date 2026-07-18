// Type definitions for the Velib Parking Guide app

// Location types
export interface Location {
  latitude: number;
  longitude: number;
}

export interface LocationWithAddress extends Location {
  address: string;
  formatted_address?: string;
}

// Velib Station types
export interface VelibStationStatus {
  station_id: string;
  is_renting: boolean;
  is_returning: boolean;
  last_updated: string; // ISO date string
  num_bikes_available: number;
  num_docks_available: number;
  num_bikes_available_types: Record<string, number>;
  num_docks_available_types: Record<string, number>;
}

export interface VelibStation {
  station_id: string;
  name: string;
  location: Location;
  capacity: number;
  status: VelibStationStatus;
  has_available_docks?: boolean;
  has_available_bikes?: boolean;
  distance_from_user?: number; // in meters
}

export interface VelibStationSummary {
  station_id: string;
  name: string;
  location: Location;
  available_docks: number;
  available_bikes: number;
  distance: number | null;
  has_available_docks: boolean;
}

// User input types
export interface UserInput {
  text: string;
  language?: string;
  source?: 'voice' | 'text';
}

export interface DestinationInput {
  address: string;
  formatted_address?: string;
  location?: Location;
  confidence?: number; // 0-1
}

export interface VoiceInput extends UserInput {
  audio_data: string; // base64 encoded
  audio_format?: string;
  sample_rate?: number;
  duration?: number; // in seconds
}

export interface ProcessingResult {
  success: boolean;
  destination?: DestinationInput | UserInput;
  message?: string;
  error?: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  success?: boolean;
}

export interface StationsResponse {
  stations: VelibStationSummary[];
}

export interface ClosestStationResponse {
  station: VelibStation;
}

export interface GeocodeResponse {
  location: LocationWithAddress;
}

export interface DestinationExtractionResponse {
  result: ProcessingResult;
}

export interface VoiceTranscriptionResponse {
  result: ProcessingResult;
}

// App State types
export interface AppState {
  // User location
  current_location: Location | null;
  location_error: string | null;
  
  // Destination
  destination: DestinationInput | null;
  
  // Current target (station or destination)
  current_target: VelibStation | DestinationInput | null;
  
  // Navigation state
  is_parked: boolean;
  
  // UI state
  is_loading: boolean;
  error: string | null;
  
  // Voice input state
  is_recording: boolean;
  voice_languages: string[];
  selected_language: string;
  
  // Stations data
  nearby_stations: VelibStationSummary[];
  
  // Compass data
  device_heading: number | null; // 0-360 degrees
  target_direction: number | null; // direction to target relative to device
  target_distance: number | null; // distance to target in meters
}

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export interface DeviceOrientationEvent {
  absolute: boolean;
  alpha: number | null; // compass heading in degrees
  beta: number | null;  // front-to-back tilt
  gamma: number | null; // left-to-right tilt
}

// Action types
export type AppAction = 
  | { type: 'SET_LOCATION'; payload: Location }
  | { type: 'SET_LOCATION_ERROR'; payload: string }
  | { type: 'SET_DESTINATION'; payload: DestinationInput }
  | { type: 'SET_TARGET'; payload: VelibStation | DestinationInput }
  | { type: 'SET_IS_PARKED'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_RECORDING'; payload: boolean }
  | { type: 'SET_LANGUAGE'; payload: string }
  | { type: 'SET_NEARBY_STATIONS'; payload: VelibStationSummary[] }
  | { type: 'SET_DEVICE_HEADING'; payload: number }
  | { type: 'SET_TARGET_DIRECTION'; payload: number }
  | { type: 'SET_TARGET_DISTANCE'; payload: number }
  | { type: 'RESET_ERROR' };

// Props types
export interface CompassProps {
  target_direction: number | null;
  target_distance: number | null;
  size?: number;
}

export interface DistanceDisplayProps {
  distance: number | null;
  className?: string;
}

export interface VoiceInputButtonProps {
  is_recording: boolean;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export interface StationCardProps {
  station: VelibStationSummary;
  onSelect: (station: VelibStationSummary) => void;
  is_selected: boolean;
}

export interface StationListProps {
  stations: VelibStationSummary[];
  onSelectStation: (station: VelibStationSummary) => void;
  selected_station_id: string | null;
}

export interface HeaderProps {
  title: string;
  subtitle?: string;
  rightContent?: React.ReactNode;
}

export interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

export interface ErrorToastProps {
  message: string;
  onDismiss: () => void;
}

// API Client types
export interface ApiClient {
  get_stations: (location: Location, radius?: number) => Promise<VelibStationSummary[]>;
  get_closest_station: (location: Location, max_distance?: number) => Promise<VelibStation | null>;
  extract_destination: (user_input: UserInput) => Promise<ProcessingResult>;
  transcribe_audio: (audio_file: File, language?: string) => Promise<ProcessingResult>;
  process_voice: (audio_file: File, language?: string) => Promise<ProcessingResult>;
  geocode_address: (address: string) => Promise<LocationWithAddress>;
  get_voice_languages: () => Promise<string[]>;
  health_check: () => Promise<{ status: string }>;
}