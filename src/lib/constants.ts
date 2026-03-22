/**
 * Centralized magic numbers and configuration constants.
 * Import from here instead of using inline literals.
 */

export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days
export const CSRF_TOKEN_LENGTH = 32;
export const RATE_LIMIT_CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
export const MAX_UPLOAD_SIZE_BYTES = 500 * 1024 * 1024; // 500MB per user
export const MAX_CAPTION_LENGTH = 2000;
export const MAX_SEARCH_QUERY_LENGTH = 200;
export const MAX_PAGINATION_LIMIT = 100;
export const SHOPIFY_API_VERSION = '2024-01';
