import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET /api/admin/studios/edit-suggestions — List edit suggestions (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const suggestions = await prisma.studioEditSuggestion.findMany({
      include: {
        studio: {
          select: { name: true, city: true },
        },
      },
      orderBy: [
        { status: 'asc' }, // pending first
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error fetching edit suggestions:', error);
    return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 });
  }
}
