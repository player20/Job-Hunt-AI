/**
 * Claude API Configuration
 * Anthropic SDK client initialization
 */

import Anthropic from '@anthropic-ai/sdk';
import { env } from './env';

// Initialize Claude API client
export const anthropic = new Anthropic({
  apiKey: env.CLAUDE_API_KEY,
});

// Model configuration
export const CLAUDE_MODEL = 'claude-3-haiku-20240307';

// Default parameters
export const DEFAULT_MAX_TOKENS = 4000;
export const DEFAULT_TEMPERATURE = 1.0;

// API usage limits
export const AI_RATE_LIMIT = {
  maxRequestsPerDay: env.AI_DAILY_QUOTA,
  cacheTTL: env.AI_CACHE_TTL,
};
