/**
 * useResumes Hook
 * Custom hook for managing resumes
 */

import { useQuery, useMutation, useQueryClient } from 'react-query';
import { resumeApi } from '../services/api';
import type { Resume } from '../types';

export const useResumes = () => {
  const queryClient = useQueryClient();

  // Fetch all resumes
  const {
    data: resumes,
    isLoading,
    error,
    refetch,
  } = useQuery<Resume[]>('resumes', resumeApi.list, {
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Upload resume mutation
  const uploadMutation = useMutation(resumeApi.upload, {
    onSuccess: () => {
      queryClient.invalidateQueries('resumes');
    },
  });

  // Update resume mutation
  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: Partial<Resume> }) =>
      resumeApi.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('resumes');
      },
    }
  );

  // Delete resume mutation
  const deleteMutation = useMutation(resumeApi.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('resumes');
    },
  });

  // Reparse resume mutation
  const reparseMutation = useMutation(resumeApi.reparse, {
    onSuccess: () => {
      queryClient.invalidateQueries('resumes');
    },
  });

  return {
    resumes: resumes || [],
    isLoading,
    error,
    refetch,
    upload: uploadMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,
    reparse: reparseMutation.mutateAsync,
    isUploading: uploadMutation.isLoading,
    isUpdating: updateMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
    isReparsing: reparseMutation.isLoading,
  };
};
