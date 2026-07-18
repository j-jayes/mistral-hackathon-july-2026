/**
 * Geocoding utilities for address to coordinates conversion
 * Uses pattern matching and fallback logic when Mistral APIs are unavailable
 */

import { Location } from '@/types';

// Common Paris street patterns and their approximate coordinates
const PARIS_STREETS: Record<string, Location> = {
  // Main streets in Le Marais (4th arrondissement)
  'rue des gravilliers': { latitude: 48.8615, longitude: 2.3636 },
  'rue des gravilliers paris': { latitude: 48.8615, longitude: 2.3636 },
  '21 rue des gravilliers': { latitude: 48.8615, longitude: 2.3636 },
  '21 rue des gravilliers paris': { latitude: 48.8615, longitude: 2.3636 },
  
  // Other famous Paris streets
  'rue de rivoli': { latitude: 48.8584, longitude: 2.3486 },
  'boulevard saint-germain': { latitude: 48.8550, longitude: 2.3358 },
  'boulevard saint michel': { latitude: 48.8520, longitude: 2.3455 },
  'rue de la huchette': { latitude: 48.8517, longitude: 2.3462 },
  'rue mouffetard': { latitude: 48.8432, longitude: 2.3429 },
  'avenue des champs élysées': { latitude: 48.8700, longitude: 2.3141 },
  'avenue des champs elysees': { latitude: 48.8700, longitude: 2.3141 },
  'rue montorgueil': { latitude: 48.8686, longitude: 2.3462 },
  
  // Arrondissements (approximate centers)
  '1er arrondissement': { latitude: 48.8606, longitude: 2.3376 },
  '2ème arrondissement': { latitude: 48.8719, longitude: 2.3486 },
  '3ème arrondissement': { latitude: 48.8642, longitude: 2.3612 },
  '4ème arrondissement': { latitude: 48.8550, longitude: 2.3636 },
  '5ème arrondissement': { latitude: 48.8486, longitude: 2.3486 },
  '6ème arrondissement': { latitude: 48.8550, longitude: 2.3358 },
  '7ème arrondissement': { latitude: 48.8600, longitude: 2.3250 },
  '8ème arrondissement': { latitude: 48.8719, longitude: 2.3260 },
  '9ème arrondissement': { latitude: 48.8719, longitude: 2.3486 },
  '10ème arrondissement': { latitude: 48.8700, longitude: 2.3550 },
  '11ème arrondissement': { latitude: 48.8639, longitude: 2.3714 },
  '12ème arrondissement': { latitude: 48.8442, longitude: 2.3732 },
  
  // Landmarks
  'notre dame': { latitude: 48.8534, longitude: 2.3488 },
  'notre dame de paris': { latitude: 48.8534, longitude: 2.3488 },
  'cathedrale notre dame': { latitude: 48.8534, longitude: 2.3488 },
  'sainte chapelle': { latitude: 48.8556, longitude: 2.3469 },
  'louvre': { latitude: 48.8606, longitude: 2.3376 },
  'musée du louvre': { latitude: 48.8606, longitude: 2.3376 },
  'eiffel tower': { latitude: 48.8584, longitude: 2.2945 },
  'tour eiffel': { latitude: 48.8584, longitude: 2.2945 },
  'arc de triomphe': { latitude: 48.8738, longitude: 2.2950 },
  'châtelet': { latitude: 48.8586, longitude: 2.3463 },
  'chatelet les halles': { latitude: 48.8586, longitude: 2.3463 },
  'gare de lyon': { latitude: 48.8442, longitude: 2.3732 },
  'gare du nord': { latitude: 48.8808, longitude: 2.3550 },
  'gare montparnasse': { latitude: 48.8423, longitude: 2.3231 },
  'montparnasse': { latitude: 48.8423, longitude: 2.3231 },
  'sacré cœur': { latitude: 48.8867, longitude: 2.3431 },
  'sacre coeur': { latitude: 48.8867, longitude: 2.3431 },
  'pigalle': { latitude: 48.8841, longitude: 2.3417 },
  'opéra garnier': { latitude: 48.8719, longitude: 2.3515 },
  'opera garnier': { latitude: 48.8719, longitude: 2.3515 },
  'republique': { latitude: 48.8692, longitude: 2.3630 },
  'place de la république': { latitude: 48.8692, longitude: 2.3630 },
  'bastille': { latitude: 48.8534, longitude: 2.3690 },
  'place de la bastille': { latitude: 48.8534, longitude: 2.3690 },
  'marais': { latitude: 48.8550, longitude: 2.3636 },
  'le marais': { latitude: 48.8550, longitude: 2.3636 },
  'jardin du luxembourg': { latitude: 48.8467, longitude: 2.3374 },
  'père lachaise': { latitude: 48.8686, longitude: 2.3934 },
  'buttes chaumont': { latitude: 48.8858, longitude: 2.3886 },
  'les invalides': { latitude: 48.8611, longitude: 2.3125 },
  'bercy': { latitude: 48.8358, longitude: 2.3789 },
};

// Common place names in Paris districts
const PARIS_DISTRICTS: Record<string, Location> = {
  'paris': { latitude: 48.8566, longitude: 2.3522 },
  'center of paris': { latitude: 48.8566, longitude: 2.3522 },
  'centre de paris': { latitude: 48.8566, longitude: 2.3522 },
  'downtown paris': { latitude: 48.8566, longitude: 2.3522 },
  
  // Quartiers
  'quartier latin': { latitude: 48.8520, longitude: 2.3455 },
  'latin quarter': { latitude: 48.8520, longitude: 2.3455 },
  'saint germain des près': { latitude: 48.8550, longitude: 2.3358 },
  'saint germain': { latitude: 48.8550, longitude: 2.3358 },
  'saint michel': { latitude: 48.8520, longitude: 2.3455 },
  'montmartre': { latitude: 48.8867, longitude: 2.3431 },
  'belleville': { latitude: 48.8686, longitude: 2.3886 },
  'menilmontant': { latitude: 48.8686, longitude: 2.3934 },
};

/**
 * Normalize text for pattern matching (lowercase, remove accents, trim)
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim();
}

/**
 * Try to extract coordinates from address using pattern matching
 * This is a fallback when geocoding APIs are unavailable
 */
export function extractCoordinatesFromAddress(address: string): Location | null {
  if (!address || typeof address !== 'string') {
    return null;
  }

  const normalized = normalizeText(address);

  // Check exact matches first
  for (const [key, location] of Object.entries(PARIS_STREETS)) {
    if (normalized.includes(normalizeText(key))) {
      return location;
    }
  }

  // Check for district matches
  for (const [key, location] of Object.entries(PARIS_DISTRICTS)) {
    if (normalized.includes(normalizeText(key))) {
      return location;
    }
  }

  // Try to extract street numbers and names
  // Match patterns like "21 rue des gravilliers" or "123 av des champs elysees"
  const streetMatch = normalized.match(/(\d+)\s+(\w+)\s+(\w+)/);
  if (streetMatch) {
    const streetName = `${streetMatch[2]} ${streetMatch[3]}`;
    for (const [key, location] of Object.entries(PARIS_STREETS)) {
      if (normalizeText(key).includes(streetName)) {
        return location;
      }
    }
  }

  // If we can't find a specific match, return a default Paris center
  console.warn(`Could not find exact match for address: ${address}, using Paris center`);
  return PARIS_DISTRICTS.paris;
}

/**
 * Enhanced geocoding that tries multiple strategies
 * 1. First tries to use the API (if available)
 * 2. Falls back to pattern matching
 * 3. Finally falls back to Paris center
 */
export async function geocodeAddress(address: string): Promise<Location> {
  // First, try the API
  try {
    // Import dynamically to avoid circular dependencies
    const { apiClient } = await import('@/api/client');
    const result = await apiClient.geocode_address(address);
    if (result && result.latitude && result.longitude) {
      return { latitude: result.latitude, longitude: result.longitude };
    }
  } catch (error) {
    console.log('API geocoding failed, trying pattern matching:', error);
  }

  // Fallback to pattern matching
  const location = extractCoordinatesFromAddress(address);
  if (location) {
    return location;
  }

  // Ultimate fallback to Paris center
  console.warn(`No geocoding match for: ${address}, using Paris center`);
  return { latitude: 48.8566, longitude: 2.3522 };
}

/**
 * Check if an address string contains a known Paris location
 */
export function isKnownParisLocation(address: string): boolean {
  const normalized = normalizeText(address);
  
  const allKeys = [
    ...Object.keys(PARIS_STREETS),
    ...Object.keys(PARIS_DISTRICTS)
  ];
  
  return allKeys.some(key => normalized.includes(normalizeText(key)));
}

export default {
  extractCoordinatesFromAddress,
  geocodeAddress,
  isKnownParisLocation,
  normalizeText
};