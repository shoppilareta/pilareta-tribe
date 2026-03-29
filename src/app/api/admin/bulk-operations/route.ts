import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { logAdminAction } from '@/lib/admin/audit';

const VALID_ACTIONS = ['approve', 'reject', 'delete', 'feature', 'verify', 'ban'] as const;
const VALID_ENTITY_TYPES = ['posts', 'users', 'studios', 'exercises'] as const;

type Action = (typeof VALID_ACTIONS)[number];
type EntityType = (typeof VALID_ENTITY_TYPES)[number];

// POST /api/admin/bulk-operations — Bulk actions on entities (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { action, entityType, ids } = body as {
      action: Action;
      entityType: EntityType;
      ids: string[];
    };

    // Validate inputs
    if (!VALID_ACTIONS.includes(action)) {
      return NextResponse.json({ error: `Invalid action: ${action}` }, { status: 400 });
    }
    if (!VALID_ENTITY_TYPES.includes(entityType)) {
      return NextResponse.json({ error: `Invalid entity type: ${entityType}` }, { status: 400 });
    }
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'ids must be a non-empty array' }, { status: 400 });
    }
    if (ids.length > 100) {
      return NextResponse.json({ error: 'Maximum 100 items per operation' }, { status: 400 });
    }
    if (!ids.every((id) => typeof id === 'string')) {
      return NextResponse.json({ error: 'All ids must be strings' }, { status: 400 });
    }

    let count = 0;

    switch (entityType) {
      case 'posts': {
        if (action === 'approve') {
          const result = await prisma.ugcPost.updateMany({
            where: { id: { in: ids } },
            data: { status: 'approved', moderatedAt: new Date() },
          });
          count = result.count;
        } else if (action === 'reject') {
          const result = await prisma.ugcPost.updateMany({
            where: { id: { in: ids } },
            data: { status: 'rejected', moderatedAt: new Date() },
          });
          count = result.count;
        } else if (action === 'delete') {
          // Soft delete
          const result = await prisma.ugcPost.updateMany({
            where: { id: { in: ids } },
            data: { deletedAt: new Date() },
          });
          count = result.count;
        } else if (action === 'feature') {
          const result = await prisma.ugcPost.updateMany({
            where: { id: { in: ids } },
            data: { isFeatured: true, featuredAt: new Date() },
          });
          count = result.count;
        } else {
          return NextResponse.json({ error: `Action '${action}' not supported for posts` }, { status: 400 });
        }
        break;
      }

      case 'exercises': {
        if (action === 'verify') {
          const result = await prisma.exercise.updateMany({
            where: { id: { in: ids } },
            data: { isVerified: true },
          });
          count = result.count;
        } else if (action === 'delete') {
          const result = await prisma.exercise.deleteMany({
            where: { id: { in: ids } },
          });
          count = result.count;
        } else {
          return NextResponse.json({ error: `Action '${action}' not supported for exercises` }, { status: 400 });
        }
        break;
      }

      case 'users': {
        if (action === 'ban') {
          // Soft ban: delete all sessions to force logout
          await prisma.session.deleteMany({
            where: { userId: { in: ids } },
          });
          count = ids.length;
        } else {
          return NextResponse.json({ error: `Action '${action}' not supported for users` }, { status: 400 });
        }
        break;
      }

      case 'studios': {
        if (action === 'verify') {
          const result = await prisma.studio.updateMany({
            where: { id: { in: ids } },
            data: { verified: true },
          });
          count = result.count;
        } else if (action === 'delete') {
          const result = await prisma.studio.deleteMany({
            where: { id: { in: ids } },
          });
          count = result.count;
        } else {
          return NextResponse.json({ error: `Action '${action}' not supported for studios` }, { status: 400 });
        }
        break;
      }
    }

    await logAdminAction(session.userId, `bulk_${action}`, entityType, ids.join(','), {
      action,
      entityType,
      count,
      ids,
    });

    return NextResponse.json({ success: true, count });
  } catch (error) {
    console.error('admin/bulk-operations error:', error);
    return NextResponse.json({ error: 'Bulk operation failed' }, { status: 500 });
  }
}
