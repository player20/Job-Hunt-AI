/**
 * useJobs Hook
 * React Query hook for job search and filtering
 */

import { useQuery, useMutation, useQueryClient } from 'react-query';
import { jobApi } from '../services/api';
import type { Job, JobFilters, JobMatch } from '../types';

/**
 * Hook for searching jobs with filters
 */
export const useJobs = (filters: JobFilters = {}) => {
  const { data, isLoading, error, refetch } = useQuery(
    ['jobs', filters],
    () => jobApi.search(filters),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      keepPreviousData: true, // Keep previous data while loading new results
    }
  );

  return {
    jobs: data?.jobs || [],
    total: data?.total || 0,
    limit: data?.limit || 20,
    offset: data?.offset || 0,
    hasMore: data?.hasMore || false,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook for getting a single job by ID
 */
export const useJob = (id: string | undefined) => {
  const { data: job, isLoading, error } = useQuery(
    ['job', id],
    () => jobApi.get(id!),
    {
      enabled: !!id, // Only run query if id exists
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  return {
    job,
    isLoading,
    error,
  };
};

/**
 * Hook for triggering job scraping
 */
export const useJobScraper = () => {
  const queryClient = useQueryClient();

  const scrapeMutation = useMutation(
    (userId?: string) => jobApi.scrape(userId),
    {
      onSuccess: () => {
        // Invalidate all job queries to refetch with new data
        queryClient.invalidateQueries('jobs');
      },
    }
  );

  return {
    scrapeJobs: scrapeMutation.mutateAsync,
    isScraping: scrapeMutation.isLoading,
    scrapeError: scrapeMutation.error,
  };
};

/**
 * Hook for getting AI-matched jobs
 */
export const useJobMatching = (resumeId: string | undefined) => {
  const { data, isLoading, error, refetch } = useQuery(
    ['jobMatches', resumeId],
    () => jobApi.match(resumeId!),
    {
      enabled: !!resumeId,
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  return {
    matches: data || [],
    isLoading,
    error,
    refetch,
  };
};
