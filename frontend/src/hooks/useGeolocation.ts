import { useState, useEffect, useCallback } from 'react';
import { Location } from '@/types';

interface GeolocationState {
  location: Location | null;
  error: string | null;
  is_loading: boolean;
}

interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export function useGeolocation(options: GeolocationOptions = {}) {
  const [geolocation, setGeolocation] = useState<GeolocationState>({
    location: null,
    error: null,
    is_loading: true,
  });

  const onSuccess = useCallback((position: GeolocationPosition) => {
    const { latitude, longitude } = position.coords;
    setGeolocation({
      location: { latitude, longitude },
      error: null,
      is_loading: false,
    });
  }, []);

  const onError = useCallback((error: GeolocationPositionError) => {
    let error_message = 'Failed to get location';
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        error_message = 'Location access denied. Please enable location permissions.';
        break;
      case error.POSITION_UNAVAILABLE:
        error_message = 'Location information is unavailable.';
        break;
      case error.TIMEOUT:
        error_message = 'The request to get location timed out.';
        break;
      default:
        error_message = error.message || error_message;
    }
    
    setGeolocation({
      location: null,
      error: error_message,
      is_loading: false,
    });
  }, []);

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setGeolocation({
        location: null,
        error: 'Geolocation is not supported by your browser',
        is_loading: false,
      });
      return;
    }

    setGeolocation(prev => ({ ...prev, is_loading: true }));
    
    navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
  }, [onSuccess, onError, options]);

  // Watch position for continuous updates
  const watchPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setGeolocation({
        location: null,
        error: 'Geolocation is not supported by your browser',
        is_loading: false,
      });
      return null;
    }

    setGeolocation(prev => ({ ...prev, is_loading: true }));
    
    return navigator.geolocation.watchPosition(onSuccess, onError, options);
  }, [onSuccess, onError, options]);

  // Clear watch
  const clearWatch = useCallback((watchId: number | null) => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Get position once on mount
  useEffect(() => {
    getCurrentPosition();
  }, [getCurrentPosition]);

  return {
    ...geolocation,
    getCurrentPosition,
    watchPosition,
    clearWatch,
  };
}

export default useGeolocation;