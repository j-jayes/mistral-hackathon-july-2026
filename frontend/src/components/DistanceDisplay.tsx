import { DistanceDisplayProps } from '@/types';
import { formatDistance } from '@/lib/utils';

export default function DistanceDisplay({
  distance,
  className = ''
}: DistanceDisplayProps) {
  const displayText = formatDistance(distance);

  return (
    <div className={`text-center ${className}`}>
      <div className="bg-purple-600/90 backdrop-blur-sm rounded-xl px-6 py-3">
        <span className="text-3xl font-bold text-white drop-shadow-lg">
          {displayText}
        </span>
      </div>
    </div>
  );
}

// Import types
import { DistanceDisplayProps as DistanceDisplayPropsType } from '@/types';

export type { DistanceDisplayProps as DistanceDisplayPropsType };