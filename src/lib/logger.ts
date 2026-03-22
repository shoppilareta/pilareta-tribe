/**
 * Simple structured logger for API routes.
 * Outputs JSON to stdout/stderr for easy parsing in production.
 * No external dependencies — wraps console.log/error/warn.
 */
export const logger = {
  info: (context: string, message: string, meta?: Record<string, unknown>) => {
    console.log(JSON.stringify({ level: 'info', context, message, ...meta, timestamp: new Date().toISOString() }));
  },
  error: (context: string, message: string, error?: unknown, meta?: Record<string, unknown>) => {
    console.error(JSON.stringify({ level: 'error', context, message, error: error instanceof Error ? error.message : String(error), ...meta, timestamp: new Date().toISOString() }));
  },
  warn: (context: string, message: string, meta?: Record<string, unknown>) => {
    console.warn(JSON.stringify({ level: 'warn', context, message, ...meta, timestamp: new Date().toISOString() }));
  },
};
