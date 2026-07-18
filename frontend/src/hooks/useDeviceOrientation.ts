import { useState, useEffect, useCallback } from 'react';
import { DeviceOrientationEvent } from '@/types';

interface DeviceOrientationState {
  heading: number | null; // Compass heading in degrees (0-360)
  alpha: number | null;   // Same as heading
  beta: number | null;    // Front-to-back tilt
  gamma: number | null;   // Left-to-right tilt
  absolute: boolean | null; // Whether the values are absolute
  error: string | null;
  is_supported: boolean;
}

// Type for the device orientation event
declare global {
  interface Window {
    DeviceOrientationEvent: typeof DeviceOrientationEvent;
  }
}

export function useDeviceOrientation() {
  const [orientation, setOrientation] = useState<DeviceOrientationState>({
    heading: null,
    alpha: null,
    beta: null,
    gamma: null,
    absolute: null,
    error: null,
    is_supported: typeof window !== 'undefined' && 
      'DeviceOrientationEvent' in window && 
      typeof (window as any).DeviceOrientationEvent !== 'undefined',
  });

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    // On iOS, we need to check if the event has the correct properties
    if (event.alpha !== null) {
      // Normalize heading to 0-360 degrees
      const heading = event.alpha % 360;
      setOrientation(prev => ({
        ...prev,
        heading,
        alpha: event.alpha,
        beta: event.beta,
        gamma: event.gamma,
        absolute: event.absolute,
        error: null,
      }));
    }
  }, []);

  const handleError = useCallback((error: Error) => {
    setOrientation(prev => ({
      ...prev,
      error: error.message || 'Device orientation error',
    }));
  }, []);

  // Start listening for device orientation
  const startListening = useCallback(() => {
    if (!orientation.is_supported) {
      setOrientation(prev => ({
        ...prev,
        error: 'Device orientation not supported in this browser',
      }));
      return;
    }

    try {
      // Check if permission is already granted
      if (typeof (window as any).DeviceOrientationEvent !== 'undefined') {
        window.addEventListener('deviceorientation', handleOrientation as EventListener);
        setOrientation(prev => ({ ...prev, error: null }));
      } else {
        setOrientation(prev => ({
          ...prev,
          error: 'Device orientation API not available',
        }));
      }
    } catch (error) {
      handleError(error as Error);
    }
  }, [orientation.is_supported, handleOrientation, handleError]);

  // Stop listening for device orientation
  const stopListening = useCallback(() => {
    if (orientation.is_supported) {
      window.removeEventListener('deviceorientation', handleOrientation as EventListener);
    }
  }, [orientation.is_supported, handleOrientation]);

  // Request permission (iOS specific)
  const requestPermission = useCallback(async () => {
    if (!orientation.is_supported) {
      return false;
    }

    try {
      // iOS 13+ requires user permission for device orientation
      if (typeof (deviceOrientation as any)?.requestPermission === 'function') {
        // @ts-ignore - iOS specific
        const response = await DeviceOrientation.requestPermission();
        if (response === 'granted') {
          startListening();
          return true;
        }
        return false;
      }
      
      // For other browsers, just start listening
      startListening();
      return true;
    } catch (error) {
      handleError(error as Error);
      return false;
    }
  }, [orientation.is_supported, startListening, handleError]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  // Auto-start on mount (with permission on iOS)
  useEffect(() => {
    if (orientation.is_supported) {
      requestPermission();
    }
  }, [orientation.is_supported, requestPermission]);

  return {
    ...orientation,
    startListening,
    stopListening,
    requestPermission,
  };
}

export default useDeviceOrientation;