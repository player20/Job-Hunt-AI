/**
 * Express Application Setup
 * Main app configuration with all middleware and routes
 */

import express from 'express';
import compression from 'compression';
import { env, isProd } from './config/env';
import {
  helmetMiddleware,
  permissionsPolicyMiddleware,
  corsMiddleware,
  httpsRedirect,
  apiRateLimiter,
} from './middleware/security';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { requestLogger } from './middleware/request-logger';

const app = express();

// Trust proxy for production deployments (required for rate limiting, IP detection)
// Only enable in production when behind a proxy
if (isProd) {
  app.set('trust proxy', 1); // Trust first proxy only
}

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// HTTPS redirect in production
if (isProd) {
  app.use(httpsRedirect);
}

// Helmet - Security headers
app.use(helmetMiddleware);

// Permissions-Policy header for additional security
app.use(permissionsPolicyMiddleware);

// CORS - Cross-origin resource sharing
app.use(corsMiddleware);

// ============================================
// COMPRESSION (gzip/brotli)
// ============================================

// Compress all responses (JSON, HTML, CSS, JS)
app.use(
  compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
    level: 6, // Balanced compression level
    threshold: 1024, // Only compress if response > 1KB
  })
);

// ============================================
// BODY PARSING
// ============================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// REQUEST LOGGING
// ============================================

// Log all HTTP requests (structured logging)
app.use(requestLogger);

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// ============================================
// API ROUTES
// ============================================

// Apply general rate limiter to all API routes
app.use('/api', apiRateLimiter);

// Import routes
import resumeRoutes from './routes/resumes';
import userRoutes from './routes/user';
import jobRoutes from './routes/jobs';

// Mount routes
app.use('/api/resumes', resumeRoutes);
app.use('/api/user', userRoutes);
app.use('/api/jobs', jobRoutes);

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Job Hunt AI API',
    version: '1.0.0',
    status: 'operational',
    endpoints: {
      resumes: '/api/resumes',
      jobs: '/api/jobs',
      user: '/api/user',
      applications: '/api/applications (coming soon)',
      ai: '/api/ai (coming soon)',
    },
  });
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

export default app;
