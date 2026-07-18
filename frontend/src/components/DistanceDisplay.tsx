import { DistanceDisplayProps } from '@/types';
import { formatDistance } from '@/lib/utils';

export default function DistanceDisplay({
  distance,
  className = ''
}: DistanceDisplayProps) {
  const displayText = formatDistance(distance);

  return (
    <div className={`text-center ${className}`}>
      <div className="bg-primary rounded-xl px-6 py-3 shadow-md">
        <span className="font-mono text-3xl font-bold text-primary-foreground tabular-nums">
          {displayText}
        </span>
      </div>
    </div>
  );
}

// Import types
import { DistanceDisplayProps as DistanceDisplayPropsType } from '@/types';

export type { DistanceDisplayProps as DistanceDisplayPropsType };