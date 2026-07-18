import { useState, useEffect, useCallback, useRef } from 'react';
import { DeviceOrientationEvent, CompassPermission } from '@/types';

interface DeviceOrientationState {
  heading: number | null; // Compass heading in degrees (0-360, clockwise from North)
  alpha: number | null;   // Raw alpha
  beta: number | null;    // Front-to-back tilt
  gamma: number | null;   // Left-to-right tilt
  absolute: boolean | null; // Whether the values are absolute
  error: string | null;
  is_supported: boolean;
  permission: CompassPermission;
}

// The iOS Safari DeviceOrientationEvent constructor exposes a static
// requestPermission(); standard browsers do not.
type OrientationEventCtor = {
  requestPermission?: () => Promise<'granted' | 'denied'>;
};

function isSupported(): boolean {
  return typeof window !== 'undefined' && 'DeviceOrientationEvent' in window;
}

function needsPermission(): boolean {
  return (
    isSupported() &&
    typeof (window.DeviceOrientationEvent as unknown as OrientationEventCtor)
      .requestPermission === 'function'
  );
}

export function useDeviceOrientation() {
  const [orientation, setOrientation] = useState<DeviceOrientationState>({
    heading: null,
    alpha: null,
    beta: null,
    gamma: null,
    absolute: null,
    error: null,
    is_supported: isSupported(),
    // iOS requires an explicit user-gesture grant; other browsers do not.
    permission: !isSupported()
      ? 'unsupported'
      : needsPermission()
        ? 'unknown'
        : 'granted',
  });

  // Track which event name we attached so we can clean up the same one.
  const eventNameRef = useRef<'deviceorientationabsolute' | 'deviceorientation' | null>(null);

  const handleOrientation = useCallback((event: Event) => {
    const e = event as unknown as DeviceOrientationEvent;

    let heading: number | null = null;

    if (typeof e.webkitCompassHeading === 'number' && !Number.isNaN(e.webkitCompassHeading)) {
      // iOS: webkitCompassHeading is the true-north heading, clockwise. Use directly.
      heading = e.webkitCompassHeading;
    } else if (e.alpha !== null && e.alpha !== undefined) {
      // Android/absolute: alpha increases counter-clockwise, so invert for a
      // clockwise compass heading (0 = North).
      heading = (360 - e.alpha) % 360;
    }

    if (heading !== null) {
      const normalized = (heading + 360) % 360;
      setOrientation(prev => ({
        ...prev,
        heading: normalized,
        alpha: e.alpha,
        beta: e.beta,
        gamma: e.gamma,
        absolute: e.absolute,
        error: null,
      }));
    }
  }, []);

  // Attach the best available orientation event.
  const startListening = useCallback(() => {
    if (!isSupported()) {
      setOrientation(prev => ({
        ...prev,
        error: 'Device orientation not supported in this browser',
      }));
      return;
    }
    if (eventNameRef.current) return; // already listening

    const name: 'deviceorientationabsolute' | 'deviceorientation' =
      'ondeviceorientationabsolute' in window
        ? 'deviceorientationabsolute'
        : 'deviceorientation';
    eventNameRef.current = name;
    window.addEventListener(name, handleOrientation as EventListener);
    setOrientation(prev => ({ ...prev, error: null }));
  }, [handleOrientation]);

  const stopListening = useCallback(() => {
    if (eventNameRef.current) {
      window.removeEventListener(eventNameRef.current, handleOrientation as EventListener);
      eventNameRef.current = null;
    }
  }, [handleOrientation]);

  // Request permission. On iOS this MUST be called synchronously from a user
  // gesture (e.g. a button click) or the prompt is silently rejected.
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported()) {
      setOrientation(prev => ({ ...prev, permission: 'unsupported' }));
      return false;
    }

    const ctor = window.DeviceOrientationEvent as unknown as OrientationEventCtor;

    if (typeof ctor.requestPermission === 'function') {
      try {
        const response = await ctor.requestPermission();
        if (response === 'granted') {
          startListening();
          setOrientation(prev => ({ ...prev, permission: 'granted', error: null }));
          return true;
        }
        setOrientation(prev => ({
          ...prev,
          permission: 'denied',
          error: 'Compass permission denied',
        }));
        return false;
      } catch (error) {
        setOrientation(prev => ({
          ...prev,
          permission: 'denied',
          error: (error as Error)?.message || 'Compass permission error',
        }));
        return false;
      }
    }

    // Non-iOS: no explicit permission needed.
    startListening();
    setOrientation(prev => ({ ...prev, permission: 'granted' }));
    return true;
  }, [startListening]);

  // Auto-start only where no user gesture is required (Android / desktop).
  // iOS waits for the "Enable Compass" button to call requestPermission().
  useEffect(() => {
    if (isSupported() && !needsPermission()) {
      startListening();
    }
    return () => {
      stopListening();
    };
  }, [startListening, stopListening]);

  return {
    ...orientation,
    startListening,
    stopListening,
    requestPermission,
  };
}

export default useDeviceOrientation;
