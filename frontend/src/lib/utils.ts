import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combine Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format distance in meters to a readable string
 */
export function formatDistance(meters: number | null): string {
  if (meters === null || meters === undefined) {
    return "---"
  }
  
  if (meters < 1000) {
    return `${Math.round(meters)}m`
  }
  
  const km = meters / 1000
  return km < 10 ? `${km.toFixed(1)}km` : `${Math.round(km)}km`
}

/**
 * Format a number as a percentage
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${(value * 100).toFixed(decimals)}%`
}

/**
 * Normalize an angle to 0-360 degrees
 */
export function normalizeAngle(angle: number): number {
  const normalized = angle % 360
  return normalized < 0 ? normalized + 360 : normalized
}

/**
 * Calculate the relative direction from device heading to target direction
 */
export function calculateRelativeDirection(
  deviceHeading: number | null,
  targetBearing: number | null
): number | null {
  if (deviceHeading === null || targetBearing === null) {
    return null
  }
  
  // Calculate the relative direction
  const relative = (targetBearing - deviceHeading + 360) % 360
  return relative
}

/**
 * Get compass direction name from degrees (N, NE, E, SE, S, SW, W, NW)
 */
export function getDirectionName(degrees: number | null): string {
  if (degrees === null) return "Unknown"
  
  const normalized = normalizeAngle(degrees)
  
  const directions = [
    { name: "N", min: 337.5, max: 22.5 },
    { name: "NE", min: 22.5, max: 67.5 },
    { name: "E", min: 67.5, max: 112.5 },
    { name: "SE", min: 112.5, max: 157.5 },
    { name: "S", min: 157.5, max: 202.5 },
    { name: "SW", min: 202.5, max: 247.5 },
    { name: "W", min: 247.5, max: 292.5 },
    { name: "NW", min: 292.5, max: 337.5 },
  ]
  
  for (const dir of directions) {
    if (normalized >= dir.min && normalized < dir.max) {
      return dir.name
    }
  }
  
  return "N"
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Sleep function for async operations
 */
export async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Capitalize first letter of a string
 */
export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Truncate a string to a maximum length
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + "..."
}

/**
 * Check if the user is on a mobile device
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

/**
 * Check if the user is on iOS
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false
  
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

/**
 * Get the user's preferred color scheme
 */
export function getColorScheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

/**
 * Format a timestamp to a readable string
 */
export function formatTimestamp(timestamp: string | Date): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

/**
 * Calculate the Haversine distance between two coordinates
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000 // Earth radius in meters
  
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180
  
  const a = 
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  
  return R * c
}

/**
 * Calculate bearing between two coordinates
 */
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const λ1 = (lon1 * Math.PI) / 180
  const λ2 = (lon2 * Math.PI) / 180
  
  const y = Math.sin(λ2 - λ1) * Math.cos(φ2)
  const x = 
    Math.cos(φ1) * Math.sin(φ2) - 
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1)
  
  let bearing = (Math.atan2(y, x) * 180) / Math.PI
  bearing = (bearing + 360) % 360
  
  return bearing
}