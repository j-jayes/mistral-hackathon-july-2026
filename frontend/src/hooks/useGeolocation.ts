import { useState, useEffect, useCallback, useRef } from 'react';
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

  // Keep the latest options in a ref so callbacks stay stable across renders
  // (App passes a fresh object literal each render, which would otherwise
  // re-register the geolocation watcher on every render).
  const optionsRef = useRef<GeolocationOptions>(options);
  optionsRef.current = options;

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

    setGeolocation(prev => ({
      ...prev,
      error: error_message,
      is_loading: false,
    }));
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
    navigator.geolocation.getCurrentPosition(onSuccess, onError, optionsRef.current);
  }, [onSuccess, onError]);

  // Continuously watch the position for live navigation updates.
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeolocation({
        location: null,
        error: 'Geolocation is not supported by your browser',
        is_loading: false,
      });
      return;
    }

    const watchId = navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 5000,
      ...optionsRef.current,
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [onSuccess, onError]);

  return {
    ...geolocation,
    getCurrentPosition,
  };
}

export default useGeolocation;
