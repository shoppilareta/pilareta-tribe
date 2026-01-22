import { prisma } from '@/lib/db';

// Daily rate limits
const RATE_LIMITS: Record<string, number> = {
  nearby_search: 100,
  place_details: 200,
  geocode: 500,
};

/**
 * Check if we can make another API call for this type today
 */
export async function checkRateLimit(apiType: string, limit?: number): Promise<boolean> {
  const dailyLimit = limit ?? RATE_LIMITS[apiType] ?? 100;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const usage = await prisma.apiUsageLog.findUnique({
    where: {
      apiType_date: {
        apiType,
        date: today,
      },
    },
  });

  if (!usage) {
    return true;
  }

  return usage.requestCount < dailyLimit;
}

/**
 * Log an API usage
 */
export async function logApiUsage(apiType: string): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.apiUsageLog.upsert({
    where: {
      apiType_date: {
        apiType,
        date: today,
      },
    },
    update: {
      requestCount: {
        increment: 1,
      },
    },
    create: {
      apiType,
      date: today,
      requestCount: 1,
    },
  });
}

/**
 * Get current usage stats for all API types
 */
export async function getUsageStats(): Promise<Record<string, { used: number; limit: number }>> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const usages = await prisma.apiUsageLog.findMany({
    where: {
      date: today,
    },
  });

  const stats: Record<string, { used: number; limit: number }> = {};

  for (const apiType of Object.keys(RATE_LIMITS)) {
    const usage = usages.find(u => u.apiType === apiType);
    stats[apiType] = {
      used: usage?.requestCount ?? 0,
      limit: RATE_LIMITS[apiType],
    };
  }

  return stats;
}
