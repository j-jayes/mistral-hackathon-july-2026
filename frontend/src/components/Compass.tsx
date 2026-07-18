import { useMemo } from 'react';
import { CompassProps } from '@/types';
import { formatDistance, getDirectionName, cn } from '@/lib/utils';

export default function Compass({
  target_direction: direction,
  target_distance: distance,
  size = 280
}: CompassProps) {
  // Calculate needle rotation based on direction
  const needleRotation = useMemo(() => {
    if (direction === null) return 0;
    return direction; // Direction is already relative to device heading
  }, [direction]);

  // Get the compass rose rotation (opposite to needle for visual effect)
  const compassRoseRotation = useMemo(() => {
    if (direction === null) return 0;
    return -direction;
  }, [direction]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Compass card / outer ring */}
      <div className="absolute inset-0 rounded-full bg-card border border-border shadow-md" />
      <div className="absolute inset-0 rounded-full border-4 border-primary/15" />

      {/* Compass rose (rotating background) */}
      <div
        className="absolute inset-4 rounded-full overflow-hidden"
        style={{
          transform: `rotate(${compassRoseRotation}deg)`,
          transition: 'transform 0.5s ease-out'
        }}
      >
        {/* Compass directions */}
        <div className="absolute inset-0 flex items-center justify-center font-mono">
          <span className="absolute top-2 left-1/2 -translate-x-1/2 text-lg font-bold text-primary">N</span>
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-lg font-semibold text-muted-foreground">S</span>
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">W</span>
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">E</span>
        </div>

        {/* Degree markings */}
        <div className="absolute inset-0 border border-primary/10 rounded-full">
          {[0, 45, 90, 135, 180, 225, 270, 315].map(degree => (
            <div
              key={degree}
              className="absolute w-0.5 h-4 bg-primary/30"
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) rotate(${degree}deg) translateY(-50%)`,
                transformOrigin: 'center'
              }}
            />
          ))}
        </div>
      </div>

      {/* Compass needle */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          transform: `rotate(${needleRotation}deg)`,
          transition: 'transform 0.5s ease-out'
        }}
      >
        <div className="relative w-1/2 h-1.5 bg-gradient-to-r from-primary/40 to-primary rounded-full">
          {/* Needle tip (arrow) */}
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-0 h-0 border-l-[12px] border-l-primary border-t-[7px] border-t-transparent border-b-[7px] border-b-transparent" />
        </div>
      </div>

      {/* Center circle */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-10 h-10 bg-card rounded-full border-2 border-primary shadow flex items-center justify-center">
          <div className="w-3 h-3 bg-primary rounded-full" />
        </div>
      </div>

      {/* Direction label at top */}
      {direction !== null && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2">
          <span className="font-mono bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium shadow">
            {getDirectionName(direction)}
          </span>
        </div>
      )}
    </div>
  );
}

// Import types
import { CompassProps as CompassPropsType } from '@/types';

export type { CompassProps as CompassPropsType };