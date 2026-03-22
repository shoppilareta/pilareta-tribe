import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

// DELETE /api/wishlist/[handle] — remove from wishlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const session = await getSession(request);
  if (!session?.userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { handle } = await params;

  await prisma.productWishlist.deleteMany({
    where: { userId: session.userId, productHandle: handle },
  });

  return NextResponse.json({ wishlisted: false });
}
