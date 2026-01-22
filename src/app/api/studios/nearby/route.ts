import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  searchNearbyStudios,
  upsertStudioFromPlace,
} from '@/lib/studios/google-places';
import { getBoundingBox, sortByDistance } from '@/lib/studios/geo-utils';

const MIN_DB_RESULTS = 5;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '');
    const lng = parseFloat(searchParams.get('lng') || '');
    const radius = parseInt(searchParams.get('radius') || '10000', 10); // Default 10km
    const keyword = searchParams.get('keyword') || 'Pilates studio';

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: 'Invalid latitude or longitude' },
        { status: 400 }
      );
    }

    const radiusKm = radius / 1000;

    // First, check database for cached studios in the area
    const bbox = getBoundingBox(lat, lng, radiusKm);
    const dbStudios = await prisma.studio.findMany({
      where: {
        latitude: { gte: bbox.minLat, lte: bbox.maxLat },
        longitude: { gte: bbox.minLng, lte: bbox.maxLng },
      },
    });

    // If we have enough results from DB, return them
    if (dbStudios.length >= MIN_DB_RESULTS) {
      const sortedStudios = sortByDistance(dbStudios, lat, lng)
        .filter(s => s.distance <= radiusKm);

      return NextResponse.json({
        studios: sortedStudios,
        source: 'cache',
        total: sortedStudios.length,
      });
    }

    // Otherwise, fetch from Google Places API
    const googleResults = await searchNearbyStudios(lat, lng, radius, keyword);

    // Save new studios to database
    const savedStudios = await Promise.all(
      googleResults.map(place => upsertStudioFromPlace(place))
    );

    // Merge with existing DB results and sort by distance
    const allStudios = [...dbStudios];
    for (const studio of savedStudios) {
      if (!allStudios.find(s => s.id === studio.id)) {
        allStudios.push(studio);
      }
    }

    const sortedStudios = sortByDistance(allStudios, lat, lng)
      .filter(s => s.distance <= radiusKm);

    return NextResponse.json({
      studios: sortedStudios,
      source: 'google',
      newStudiosAdded: savedStudios.length,
      total: sortedStudios.length,
    });
  } catch (error) {
    console.error('Error searching nearby studios:', error);

    // If rate limited, still try to return cached results
    if (error instanceof Error && error.message.includes('rate limit')) {
      const { searchParams } = new URL(request.url);
      const lat = parseFloat(searchParams.get('lat') || '');
      const lng = parseFloat(searchParams.get('lng') || '');
      const radius = parseInt(searchParams.get('radius') || '10000', 10);
      const radiusKm = radius / 1000;

      if (!isNaN(lat) && !isNaN(lng)) {
        const bbox = getBoundingBox(lat, lng, radiusKm);
        const dbStudios = await prisma.studio.findMany({
          where: {
            latitude: { gte: bbox.minLat, lte: bbox.maxLat },
            longitude: { gte: bbox.minLng, lte: bbox.maxLng },
          },
        });

        const sortedStudios = sortByDistance(dbStudios, lat, lng)
          .filter(s => s.distance <= radiusKm);

        return NextResponse.json({
          studios: sortedStudios,
          source: 'cache_fallback',
          total: sortedStudios.length,
          warning: 'Rate limit reached. Showing cached results only.',
        });
      }
    }

    return NextResponse.json(
      { error: 'Failed to search nearby studios' },
      { status: 500 }
    );
  }
}
