// The exact 20-station demo set + destination used in the presentation slide,
// so the video and the deck tell the same story.

export type Station = { name: string; lat: number; lng: number };

export const STATIONS: Station[] = [
  { name: 'Gare de Lyon', lat: 48.8442, lng: 2.3732 },
  { name: 'Châtelet - Les Halles', lat: 48.8586, lng: 2.3463 },
  { name: 'Notre-Dame', lat: 48.8534, lng: 2.3488 },
  { name: 'Saint-Michel', lat: 48.852, lng: 2.3455 },
  { name: 'Louvre - Rivoli', lat: 48.8606, lng: 2.3376 },
  { name: 'Pigalle', lat: 48.8841, lng: 2.3417 },
  { name: 'Montparnasse', lat: 48.8423, lng: 2.3231 },
  { name: 'Opéra Garnier', lat: 48.8719, lng: 2.3515 },
  { name: 'Gare du Nord', lat: 48.8808, lng: 2.355 },
  { name: 'Eiffel Tower', lat: 48.8584, lng: 2.2945 },
  { name: 'Luxembourg', lat: 48.8467, lng: 2.3374 },
  { name: 'République', lat: 48.8692, lng: 2.363 },
  { name: 'Bastille', lat: 48.8534, lng: 2.369 },
  { name: 'Marais - Saint-Paul', lat: 48.8545, lng: 2.3636 },
  { name: 'Turbigo - Réaumur', lat: 48.8656, lng: 2.3562 },
  { name: 'Les Invalides', lat: 48.8611, lng: 2.3125 },
  { name: 'Arc de Triomphe', lat: 48.8738, lng: 2.295 },
  { name: 'Père Lachaise', lat: 48.8686, lng: 2.3934 },
  { name: 'Buttes-Chaumont', lat: 48.8858, lng: 2.3886 },
  { name: 'Bercy', lat: 48.8358, lng: 2.3789 },
];

export const DEST: Station = {
  name: '21 rue des Gravilliers',
  lat: 48.8637,
  lng: 2.3569,
};

const COMPASS_DIRS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const;

// Nearest 8-point cardinal for a bearing in degrees.
export function cardinal(deg: number): string {
  return COMPASS_DIRS[Math.round(((deg % 360) + 360) / 45) % 8];
}

const R = 6371000;
const toRad = Math.PI / 180;

// Great-circle distance in metres — the same haversine that runs on the phone.
export function haversine(a: Station, b: Station): number {
  const dLat = (b.lat - a.lat) * toRad;
  const dLng = (b.lng - a.lng) * toRad;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * toRad) * Math.cos(b.lat * toRad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

// Initial bearing from a → b, degrees clockwise from true north.
export function bearing(a: Station, b: Station): number {
  const dLng = (b.lng - a.lng) * toRad;
  const y = Math.sin(dLng) * Math.cos(b.lat * toRad);
  const x =
    Math.cos(a.lat * toRad) * Math.sin(b.lat * toRad) -
    Math.sin(a.lat * toRad) * Math.cos(b.lat * toRad) * Math.cos(dLng);
  return (Math.atan2(y, x) * 180) / Math.PI;
}

export const NEAREST: Station = STATIONS.reduce((best, s) =>
  haversine(DEST, s) < haversine(DEST, best) ? s : best,
);

export const NEAREST_DISTANCE = Math.round(haversine(DEST, NEAREST));
export const NEAREST_BEARING = (bearing(DEST, NEAREST) + 360) % 360;

// Equirectangular projection of lat/lng into a pixel box, with padding.
export function makeProjector(
  width: number,
  height: number,
  pad: number,
) {
  const all = [...STATIONS, DEST];
  const lats = all.map((s) => s.lat);
  const lngs = all.map((s) => s.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  // Correct for longitude compression at Paris' latitude so the map isn't stretched.
  const midLat = (minLat + maxLat) / 2;
  const lngScale = Math.cos(midLat * toRad);
  const spanX = (maxLng - minLng) * lngScale;
  const spanY = maxLat - minLat;

  const innerW = width - pad * 2;
  const innerH = height - pad * 2;
  const scale = Math.min(innerW / spanX, innerH / spanY);

  const offsetX = pad + (innerW - spanX * scale) / 2;
  const offsetY = pad + (innerH - spanY * scale) / 2;

  return (s: Station): { x: number; y: number } => ({
    x: offsetX + (s.lng - minLng) * lngScale * scale,
    // invert Y: higher latitude = further north = higher on screen
    y: offsetY + (maxLat - s.lat) * scale,
  });
}
