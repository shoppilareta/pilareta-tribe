import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

// Escape a CSV field value
function csvEscape(value: string | null | undefined): string {
  if (value == null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// GET /api/admin/exports?type=users|posts|studios|workouts — CSV export (admin only)
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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    let csv = '';
    let filename = '';

    switch (type) {
      case 'users': {
        const users = await prisma.user.findMany({
          select: {
            email: true,
            firstName: true,
            lastName: true,
            isAdmin: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        });
        csv = 'email,firstName,lastName,isAdmin,createdAt\n';
        for (const u of users) {
          csv += `${csvEscape(u.email)},${csvEscape(u.firstName)},${csvEscape(u.lastName)},${u.isAdmin},${u.createdAt.toISOString()}\n`;
        }
        filename = 'users-export.csv';
        break;
      }

      case 'posts': {
        const posts = await prisma.ugcPost.findMany({
          where: { deletedAt: null },
          select: {
            id: true,
            caption: true,
            mediaType: true,
            status: true,
            isFeatured: true,
            likesCount: true,
            commentsCount: true,
            createdAt: true,
            user: { select: { email: true, firstName: true } },
          },
          orderBy: { createdAt: 'desc' },
        });
        csv = 'id,userEmail,userName,caption,mediaType,status,isFeatured,likes,comments,createdAt\n';
        for (const p of posts) {
          csv += `${p.id},${csvEscape(p.user.email)},${csvEscape(p.user.firstName)},${csvEscape(p.caption)},${p.mediaType},${p.status},${p.isFeatured},${p.likesCount},${p.commentsCount},${p.createdAt.toISOString()}\n`;
        }
        filename = 'posts-export.csv';
        break;
      }

      case 'studios': {
        const studios = await prisma.studio.findMany({
          select: {
            id: true,
            name: true,
            city: true,
            formattedAddress: true,
            phoneNumber: true,
            website: true,
            rating: true,
            verified: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        });
        csv = 'id,name,city,address,phone,website,rating,verified,createdAt\n';
        for (const s of studios) {
          csv += `${s.id},${csvEscape(s.name)},${csvEscape(s.city)},${csvEscape(s.formattedAddress)},${csvEscape(s.phoneNumber)},${csvEscape(s.website)},${s.rating ?? ''},${s.verified},${s.createdAt.toISOString()}\n`;
        }
        filename = 'studios-export.csv';
        break;
      }

      case 'workouts': {
        const workouts = await prisma.workoutLog.findMany({
          select: {
            id: true,
            workoutDate: true,
            durationMinutes: true,
            workoutType: true,
            rpe: true,
            notes: true,
            calorieEstimate: true,
            createdAt: true,
            user: { select: { email: true, firstName: true } },
          },
          orderBy: { createdAt: 'desc' },
        });
        csv = 'id,userEmail,userName,workoutDate,durationMinutes,workoutType,rpe,calories,notes,createdAt\n';
        for (const w of workouts) {
          csv += `${w.id},${csvEscape(w.user.email)},${csvEscape(w.user.firstName)},${w.workoutDate.toISOString().split('T')[0]},${w.durationMinutes},${w.workoutType},${w.rpe},${w.calorieEstimate ?? ''},${csvEscape(w.notes)},${w.createdAt.toISOString()}\n`;
        }
        filename = 'workouts-export.csv';
        break;
      }

      default:
        return NextResponse.json({ error: 'Invalid export type. Use: users, posts, studios, workouts' }, { status: 400 });
    }

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('admin/exports error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
