/**
 * Validation Schemas
 * Zod schemas for request validation
 */

import { z } from 'zod';

// ============================================
// RESUME SCHEMAS
// ============================================

export const resumeUpdateSchema = z.object({
  fullName: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  location: z.string().max(100).optional(),
  summary: z.string().max(1000).optional(),
  skills: z.array(z.string()).optional(),
  experience: z.array(z.any()).optional(),
  education: z.array(z.any()).optional(),
  certifications: z.array(z.string()).optional(),
  isPrimary: z.boolean().optional(),
});

// ============================================
// JOB SCHEMAS
// ============================================

export const jobSearchSchema = z.object({
  search: z.string().optional(),
  location: z.string().optional(),
  locationType: z.enum(['remote', 'hybrid', 'onsite']).optional(),
  salaryMin: z.coerce.number().min(0).optional(),
  company: z.string().optional(),
  sourceBoard: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

// ============================================
// APPLICATION SCHEMAS
// ============================================

export const applicationCreateSchema = z.object({
  jobId: z.string().uuid(),
  resumeId: z.string().uuid().optional(),
  coverLetter: z.string().optional(),
  notes: z.string().optional(),
});

export const applicationUpdateSchema = z.object({
  status: z
    .enum([
      'pending',
      'applied',
      'viewed',
      'interview_requested',
      'interviewed',
      'offered',
      'rejected',
      'withdrawn',
    ])
    .optional(),
  coverLetter: z.string().optional(),
  notes: z.string().optional(),
  appliedAt: z.string().datetime().optional(),
  viewedAt: z.string().datetime().optional(),
  respondedAt: z.string().datetime().optional(),
});

// ============================================
// USER PREFERENCES SCHEMAS
// ============================================

export const userPreferencesSchema = z.object({
  desiredTitles: z.array(z.string()).optional(),
  desiredLocations: z.array(z.string()).optional(),
  desiredSalaryMin: z.number().min(0).optional(),
  remotePreference: z
    .enum(['remote_only', 'hybrid', 'onsite', 'flexible'])
    .optional(),
  autoApply: z.boolean().optional(),
  dailyApplicationLimit: z.number().min(1).max(100).optional(),
  claudeApiKey: z.string().optional(),
});

// ============================================
// AI SCHEMAS
// ============================================

export const parseResumeSchema = z.object({
  rawText: z.string().min(50),
});

export const matchJobsSchema = z.object({
  resumeId: z.string().uuid(),
  jobIds: z.array(z.string().uuid()).min(1).max(50),
});

export const generateCoverLetterSchema = z.object({
  resumeId: z.string().uuid(),
  jobId: z.string().uuid(),
});
