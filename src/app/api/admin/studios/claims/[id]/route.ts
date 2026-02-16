import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/admin/studios/claims/[id] — Update claim status (admin only)
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

    const claim = await prisma.studioClaim.update({
      where: { id },
      data: { status },
    });

    // If approved, mark the studio as verified
    if (status === 'approved') {
      await prisma.studio.update({
        where: { id: claim.studioId },
        data: { verified: true },
      });
    }

    return NextResponse.json({ claim });
  } catch (error) {
    console.error('Error updating claim:', error);
    return NextResponse.json({ error: 'Failed to update claim' }, { status: 500 });
  }
}
