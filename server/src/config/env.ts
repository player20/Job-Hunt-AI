/**
 * Environment Configuration
 * Centralized environment variable management with validation
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as os from 'os';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../../.env') });

// Helper to get required environment variable
function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

// Helper to get optional environment variable
function getOptionalEnvVar(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

// Export environment configuration
export const env = {
  // Node environment
  NODE_ENV: getOptionalEnvVar('NODE_ENV', 'development'),
  PORT: parseInt(getOptionalEnvVar('PORT', '3001'), 10),

  // Database
  DATABASE_URL: getEnvVar('DATABASE_URL', 'file:./dev.db'),

  // Claude API
  CLAUDE_API_KEY: getEnvVar('CLAUDE_API_KEY'),

  // CORS
  FRONTEND_URL: getOptionalEnvVar('FRONTEND_URL', 'http://localhost:3000'),

  // Job Scraping
  JOB_SCRAPING_ENABLED: getOptionalEnvVar('JOB_SCRAPING_ENABLED', 'true') === 'true',
  JOB_CACHE_TTL: parseInt(getOptionalEnvVar('JOB_CACHE_TTL', '21600'), 10), // 6 hours

  // Storage
  STORAGE_PATH: getOptionalEnvVar('STORAGE_PATH', path.join(os.homedir(), '.job-hunt-ai')),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(getOptionalEnvVar('RATE_LIMIT_WINDOW_MS', '900000'), 10), // 15 min
  RATE_LIMIT_MAX_REQUESTS: parseInt(getOptionalEnvVar('RATE_LIMIT_MAX_REQUESTS', '100'), 10),

  // AI Settings
  AI_DAILY_QUOTA: parseInt(getOptionalEnvVar('AI_DAILY_QUOTA', '50'), 10),
  AI_CACHE_TTL: parseInt(getOptionalEnvVar('AI_CACHE_TTL', '86400'), 10), // 24 hours
};

// Environment checks
export const isProd = env.NODE_ENV === 'production';
export const isDev = env.NODE_ENV === 'development';

// Log configuration (only in development)
if (isDev) {
  console.log('📋 Environment Configuration:');
  console.log(`   NODE_ENV: ${env.NODE_ENV}`);
  console.log(`   PORT: ${env.PORT}`);
  console.log(`   DATABASE_URL: ${env.DATABASE_URL}`);
  console.log(`   CLAUDE_API_KEY: ${env.CLAUDE_API_KEY ? '✓ Set' : '✗ Missing'}`);
  console.log(`   FRONTEND_URL: ${env.FRONTEND_URL}`);
  console.log(`   STORAGE_PATH: ${env.STORAGE_PATH}`);
  console.log(`   JOB_SCRAPING_ENABLED: ${env.JOB_SCRAPING_ENABLED}`);
}

// Validate critical environment variables
if (!env.CLAUDE_API_KEY && isProd) {
  throw new Error('CLAUDE_API_KEY is required in production');
}
