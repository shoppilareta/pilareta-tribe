import path from 'path';

/**
 * Centralized uploads directory configuration.
 *
 * In production, uploads live in /var/data/pilareta-uploads/ — a persistent
 * directory OUTSIDE the git repo so they survive deployments.
 *
 * In development, uploads live in public/uploads/ as before.
 */

const PERSISTENT_UPLOADS_DIR = '/var/data/pilareta-uploads';

export function getUploadsBasePath(): string {
  return process.env.NODE_ENV === 'production'
    ? PERSISTENT_UPLOADS_DIR
    : path.join(process.cwd(), 'public/uploads');
}

export function getUgcUploadsPath(): string {
  return path.join(getUploadsBasePath(), 'ugc');
}

export function getTrackUploadsPath(): string {
  return path.join(getUploadsBasePath(), 'track');
}
