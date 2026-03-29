import { prisma } from '@/lib/db';
import type { Prisma } from '@prisma/client';

/**
 * Log an admin action to the audit trail.
 * Fire-and-forget — errors are caught and logged but never block the response.
 */
export async function logAdminAction(
  adminId: string,
  action: string,
  entityType: string,
  entityId: string,
  details?: Record<string, unknown>
) {
  try {
    await prisma.adminAuditLog.create({
      data: {
        adminId,
        action,
        entityType,
        entityId,
        details: (details as Prisma.InputJsonValue) ?? undefined,
      },
    });
  } catch (error) {
    // Never let audit logging break the main operation
    console.error('Failed to log admin action:', error);
  }
}
