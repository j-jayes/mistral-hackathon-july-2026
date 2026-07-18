/**
 * Station helpers shared across the app.
 *
 * The mock/open-data feed only carries static station metadata (id, name,
 * location, capacity). Live bike/dock availability is simulated — but it must be
 * STABLE per station, otherwise every re-render reshuffles availability and the
 * "closest station with docks" keeps changing under the user. We derive the
 * counts deterministically from the station id so a given station always shows
 * the same numbers within a session.
 */

import { Location, VelibStation, VelibStationSummary } from '@/types';
import { haversineDistance } from '@/lib/utils';

/** Raw station record as it appears in velibStations.json / the open data feed. */
export interface RawStation {
  station_id: string;
  name: string;
  location: Location;
  capacity?: number;
  address?: string;
  last_updated?: string;
}

/** Cheap deterministic hash (FNV-1a) so availability is stable per station id. */
function hashId(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Convert a raw station record into a full VelibStation with stable, simulated
 * availability. Pure and deterministic: same input -> same output every call.
 */
export function convertStationData(raw: RawStation): VelibStation {
  const seed = hashId(raw.station_id);
  const capacity = raw.capacity ?? 30;

  // Deterministic split of capacity into bikes / free docks.
  const bikes = 3 + (seed % Math.max(1, capacity - 4));
  const docks = Math.max(1, capacity - bikes);
  const eBikes = Math.min(bikes, (seed >>> 3) % 6);
  const eDocks = Math.min(docks, (seed >>> 6) % 6);

  return {
    station_id: raw.station_id,
    name: raw.name,
    location: raw.location,
    capacity,
    status: {
      station_id: raw.station_id,
      is_renting: true,
      is_returning: true,
      last_updated: raw.last_updated || new Date().toISOString(),
      num_bikes_available: bikes,
      num_docks_available: docks,
      num_bikes_available_types: { mechanical: bikes - eBikes, electrical: eBikes },
      num_docks_available_types: { mechanical: docks - eDocks, electrical: eDocks },
    },
    has_available_docks: docks > 0,
    has_available_bikes: bikes > 0,
  };
}

/** Project a station to the lightweight summary used by the list/compass. */
export function toSummary(
  station: VelibStation,
  reference: Location | null
): VelibStationSummary {
  return {
    station_id: station.station_id,
    name: station.name,
    location: station.location,
    available_docks: station.status.num_docks_available,
    available_bikes: station.status.num_bikes_available,
    distance: reference
      ? haversineDistance(
          reference.latitude,
          reference.longitude,
          station.location.latitude,
          station.location.longitude
        )
      : null,
    has_available_docks: station.has_available_docks ?? station.status.num_docks_available > 0,
  };
}

/**
 * Summaries for every station, sorted nearest-first relative to `reference`
 * (the destination if one is set, otherwise the user's location). When there is
 * no reference point yet, order is left untouched and distances are null.
 */
export function summarizeStations(
  stations: VelibStation[],
  reference: Location | null
): VelibStationSummary[] {
  const summaries = stations.map((s) => toSummary(s, reference));
  if (reference) {
    summaries.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
  }
  return summaries;
}

/**
 * The closest station WITH available docks to `reference`. This is the single
 * source of truth for "which station do we point the compass at" — whether the
 * reference is the user's GPS position or a typed/spoken destination.
 */
export function findClosestStation(
  stations: VelibStation[],
  reference: Location | null
): VelibStation | null {
  if (!reference) return null;

  let closest: VelibStation | null = null;
  let closestDistance = Infinity;

  for (const station of stations) {
    if (!(station.has_available_docks ?? station.status.num_docks_available > 0)) continue;
    const distance = haversineDistance(
      reference.latitude,
      reference.longitude,
      station.location.latitude,
      station.location.longitude
    );
    if (distance < closestDistance) {
      closestDistance = distance;
      closest = station;
    }
  }

  return closest;
}
