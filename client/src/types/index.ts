/**
 * TypeScript Type Definitions
 * Shared types for the entire application
 */

// ============================================
// USER TYPES
// ============================================

export interface User {
  id: string;
  email?: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  userId: string;
  desiredTitles?: string[]; // JSON parsed
  desiredLocations?: string[]; // JSON parsed
  desiredSalaryMin?: number;
  remotePreference?: 'remote_only' | 'hybrid' | 'onsite' | 'flexible';
  autoApply: boolean;
  dailyApplicationLimit?: number;
  claudeApiKey?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// RESUME TYPES
// ============================================

export interface Resume {
  id: string;
  userId: string;
  fileName: string;
  fileUrl?: string;
  fileType: 'pdf' | 'docx';
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  skills?: string[]; // Parsed from JSON
  experience?: WorkExperience[]; // Parsed from JSON
  education?: Education[]; // Parsed from JSON
  certifications?: string[]; // Parsed from JSON
  isPrimary: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkExperience {
  title: string;
  company: string;
  startDate: string; // YYYY-MM
  endDate?: string; // YYYY-MM or null for current
  description: string;
  achievements: string[];
}

export interface Education {
  degree: string;
  institution: string;
  graduationDate: string; // YYYY
  gpa?: string;
}

// ============================================
// JOB TYPES
// ============================================

export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements?: string[]; // Parsed from JSON
  location?: string;
  locationType?: 'remote' | 'hybrid' | 'onsite';
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  sourceUrl: string;
  sourceBoard: string;
  externalId?: string;
  postedDate?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobFilters {
  search?: string;
  location?: string;
  locationType?: 'remote' | 'hybrid' | 'onsite';
  salaryMin?: number;
  company?: string;
  sourceBoard?: string;
  page?: number;
  limit?: number;
}

export interface JobMatch extends Job {
  matchScore?: number;
  matchReasons?: string;
}

// ============================================
// APPLICATION TYPES
// ============================================

export type ApplicationStatus =
  | 'pending'
  | 'applied'
  | 'viewed'
  | 'interview_requested'
  | 'interviewed'
  | 'offered'
  | 'rejected'
  | 'withdrawn';

export interface Application {
  id: string;
  userId: string;
  jobId: string;
  resumeId?: string;
  status: ApplicationStatus;
  coverLetter?: string;
  customResume?: string;
  appliedAt?: string;
  viewedAt?: string;
  respondedAt?: string;
  matchScore?: number;
  matchReasons?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  job?: Job; // Populated relation
  resume?: Resume; // Populated relation
}

export interface ApplicationStats {
  total: number;
  pending: number;
  applied: number;
  viewed: number;
  interviewed: number;
  offered: number;
  rejected: number;
  withdrawn: number;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface JobSearchResponse {
  jobs: Job[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// ============================================
// AI REQUEST/RESPONSE TYPES
// ============================================

export interface ParseResumeRequest {
  rawText: string;
}

export interface ParseResumeResponse {
  resume: Resume;
}

export interface MatchJobsRequest {
  resumeId: string;
  jobIds: string[];
}

export interface MatchJobsResponse {
  matches: JobMatch[];
}

export interface GenerateCoverLetterRequest {
  resumeId: string;
  jobId: string;
}

export interface GenerateCoverLetterResponse {
  coverLetter: string;
}
