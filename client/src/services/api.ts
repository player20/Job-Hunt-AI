/**
 * API Client
 * Centralized HTTP client using Axios
 */

import axios, { AxiosError, AxiosResponse } from 'axios';
import type {
  Resume,
  Job,
  JobFilters,
  JobMatch,
  Application,
  ApplicationStats,
  UserPreferences,
  PaginatedResponse,
  JobSearchResponse,
} from '../types';

// Base API URL (proxied through Vite in development)
const API_BASE_URL = '/api';

// Create Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available (future enhancement)
    // const token = localStorage.getItem('authToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle errors globally
    if (error.response) {
      const message =
        (error.response.data as any)?.error || 'An error occurred';
      console.error('API Error:', message);
    } else if (error.request) {
      console.error('Network Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// ============================================
// RESUME API
// ============================================

export const resumeApi = {
  // Upload and parse resume
  upload: async (file: File): Promise<Resume> => {
    const formData = new FormData();
    formData.append('resume', file);

    const response = await api.post<Resume>('/resumes', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // List all resumes
  list: async (): Promise<Resume[]> => {
    const response = await api.get<Resume[]>('/resumes');
    return response.data;
  },

  // Get resume by ID
  get: async (id: string): Promise<Resume> => {
    const response = await api.get<Resume>(`/resumes/${id}`);
    return response.data;
  },

  // Update resume
  update: async (id: string, data: Partial<Resume>): Promise<Resume> => {
    const response = await api.put<Resume>(`/resumes/${id}`, data);
    return response.data;
  },

  // Delete resume
  delete: async (id: string): Promise<void> => {
    await api.delete(`/resumes/${id}`);
  },

  // Re-parse resume with AI
  reparse: async (id: string): Promise<Resume> => {
    const response = await api.post<Resume>(`/resumes/${id}/parse`);
    return response.data;
  },
};

// ============================================
// JOB API
// ============================================

export const jobApi = {
  // Search jobs with filters
  search: async (filters: JobFilters = {}): Promise<JobSearchResponse> => {
    const response = await api.get<JobSearchResponse>('/jobs', {
      params: filters,
    });
    return response.data;
  },

  // Get job by ID
  get: async (id: string): Promise<Job> => {
    const response = await api.get<Job>(`/jobs/${id}`);
    return response.data;
  },

  // Get AI-matched jobs
  match: async (resumeId: string): Promise<JobMatch[]> => {
    const response = await api.post<JobMatch[]>('/jobs/match', { resumeId });
    return response.data;
  },

  // Trigger job scraping
  scrape: async (userId?: string): Promise<{ message: string; count: number }> => {
    const response = await api.post<{ message: string; count: number }>(
      '/jobs/scrape',
      { userId }
    );
    return response.data;
  },
};

// ============================================
// APPLICATION API
// ============================================

export const applicationApi = {
  // List applications
  list: async (filters?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Application>> => {
    const response = await api.get<PaginatedResponse<Application>>(
      '/applications',
      {
        params: filters,
      }
    );
    return response.data;
  },

  // Get application by ID
  get: async (id: string): Promise<Application> => {
    const response = await api.get<Application>(`/applications/${id}`);
    return response.data;
  },

  // Create application
  create: async (
    data: Partial<Application>
  ): Promise<Application> => {
    const response = await api.post<Application>('/applications', data);
    return response.data;
  },

  // Update application
  update: async (
    id: string,
    data: Partial<Application>
  ): Promise<Application> => {
    const response = await api.put<Application>(`/applications/${id}`, data);
    return response.data;
  },

  // Delete application
  delete: async (id: string): Promise<void> => {
    await api.delete(`/applications/${id}`);
  },

  // Get application statistics
  stats: async (): Promise<ApplicationStats> => {
    const response = await api.get<ApplicationStats>('/applications/stats');
    return response.data;
  },
};

// ============================================
// AI API
// ============================================

export const aiApi = {
  // Parse resume with Claude
  parseResume: async (rawText: string): Promise<any> => {
    const response = await api.post('/ai/parse-resume', { rawText });
    return response.data;
  },

  // Match jobs with Claude
  matchJobs: async (resumeId: string, jobIds: string[]): Promise<JobMatch[]> => {
    const response = await api.post<JobMatch[]>('/ai/match-jobs', {
      resumeId,
      jobIds,
    });
    return response.data;
  },

  // Generate cover letter with Claude
  generateCoverLetter: async (
    resumeId: string,
    jobId: string
  ): Promise<string> => {
    const response = await api.post<{ coverLetter: string }>(
      '/ai/generate-cover-letter',
      {
        resumeId,
        jobId,
      }
    );
    return response.data.coverLetter;
  },
};

// ============================================
// USER API
// ============================================

export const userApi = {
  // Get user preferences
  getPreferences: async (): Promise<UserPreferences> => {
    const response = await api.get<UserPreferences>('/user/preferences');
    return response.data;
  },

  // Update user preferences
  updatePreferences: async (
    data: Partial<UserPreferences>
  ): Promise<UserPreferences> => {
    const response = await api.put<UserPreferences>(
      '/user/preferences',
      data
    );
    return response.data;
  },
};

export default api;
