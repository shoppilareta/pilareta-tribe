import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';

// GET /api/studios/autocomplete?input=... — Google Places Autocomplete proxy
export async function GET(request: NextRequest) {
  const input = request.nextUrl.searchParams.get('input');

  if (!input || input.length < 2) {
    return NextResponse.json({ predictions: [] });
  }

  if (!GOOGLE_API_KEY) {
    return NextResponse.json({ predictions: [] });
  }

  try {
    const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
    url.searchParams.set('input', input);
    url.searchParams.set('types', '(cities)');
    url.searchParams.set('key', GOOGLE_API_KEY);

    const res = await fetch(url.toString());
    const data = await res.json();

    const predictions = (data.predictions || []).map((p: { place_id: string; description: string }) => ({
      placeId: p.place_id,
      description: p.description,
    }));

    return NextResponse.json({ predictions });
  } catch {
    return NextResponse.json({ predictions: [] });
  }
}
