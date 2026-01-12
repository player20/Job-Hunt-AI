/**
 * Server Entry Point
 * Starts the Express server and connects to the database
 */

import app from './app';
import { env, isDev } from './config/env';
import { prisma } from './config/database';
import * as fs from 'fs/promises';
import * as path from 'path';

// Initialize storage directories
async function initializeStorage() {
  const dirs = [
    env.STORAGE_PATH,
    path.join(env.STORAGE_PATH, 'resumes'),
    path.join(env.STORAGE_PATH, 'cache'),
  ];

  for (const dir of dirs) {
    try {
      await fs.mkdir(dir, { recursive: true });
      if (isDev) {
        console.log(`✅ Storage directory created/verified: ${dir}`);
      }
    } catch (error) {
      console.error(`❌ Failed to create storage directory: ${dir}`, error);
    }
  }
}

// Test database connection
async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    if (isDev) {
      console.log('✅ Database connected successfully');
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

// Start server
async function startServer() {
  try {
    // Initialize storage
    await initializeStorage();

    // Test database connection
    await testDatabaseConnection();

    // Start Express server
    const server = app.listen(env.PORT, () => {
      console.log('');
      console.log('🚀 Job Hunt AI Server');
      console.log(`📍 Environment: ${env.NODE_ENV}`);
      console.log(`🌐 Server running on: http://localhost:${env.PORT}`);
      console.log(`🔧 API endpoint: http://localhost:${env.PORT}/api`);
      console.log(`💾 Storage path: ${env.STORAGE_PATH}`);
      console.log(`🤖 Claude API: ${env.CLAUDE_API_KEY ? '✓ Configured' : '✗ Not configured'}`);
      console.log('');
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('📦 SIGTERM received. Shutting down gracefully...');
      server.close(async () => {
        await prisma.$disconnect();
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      console.log('📦 SIGINT received. Shutting down gracefully...');
      server.close(async () => {
        await prisma.$disconnect();
        console.log('✅ Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
