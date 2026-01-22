import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  getPlaceDetails,
  updateStudioWithDetails,
  isStudioDataStale,
} from '@/lib/studios/google-places';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const studio = await prisma.studio.findUnique({
      where: { id },
      include: {
        claims: {
          where: { status: 'approved' },
          take: 1,
        },
      },
    });

    if (!studio) {
      return NextResponse.json(
        { error: 'Studio not found' },
        { status: 404 }
      );
    }

    // Check if we need to refresh data from Google
    if (studio.googlePlaceId && isStudioDataStale(studio.googleDataFetched)) {
      try {
        const details = await getPlaceDetails(studio.googlePlaceId);
        if (details) {
          const updatedStudio = await updateStudioWithDetails(studio.id, details);
          return NextResponse.json({
            studio: updatedStudio,
            refreshed: true,
          });
        }
      } catch (error) {
        console.error('Failed to refresh studio data:', error);
        // Return stale data if refresh fails
      }
    }

    return NextResponse.json({
      studio,
      refreshed: false,
    });
  } catch (error) {
    console.error('Error fetching studio:', error);
    return NextResponse.json(
      { error: 'Failed to fetch studio' },
      { status: 500 }
    );
  }
}
