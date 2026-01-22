import { prisma } from '@/lib/db';
import { checkRateLimit, logApiUsage } from './rate-limiter';

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const PLACES_BASE_URL = 'https://maps.googleapis.com/maps/api/place';
const GEOCODE_BASE_URL = 'https://maps.googleapis.com/maps/api/geocode';

// Cache durations
const CACHE_DURATIONS = {
  STUDIO_BASIC: 365 * 24 * 60 * 60 * 1000, // Permanent (1 year)
  PLACE_DETAILS: 7 * 24 * 60 * 60 * 1000,  // 7 days
  GEOCODE: 30 * 24 * 60 * 60 * 1000,       // 30 days
  NEARBY_SEARCH: 24 * 60 * 60 * 1000,      // 24 hours
};

export interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address?: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
  opening_hours?: {
    open_now?: boolean;
    weekday_text?: string[];
  };
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  vicinity?: string;
  business_status?: string;
}

export interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  international_phone_number?: string;
  website?: string;
  url?: string;
  rating?: number;
  user_ratings_total?: number;
  opening_hours?: {
    open_now?: boolean;
    weekday_text?: string[];
    periods?: Array<{
      open: { day: number; time: string };
      close?: { day: number; time: string };
    }>;
  };
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  reviews?: Array<{
    author_name: string;
    rating: number;
    text: string;
    time: number;
  }>;
}

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  formattedName: string;
}

/**
 * Search for nearby Pilates studios using Google Places API
 * First checks database cache, then falls back to API
 */
export async function searchNearbyStudios(
  latitude: number,
  longitude: number,
  radiusMeters: number = 10000,
  keyword: string = 'Pilates studio'
): Promise<PlaceResult[]> {
  // Check rate limit
  const canProceed = await checkRateLimit('nearby_search', 100);
  if (!canProceed) {
    throw new Error('Daily rate limit exceeded for nearby search');
  }

  const url = new URL(`${PLACES_BASE_URL}/nearbysearch/json`);
  url.searchParams.set('location', `${latitude},${longitude}`);
  url.searchParams.set('radius', radiusMeters.toString());
  url.searchParams.set('keyword', keyword);
  url.searchParams.set('type', 'gym');
  url.searchParams.set('key', GOOGLE_API_KEY!);

  const response = await fetch(url.toString());
  const data = await response.json();

  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    console.error('Google Places API error:', data.status, data.error_message);
    throw new Error(`Google Places API error: ${data.status}`);
  }

  await logApiUsage('nearby_search');

  return data.results || [];
}

/**
 * Get detailed information about a place
 * Caches results for 7 days
 */
export async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  // Check rate limit
  const canProceed = await checkRateLimit('place_details', 200);
  if (!canProceed) {
    throw new Error('Daily rate limit exceeded for place details');
  }

  const url = new URL(`${PLACES_BASE_URL}/details/json`);
  url.searchParams.set('place_id', placeId);
  url.searchParams.set('fields', [
    'place_id',
    'name',
    'formatted_address',
    'formatted_phone_number',
    'international_phone_number',
    'website',
    'url',
    'rating',
    'user_ratings_total',
    'opening_hours',
    'photos',
    'geometry',
    'reviews'
  ].join(','));
  url.searchParams.set('key', GOOGLE_API_KEY!);

  const response = await fetch(url.toString());
  const data = await response.json();

  if (data.status !== 'OK') {
    console.error('Google Places Details API error:', data.status, data.error_message);
    return null;
  }

  await logApiUsage('place_details');

  return data.result;
}

/**
 * Geocode a location string (city, address, etc.)
 * Caches results for 30 days
 */
export async function geocodeLocation(query: string): Promise<GeocodingResult | null> {
  // Check cache first
  const normalizedQuery = query.toLowerCase().trim();
  const cached = await prisma.geoCache.findUnique({
    where: { query: normalizedQuery },
  });

  if (cached) {
    const cacheAge = Date.now() - cached.cachedAt.getTime();
    if (cacheAge < CACHE_DURATIONS.GEOCODE) {
      return {
        latitude: cached.latitude,
        longitude: cached.longitude,
        formattedName: cached.formattedName,
      };
    }
  }

  // Check rate limit
  const canProceed = await checkRateLimit('geocode', 500);
  if (!canProceed) {
    throw new Error('Daily rate limit exceeded for geocoding');
  }

  const url = new URL(`${GEOCODE_BASE_URL}/json`);
  url.searchParams.set('address', query);
  url.searchParams.set('key', GOOGLE_API_KEY!);

  const response = await fetch(url.toString());
  const data = await response.json();

  if (data.status !== 'OK' || !data.results?.length) {
    console.error('Google Geocoding API error:', data.status, data.error_message);
    return null;
  }

  await logApiUsage('geocode');

  const result = data.results[0];
  const geocoded = {
    latitude: result.geometry.location.lat,
    longitude: result.geometry.location.lng,
    formattedName: result.formatted_address,
  };

  // Cache the result
  await prisma.geoCache.upsert({
    where: { query: normalizedQuery },
    update: {
      latitude: geocoded.latitude,
      longitude: geocoded.longitude,
      formattedName: geocoded.formattedName,
      cachedAt: new Date(),
    },
    create: {
      query: normalizedQuery,
      latitude: geocoded.latitude,
      longitude: geocoded.longitude,
      formattedName: geocoded.formattedName,
    },
  });

  return geocoded;
}

/**
 * Get photo URL from Google Places photo reference
 */
export function getPhotoUrl(photoReference: string, maxWidth: number = 400): string {
  return `${PLACES_BASE_URL}/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${GOOGLE_API_KEY}`;
}

/**
 * Convert a Google Place result to our Studio format and save to DB
 */
export async function upsertStudioFromPlace(place: PlaceResult) {
  const existingStudio = await prisma.studio.findUnique({
    where: { googlePlaceId: place.place_id },
  });

  // Extract city from formatted_address or vicinity
  const addressParts = (place.formatted_address || place.vicinity || '').split(',');
  const city = addressParts.length > 1 ? addressParts[1].trim() : addressParts[0].trim();

  const studioData = {
    name: place.name,
    city: city,
    address: place.formatted_address || place.vicinity,
    latitude: place.geometry.location.lat,
    longitude: place.geometry.location.lng,
    googlePlaceId: place.place_id,
    rating: place.rating,
    ratingCount: place.user_ratings_total,
    photos: place.photos ? place.photos.slice(0, 5).map(p => ({
      reference: p.photo_reference,
      height: p.height,
      width: p.width,
    })) : [],
  };

  if (existingStudio) {
    return prisma.studio.update({
      where: { id: existingStudio.id },
      data: studioData,
    });
  }

  return prisma.studio.create({
    data: studioData,
  });
}

/**
 * Update studio with detailed Google Places data
 */
export async function updateStudioWithDetails(studioId: string, details: PlaceDetails) {
  return prisma.studio.update({
    where: { id: studioId },
    data: {
      formattedAddress: details.formatted_address,
      phoneNumber: details.formatted_phone_number || details.international_phone_number,
      website: details.website,
      rating: details.rating,
      ratingCount: details.user_ratings_total,
      openingHours: details.opening_hours ? {
        open_now: details.opening_hours.open_now,
        weekday_text: details.opening_hours.weekday_text,
        periods: details.opening_hours.periods,
      } : undefined,
      photos: details.photos ? details.photos.slice(0, 5).map(p => ({
        reference: p.photo_reference,
        height: p.height,
        width: p.width,
      })) : [],
      googleDataFetched: new Date(),
    },
  });
}

/**
 * Check if studio data is stale (older than 7 days)
 */
export function isStudioDataStale(googleDataFetched: Date | null): boolean {
  if (!googleDataFetched) return true;
  const age = Date.now() - googleDataFetched.getTime();
  return age > CACHE_DURATIONS.PLACE_DETAILS;
}
