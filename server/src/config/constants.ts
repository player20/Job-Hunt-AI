/**
 * Application Constants
 * Centralized constant values used throughout the application
 */

// ============================================
// RATE LIMITING
// ============================================

export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const RATE_LIMIT_WINDOW_1MIN_MS = 60 * 1000; // 1 minute

export const API_RATE_LIMIT = 100; // General API: 100 requests per 15 minutes
export const AI_RATE_LIMIT = 10; // AI endpoints: 10 requests per 15 minutes
export const UPLOAD_RATE_LIMIT = 10; // Upload endpoints: 10 per 15 minutes
export const STRICT_RATE_LIMIT = 10; // Strict: 10 per minute

// ============================================
// SECURITY
// ============================================

export const HSTS_MAX_AGE = 31536000; // 1 year in seconds
export const CORS_MAX_AGE = 86400; // 24 hours in seconds

// ============================================
// FILE UPLOAD
// ============================================

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
export const ALLOWED_RESUME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
];

export const ALLOWED_FILE_EXTENSIONS = ['.pdf', '.docx'];

// ============================================
// AI CONFIGURATION
// ============================================

export const AI_CACHE_PREFIX = 'ai_cache:';
export const AI_MAX_RETRIES = 3;
export const AI_RETRY_DELAY = 1000; // 1 second

// ============================================
// JOB SCRAPING
// ============================================

export const JOB_SCRAPING_INTERVAL = 60 * 60 * 1000; // 1 hour
export const JOB_SCRAPING_RATE_LIMIT = 1000 / 3; // 1 request per 3 seconds (ms between requests)
export const JOB_MAX_RESULTS_PER_SOURCE = 100;

// ============================================
// DATABASE
// ============================================

export const DB_QUERY_TIMEOUT = 30000; // 30 seconds
export const DB_MAX_CONNECTIONS = 10;

// ============================================
// APPLICATION
// ============================================

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
