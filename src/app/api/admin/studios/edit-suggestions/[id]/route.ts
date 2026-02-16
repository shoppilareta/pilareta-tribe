import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/admin/studios/edit-suggestions/[id] — Update suggestion status (admin only)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession(request);
    if (!session?.userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const { status } = await request.json();

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // If approved, apply the suggested changes to the studio
    if (status === 'approved') {
      const suggestion = await prisma.studioEditSuggestion.findUnique({
        where: { id },
      });
      if (suggestion) {
        const changes = suggestion.suggestedChanges as Record<string, unknown>;
        const allowedFields = ['name', 'city', 'address', 'phoneNumber', 'website', 'amenities'];
        const updateData: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(changes)) {
          if (allowedFields.includes(key)) {
            updateData[key] = value;
          }
        }
        if (Object.keys(updateData).length > 0) {
          await prisma.studio.update({
            where: { id: suggestion.studioId },
            data: updateData,
          });
        }
      }
    }

    const updated = await prisma.studioEditSuggestion.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ suggestion: updated });
  } catch (error) {
    console.error('Error updating suggestion:', error);
    return NextResponse.json({ error: 'Failed to update suggestion' }, { status: 500 });
  }
}
