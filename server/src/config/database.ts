/**
 * Database Configuration
 * Prisma Client singleton instance
 */

import { PrismaClient } from '@prisma/client';
import { isDev } from './env';

// Prisma Client singleton
let prisma: PrismaClient;

declare global {
  var __prisma: PrismaClient | undefined;
}

// Create Prisma Client instance
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // In development, use a global variable to preserve the client across hot reloads
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: isDev ? ['query', 'error', 'warn'] : ['error'],
    });
  }
  prisma = global.__prisma;
}

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export { prisma };
