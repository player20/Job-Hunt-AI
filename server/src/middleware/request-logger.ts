/**
 * Request Logger Middleware
 * Logs incoming HTTP requests for debugging
 */

import { Request, Response, NextFunction } from 'express';
import { isDev } from '../config/env';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  if (isDev) {
    const start = Date.now();

    // Log request
    console.log(`📨 ${req.method} ${req.path}`);

    // Log response time when finished
    res.on('finish', () => {
      const duration = Date.now() - start;
      const statusCode = res.statusCode;
      const statusEmoji = statusCode >= 400 ? '❌' : statusCode >= 300 ? '⚠️' : '✅';

      console.log(
        `${statusEmoji} ${req.method} ${req.path} - ${statusCode} (${duration}ms)`
      );
    });
  }

  next();
};
