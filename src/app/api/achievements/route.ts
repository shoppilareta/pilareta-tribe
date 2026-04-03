import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { logger } from '@/lib/logger';

// GET /api/achievements - Get all achievements and user's earned status
export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get all active achievements
    const achievements = await prisma.achievement.findMany({
      where: { isActive: true },
      orderBy: [{ category: 'asc' }, { threshold: 'asc' }],
    });

    // Get user's earned achievements
    const earned = await prisma.userAchievement.findMany({
      where: { userId: session.userId },
      select: { achievementId: true, earnedAt: true },
    });

    const earnedMap = new Map(earned.map((e) => [e.achievementId, e.earnedAt]));

    const result = achievements.map((a) => ({
      id: a.id,
      slug: a.slug,
      name: a.name,
      description: a.description,
      category: a.category,
      iconUrl: a.iconUrl,
      threshold: a.threshold,
      metric: a.metric,
      earned: earnedMap.has(a.id),
      earnedAt: earnedMap.get(a.id) || null,
    }));

    const totalEarned = earned.length;
    const totalAvailable = achievements.length;

    return NextResponse.json({
      achievements: result,
      totalEarned,
      totalAvailable,
    });
  } catch (error) {
    logger.error('achievements', 'Failed to fetch achievements', error);
    return NextResponse.json({ error: 'Failed to fetch achievements' }, { status: 500 });
  }
}
