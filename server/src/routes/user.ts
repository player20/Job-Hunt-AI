/**
 * User Routes
 * API endpoints for user preferences and settings
 */

import { Router } from 'express';
import { prisma } from '../config/database';
import { asyncHandler, AppError } from '../middleware/error-handler';
import { userPreferencesSchema } from '../validators/schemas';

const router = Router();

// ============================================
// ROUTES
// ============================================

/**
 * GET /api/user/preferences
 * Get user preferences
 */
router.get(
  '/preferences',
  asyncHandler(async (_req, res) => {
    // Get or create default user (for MVP - no auth)
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'user@jobhuntai.local',
          name: 'Default User',
        },
      });
    }

    // Get or create preferences
    let preferences = await prisma.userPreferences.findUnique({
      where: { userId: user.id },
    });

    if (!preferences) {
      preferences = await prisma.userPreferences.create({
        data: {
          userId: user.id,
          autoApply: false,
        },
      });
    }

    // Parse JSON fields
    const response = {
      ...preferences,
      desiredTitles: preferences.desiredTitles
        ? JSON.parse(preferences.desiredTitles)
        : [],
      desiredLocations: preferences.desiredLocations
        ? JSON.parse(preferences.desiredLocations)
        : [],
      searchQueries: preferences.searchQueries
        ? JSON.parse(preferences.searchQueries)
        : [],
    };

    res.json(response);
  })
);

/**
 * PUT /api/user/preferences
 * Update user preferences
 */
router.put(
  '/preferences',
  asyncHandler(async (req, res) => {
    const validated = userPreferencesSchema.parse(req.body);

    // Get or create default user
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'user@jobhuntai.local',
          name: 'Default User',
        },
      });
    }

    // Update or create preferences
    const preferences = await prisma.userPreferences.upsert({
      where: { userId: user.id },
      update: {
        desiredTitles: validated.desiredTitles
          ? JSON.stringify(validated.desiredTitles)
          : undefined,
        desiredLocations: validated.desiredLocations
          ? JSON.stringify(validated.desiredLocations)
          : undefined,
        desiredSalaryMin: validated.desiredSalaryMin,
        remotePreference: validated.remotePreference,
        searchQueries: validated.searchQueries
          ? JSON.stringify(validated.searchQueries)
          : undefined,
        autoApply: validated.autoApply,
        dailyApplicationLimit: validated.dailyApplicationLimit,
        claudeApiKey: validated.claudeApiKey,
      },
      create: {
        userId: user.id,
        desiredTitles: validated.desiredTitles
          ? JSON.stringify(validated.desiredTitles)
          : null,
        desiredLocations: validated.desiredLocations
          ? JSON.stringify(validated.desiredLocations)
          : null,
        desiredSalaryMin: validated.desiredSalaryMin,
        remotePreference: validated.remotePreference,
        searchQueries: validated.searchQueries
          ? JSON.stringify(validated.searchQueries)
          : null,
        autoApply: validated.autoApply ?? false,
        dailyApplicationLimit: validated.dailyApplicationLimit,
        claudeApiKey: validated.claudeApiKey,
      },
    });

    // Parse JSON fields for response
    const response = {
      ...preferences,
      desiredTitles: preferences.desiredTitles
        ? JSON.parse(preferences.desiredTitles)
        : [],
      desiredLocations: preferences.desiredLocations
        ? JSON.parse(preferences.desiredLocations)
        : [],
      searchQueries: preferences.searchQueries
        ? JSON.parse(preferences.searchQueries)
        : [],
    };

    res.json(response);
  })
);

export default router;
