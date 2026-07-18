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
      {/* Compass outer ring */}
      <div className="absolute inset-0 rounded-full border-4 border-white/30 shadow-lg" />
      
      {/* Compass rose (rotating background) */}
      <div 
        className="absolute inset-4 rounded-full overflow-hidden"
        style={{
          transform: `rotate(${compassRoseRotation}deg)`,
          transition: 'transform 0.5s ease-out'
        }}
      >
        {/* Compass directions */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="absolute top-2 left-1/2 -translate-x-1/2 text-lg font-bold text-purple-800">N</span>
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-lg font-bold text-purple-800">S</span>
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-lg font-bold text-purple-800">W</span>
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-lg font-bold text-purple-800">E</span>
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-purple-900">+</span>
        </div>
        
        {/* Degree markings */}
        <div className="absolute inset-0 border border-purple-300/50 rounded-full">
          {[0, 45, 90, 135, 180, 225, 270, 315].map(degree => (
            <div 
              key={degree}
              className="absolute w-0.5 h-4 bg-purple-400"
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
        <div className="relative w-1/2 h-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-full">
          {/* Needle tip (arrow) */}
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-0 h-0 border-l-[10px] border-l-red-500 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent" />
        </div>
      </div>
      
      {/* Center circle */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-10 h-10 bg-white rounded-full border-2 border-purple-400 shadow-md flex items-center justify-center">
          <div className="w-3 h-3 bg-purple-500 rounded-full" />
        </div>
      </div>
      
      {/* Direction label at top */}
      {direction !== null && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2">
          <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
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