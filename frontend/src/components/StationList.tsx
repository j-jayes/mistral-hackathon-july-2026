import { StationListProps, VelibStationSummary } from '@/types';
import { formatDistance } from '@/lib/utils';
import { Bike, Clock } from 'lucide-react';

interface StationCardProps {
  station: VelibStationSummary;
  onSelect: (station: VelibStationSummary) => void;
  is_selected: boolean;
}

export default function StationList({
  stations,
  onSelectStation,
  selected_station_id
}: StationListProps) {
  if (stations.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>No stations with available docks found nearby</p>
      </div>
    );
  }

  return (
    <div className="p-2">
      <div className="space-y-2">
        {stations.map((station) => (
          <StationCard
            key={station.station_id}
            station={station}
            onSelect={onSelectStation}
            is_selected={station.station_id === selected_station_id}
          />
        ))}
      </div>
    </div>
  );
}

function StationCard({ station, onSelect, is_selected }: StationCardProps) {
  const distance = formatDistance(station.distance);

  return (
    <button
      onClick={() => onSelect(station)}
      className={`w-full p-4 rounded-xl text-left transition-all duration-200 border ${
        is_selected
          ? 'bg-secondary ring-2 ring-primary border-primary/30'
          : 'bg-card hover:bg-secondary/50 border-border'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-foreground truncate">
            {station.name}
          </h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <Bike className="w-4 h-4 text-success" />
              {station.available_docks} docks
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-4" />
              {station.available_bikes} bikes
            </span>
          </div>
        </div>

        <div className="text-right ml-4">
          <p className="font-mono text-xl font-bold text-primary tabular-nums">
            {distance}
          </p>
          <p className="text-xs text-muted-foreground">
            {station.has_available_docks ? 'Available' : 'Full'}
          </p>
        </div>
      </div>
    </button>
  );
}
