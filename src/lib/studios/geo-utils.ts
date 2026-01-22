/**
 * Calculate the distance between two coordinates using the Haversine formula
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Sort locations by distance from a point
 */
export function sortByDistance<T extends { latitude?: number | null; longitude?: number | null }>(
  locations: T[],
  fromLat: number,
  fromLng: number
): (T & { distance: number })[] {
  return locations
    .filter(loc => loc.latitude != null && loc.longitude != null)
    .map(loc => ({
      ...loc,
      distance: calculateDistance(fromLat, fromLng, loc.latitude!, loc.longitude!),
    }))
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Check if a point is within a radius (in km) of another point
 */
export function isWithinRadius(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  radiusKm: number
): boolean {
  return calculateDistance(lat1, lng1, lat2, lng2) <= radiusKm;
}

/**
 * Create a bounding box for a point with a given radius
 * Useful for initial DB queries before precise distance filtering
 */
export function getBoundingBox(
  lat: number,
  lng: number,
  radiusKm: number
): { minLat: number; maxLat: number; minLng: number; maxLng: number } {
  // Approximate degrees per km
  const latDelta = radiusKm / 111; // 1 degree latitude ~ 111km
  const lngDelta = radiusKm / (111 * Math.cos(toRadians(lat)));

  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  };
}
