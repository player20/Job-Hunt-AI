/**
 * Job Routes
 * API endpoints for job search and discovery
 */

import { Router } from 'express';
import { prisma } from '../config/database';
import { asyncHandler } from '../middleware/error-handler';
import { scrapeAllJobs, deduplicateJobs } from '../services/jobScraper';
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

router.post(
  '/scrape',
  asyncHandler(async (req, res) => {
    console.log('🔍 Manual job scraping triggered');

    // Scrape jobs from all sources
    const scrapedJobs = await scrapeAllJobs();

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

export default router;
