import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { logAdminAction } from '@/lib/admin/audit';
import { resetVersionCache } from '@/lib/version-check';

// GET /api/admin/settings — Get all config + system health (admin only)
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

    // Fetch all config key-value pairs
    const configs = await prisma.systemConfig.findMany();
    const configMap: Record<string, string> = {};
    for (const c of configs) {
      configMap[c.key] = c.value;
    }

    // System health: DB check
    let dbStatus = 'ok';
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'error';
    }

    // Uptime
    const uptimeSeconds = process.uptime();

    // Check environment variables (presence, not values)
    const envChecks: Record<string, boolean> = {
      SHOPIFY_STORE_DOMAIN: !!process.env.SHOPIFY_STORE_DOMAIN,
      SHOPIFY_STOREFRONT_TOKEN: !!process.env.SHOPIFY_STOREFRONT_TOKEN,
      GOOGLE_MAPS_API_KEY: !!process.env.GOOGLE_MAPS_API_KEY,
      EXPO_ACCESS_TOKEN: !!process.env.EXPO_ACCESS_TOKEN,
      DATABASE_URL: !!process.env.DATABASE_URL,
      SESSION_SECRET: !!process.env.SESSION_SECRET,
    };

    return NextResponse.json({
      config: configMap,
      health: {
        db: dbStatus,
        uptime: uptimeSeconds,
        envVars: envChecks,
      },
    });
  } catch (error) {
    console.error('admin/settings GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PATCH /api/admin/settings — Update config values (admin only)
export async function PATCH(request: NextRequest) {
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
    const { updates } = body as { updates: Record<string, string> };

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json({ error: 'updates must be an object of key-value pairs' }, { status: 400 });
    }

    // Upsert each config value
    const results = await Promise.all(
      Object.entries(updates).map(([key, value]) =>
        prisma.systemConfig.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        })
      )
    );

    // Reset version cache if min_app_version was changed
    if ('min_app_version' in updates) {
      resetVersionCache();
    }

    await logAdminAction(session.userId, 'update', 'settings', 'config', {
      keys: Object.keys(updates),
    });

    return NextResponse.json({ success: true, updated: results.length });
  } catch (error) {
    console.error('admin/settings PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
