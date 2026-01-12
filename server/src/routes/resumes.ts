/**
 * Resume Routes
 * API endpoints for resume management
 */

import { Router } from 'express';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs/promises';
import { nanoid } from 'nanoid';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { asyncHandler, AppError } from '../middleware/error-handler';
import { uploadRateLimiter } from '../middleware/security';
import { parseResumeFile } from '../services/resumeParser';
import { resumeUpdateSchema } from '../validators/schemas';
import {
  MAX_FILE_SIZE,
  ALLOWED_RESUME_TYPES,
  ALLOWED_FILE_EXTENSIONS,
} from '../config/constants';

const router = Router();

// ============================================
// MULTER CONFIGURATION
// ============================================

const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    const uploadDir = path.join(env.STORAGE_PATH, 'resumes');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${nanoid()}-${Date.now()}${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (ALLOWED_FILE_EXTENSIONS.includes(ext) && ALLOWED_RESUME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and DOCX files are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

// ============================================
// ROUTES
// ============================================

/**
 * POST /api/resumes
 * Upload and parse a resume
 */
router.post(
  '/',
  uploadRateLimiter,
  upload.single('resume'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

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

    const fileType = path.extname(req.file.originalname).slice(1); // Remove leading dot

    try {
      // Parse the resume file with Claude AI
      const parsedData = await parseResumeFile(req.file.path, fileType);

      // Create resume in database
      const resume = await prisma.resume.create({
        data: {
          userId: user.id,
          fileName: req.file.originalname,
          fileUrl: req.file.path,
          fileType,
          fullName: parsedData.fullName,
          email: parsedData.email,
          phone: parsedData.phone,
          location: parsedData.location,
          summary: parsedData.summary,
          skills: parsedData.skills ? JSON.stringify(parsedData.skills) : null,
          experience: parsedData.experience ? JSON.stringify(parsedData.experience) : null,
          education: parsedData.education ? JSON.stringify(parsedData.education) : null,
          certifications: parsedData.certifications
            ? JSON.stringify(parsedData.certifications)
            : null,
          isPrimary: false, // User can set this later
          version: 1,
        },
      });

      res.status(201).json(resume);
    } catch (error) {
      // Clean up uploaded file if parsing fails
      await fs.unlink(req.file.path).catch(() => {});
      throw error;
    }
  })
);

/**
 * GET /api/resumes
 * List all resumes
 */
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const resumes = await prisma.resume.findMany({
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }],
    });

    res.json(resumes);
  })
);

/**
 * GET /api/resumes/:id
 * Get resume by ID
 */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const resume = await prisma.resume.findUnique({
      where: { id: req.params.id },
    });

    if (!resume) {
      throw new AppError('Resume not found', 404);
    }

    res.json(resume);
  })
);

/**
 * PUT /api/resumes/:id
 * Update resume
 */
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const validated = resumeUpdateSchema.parse(req.body);

    const resume = await prisma.resume.findUnique({
      where: { id: req.params.id },
    });

    if (!resume) {
      throw new AppError('Resume not found', 404);
    }

    // If setting as primary, unset other primary resumes
    if (validated.isPrimary) {
      await prisma.resume.updateMany({
        where: {
          userId: resume.userId,
          isPrimary: true,
        },
        data: { isPrimary: false },
      });
    }

    // Update resume
    const updated = await prisma.resume.update({
      where: { id: req.params.id },
      data: {
        ...validated,
        skills: validated.skills ? JSON.stringify(validated.skills) : undefined,
        experience: validated.experience ? JSON.stringify(validated.experience) : undefined,
        education: validated.education ? JSON.stringify(validated.education) : undefined,
        certifications: validated.certifications
          ? JSON.stringify(validated.certifications)
          : undefined,
      },
    });

    res.json(updated);
  })
);

/**
 * DELETE /api/resumes/:id
 * Delete resume
 */
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const resume = await prisma.resume.findUnique({
      where: { id: req.params.id },
    });

    if (!resume) {
      throw new AppError('Resume not found', 404);
    }

    // Delete file from disk
    if (resume.fileUrl) {
      await fs.unlink(resume.fileUrl).catch(() => {});
    }

    // Delete from database
    await prisma.resume.delete({
      where: { id: req.params.id },
    });

    res.status(204).send();
  })
);

/**
 * POST /api/resumes/:id/parse
 * Re-parse resume with AI
 */
router.post(
  '/:id/parse',
  asyncHandler(async (req, res) => {
    const resume = await prisma.resume.findUnique({
      where: { id: req.params.id },
    });

    if (!resume) {
      throw new AppError('Resume not found', 404);
    }

    if (!resume.fileUrl) {
      throw new AppError('Resume file not found', 404);
    }

    // Re-parse the file
    const parsedData = await parseResumeFile(resume.fileUrl, resume.fileType);

    // Update resume with new parsed data
    const updated = await prisma.resume.update({
      where: { id: req.params.id },
      data: {
        fullName: parsedData.fullName,
        email: parsedData.email,
        phone: parsedData.phone,
        location: parsedData.location,
        summary: parsedData.summary,
        skills: parsedData.skills ? JSON.stringify(parsedData.skills) : null,
        experience: parsedData.experience ? JSON.stringify(parsedData.experience) : null,
        education: parsedData.education ? JSON.stringify(parsedData.education) : null,
        certifications: parsedData.certifications
          ? JSON.stringify(parsedData.certifications)
          : null,
        version: resume.version + 1,
      },
    });

    res.json(updated);
  })
);

export default router;
