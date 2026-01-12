/**
 * Job Routes
 * API endpoints for job search and discovery
 */

import { Router } from 'express';
import { prisma } from '../config/database';
import { asyncHandler, AppError } from '../middleware/error-handler';
import { scrapeAllJobs, deduplicateJobs } from '../services/jobScraper';
import { analyzeJobMatch } from '../services/matchAnalyzer';
import { z } from 'zod';

const router = Router();

// ============================================
// GET /api/jobs - List jobs with filters
// ============================================

const jobFilterSchema = z.object({
  search: z.string().optional(),
  location: z.string().optional(),
  locationType: z.string().optional(),
  salaryMin: z.string().optional(),
  limit: z.string().optional(),
  offset: z.string().optional(),
});

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const query = jobFilterSchema.parse(req.query);

    const limit = parseInt(query.limit || '20');
    const offset = parseInt(query.offset || '0');

    // Build where clause
    const where: any = {};

    if (query.search) {
      // SQLite LIKE is case-insensitive by default for ASCII
      where.OR = [
        { title: { contains: query.search } },
        { company: { contains: query.search } },
        { description: { contains: query.search } },
      ];
    }

    if (query.location) {
      // Remove mode: 'insensitive' - not supported on nullable fields in SQLite
      where.location = { contains: query.location };
    }

    if (query.locationType) {
      where.locationType = query.locationType;
    }

    if (query.salaryMin) {
      where.salaryMin = { gte: parseInt(query.salaryMin) };
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        orderBy: { postedDate: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.job.count({ where }),
    ]);

    res.json({
      jobs,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    });
  })
);

// ============================================
// GET /api/jobs/:id - Get job details
// ============================================

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const job = await prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(job);
  })
);

// ============================================
// POST /api/jobs/scrape - Trigger job scraping
// ============================================

const scrapeSchema = z.object({
  userId: z.string().optional(),
});

router.post(
  '/scrape',
  asyncHandler(async (req, res) => {
    console.log('🔍 Manual job scraping triggered');

    const body = scrapeSchema.parse(req.body);
    let searchQueries: string[] | undefined = undefined;

    // If userId provided, fetch their custom search queries
    if (body.userId) {
      const preferences = await prisma.userPreferences.findUnique({
        where: { userId: body.userId },
      });

      if (preferences?.searchQueries) {
        try {
          searchQueries = JSON.parse(preferences.searchQueries);
          console.log(`📋 Using ${searchQueries.length} custom search queries from user preferences`);
        } catch (error) {
          console.error('Failed to parse search queries from preferences:', error);
        }
      }
    }

    // Scrape jobs from all sources with custom queries if provided
    const scrapedJobs = await scrapeAllJobs(searchQueries);

    // Deduplicate
    const uniqueJobs = deduplicateJobs(scrapedJobs);

    // Save to database (upsert to avoid duplicates)
    let created = 0;
    let updated = 0;

    for (const job of uniqueJobs) {
      try {
        const existing = await prisma.job.findFirst({
          where: { externalId: job.externalId },
        });

        if (existing) {
          await prisma.job.update({
            where: { id: existing.id },
            data: {
              title: job.title,
              company: job.company,
              description: job.description,
              requirements: job.requirements ? JSON.stringify(job.requirements) : null,
              location: job.location,
              locationType: job.locationType,
              salaryMin: job.salaryMin,
              salaryMax: job.salaryMax,
              sourceUrl: job.sourceUrl,
              sourceBoard: job.sourceBoard,
              postedDate: job.postedDate,
            },
          });
          updated++;
        } else {
          await prisma.job.create({
            data: {
              title: job.title,
              company: job.company,
              description: job.description,
              requirements: job.requirements ? JSON.stringify(job.requirements) : null,
              location: job.location,
              locationType: job.locationType,
              salaryMin: job.salaryMin,
              salaryMax: job.salaryMax,
              sourceUrl: job.sourceUrl,
              sourceBoard: job.sourceBoard,
              externalId: job.externalId,
              postedDate: job.postedDate,
            },
          });
          created++;
        }
      } catch (error) {
        console.error(`Error saving job ${job.externalId}:`, error);
      }
    }

    res.json({
      success: true,
      scraped: scrapedJobs.length,
      unique: uniqueJobs.length,
      created,
      updated,
      total: created + updated,
    });
  })
);

// ============================================
// POST /api/jobs/:id/analyze-match
// Analyze how well a resume matches a job
// ============================================

const matchAnalysisSchema = z.object({
  resumeId: z.string().uuid(),
});

router.post(
  '/:id/analyze-match',
  asyncHandler(async (req, res) => {
    const jobId = req.params.id;
    const validated = matchAnalysisSchema.parse(req.body);

    // Verify job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new AppError('Job not found', 404);
    }

    // Verify resume exists
    const resume = await prisma.resume.findUnique({
      where: { id: validated.resumeId },
    });

    if (!resume) {
      throw new AppError('Resume not found', 404);
    }

    // Analyze match using AI (with caching)
    const analysis = await analyzeJobMatch(jobId, validated.resumeId);

    res.json(analysis);
  })
);

export default router;
