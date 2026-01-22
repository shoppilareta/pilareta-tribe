import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface EditSuggestionBody {
  submitterEmail?: string;
  suggestedChanges: {
    name?: string;
    address?: string;
    phoneNumber?: string;
    website?: string;
    openingHours?: Record<string, string>;
    amenities?: string[];
  };
  reason?: string;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: EditSuggestionBody = await request.json();

    // Validate that there are actual changes
    if (!body.suggestedChanges || Object.keys(body.suggestedChanges).length === 0) {
      return NextResponse.json(
        { error: 'No changes provided' },
        { status: 400 }
      );
    }

    // Check if studio exists
    const studio = await prisma.studio.findUnique({
      where: { id },
    });

    if (!studio) {
      return NextResponse.json(
        { error: 'Studio not found' },
        { status: 404 }
      );
    }

    // Create the edit suggestion
    const suggestion = await prisma.studioEditSuggestion.create({
      data: {
        studioId: id,
        submitterEmail: body.submitterEmail?.toLowerCase(),
        suggestedChanges: body.suggestedChanges,
        reason: body.reason,
        status: 'pending',
      },
    });

    return NextResponse.json({
      suggestion,
      message: 'Edit suggestion submitted successfully. We will review your changes.',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating edit suggestion:', error);
    return NextResponse.json(
      { error: 'Failed to submit edit suggestion' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const suggestions = await prisma.studioEditSuggestion.findMany({
      where: { studioId: id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error fetching edit suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suggestions' },
      { status: 500 }
    );
  }
}
