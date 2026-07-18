import axios, { AxiosInstance, AxiosError } from 'axios';
import { 
  Location, 
  LocationWithAddress, 
  VelibStation, 
  VelibStationSummary,
  UserInput,
  ProcessingResult
} from '@/types';

// API Configuration
// Use `??` (not `||`) so an intentional empty string keeps same-origin relative
// requests in the production single-container build. In dev, VITE_API_URL points
// at the backend (or Vite proxies /api).
const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

// Create axios instance with base configuration
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      let message = 'An error occurred';
      
      if (typeof data === 'object' && data !== null && 'detail' in data) {
        message = (data as { detail?: string }).detail || message;
      } else if (typeof data === 'string') {
        message = data;
      }
      
      return Promise.reject({
        ...error,
        message,
        status,
      });
    } else if (error.request) {
      // Request was made but no response received
      return Promise.reject({
        ...error,
        message: 'Network error - no response from server',
        status: 0,
      });
    } else {
      // Something happened in setting up the request
      return Promise.reject({
        ...error,
        message: error.message || 'Request setup error',
        status: 0,
      });
    }
  }
);

export class VelibApiClient {
  /**
   * Get all nearby stations with available docks
   */
  async get_stations(
    location: Location,
    radius: number = 1000
  ): Promise<VelibStationSummary[]> {
    try {
      const response = await api.get('/api/stations', {
        params: {
          latitude: location.latitude,
          longitude: location.longitude,
          radius,
        },
      });
      return response.data as VelibStationSummary[];
    } catch (error) {
      console.error('Error fetching stations:', error);
      throw error;
    }
  }

  /**
   * Get the closest station with available docks
   */
  async get_closest_station(
    location: Location,
    max_distance: number = 1000
  ): Promise<VelibStation | null> {
    try {
      const response = await api.get('/api/stations/closest', {
        params: {
          latitude: location.latitude,
          longitude: location.longitude,
          max_distance,
        },
      });
      return response.data as VelibStation;
    } catch (error) {
      // Handle 404 (no station found)
      if ((error as AxiosError).response?.status === 404) {
        return null;
      }
      console.error('Error fetching closest station:', error);
      throw error;
    }
  }

  /**
   * Extract destination from user input text
   */
  async extract_destination(user_input: UserInput): Promise<ProcessingResult> {
    try {
      const response = await api.post('/api/nlp/extract-destination', user_input);
      return response.data as ProcessingResult;
    } catch (error) {
      console.error('Error extracting destination:', error);
      throw error;
    }
  }

  /**
   * Transcribe audio file using Mistral Vox
   */
  async transcribe_audio(
    audio_file: File,
    language: string = 'fr'
  ): Promise<ProcessingResult> {
    try {
      const form_data = new FormData();
      form_data.append('audio_file', audio_file);
      form_data.append('language', language);
      
      const response = await api.post('/api/voice/transcribe', form_data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data as ProcessingResult;
    } catch (error) {
      console.error('Error transcribing audio:', error);
      throw error;
    }
  }

  /**
   * Process voice input: transcribe and extract destination in one step
   */
  async process_voice(
    audio_file: File,
    language: string = 'fr'
  ): Promise<ProcessingResult> {
    try {
      const form_data = new FormData();
      form_data.append('audio_file', audio_file);
      form_data.append('language', language);
      
      const response = await api.post('/api/voice/process', form_data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data as ProcessingResult;
    } catch (error) {
      console.error('Error processing voice:', error);
      throw error;
    }
  }

  /**
   * Geocode an address to get coordinates
   */
  async geocode_address(address: string): Promise<LocationWithAddress> {
    try {
      const response = await api.get('/api/location/geocode', {
        params: { address },
      });
      return response.data as LocationWithAddress;
    } catch (error) {
      console.error('Error geocoding address:', error);
      throw error;
    }
  }

  /**
   * Get supported voice languages
   */
  async get_voice_languages(): Promise<string[]> {
    try {
      const response = await api.get('/api/voice/languages');
      return (response.data as { languages: string[] }).languages;
    } catch (error) {
      console.error('Error fetching voice languages:', error);
      // Return default languages if API fails
      return ['fr', 'en', 'es', 'de', 'it'];
    }
  }

  /**
   * Health check endpoint
   */
  async health_check(): Promise<{ status: string }> {
    try {
      const response = await api.get('/api/health');
      return response.data as { status: string };
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  /**
   * Refresh station data cache
   */
  async refresh_stations(): Promise<void> {
    try {
      await api.post('/api/stations/refresh');
    } catch (error) {
      console.error('Error refreshing stations:', error);
      throw error;
    }
  }

  /**
   * Get a specific station by ID
   */
  async get_station_by_id(station_id: string): Promise<VelibStation | null> {
    try {
      const response = await api.get(`/api/stations/${station_id}`);
      return response.data as VelibStation;
    } catch (error) {
      if ((error as AxiosError).response?.status === 404) {
        return null;
      }
      console.error(`Error fetching station ${station_id}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const apiClient = new VelibApiClient();

export default apiClient;