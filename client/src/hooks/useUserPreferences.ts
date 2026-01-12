/**
 * useUserPreferences Hook
 * Custom hook for managing user preferences
 */

import { useQuery, useMutation, useQueryClient } from 'react-query';
import { userApi } from '../services/api';
import type { UserPreferences } from '../types';

export const useUserPreferences = () => {
  const queryClient = useQueryClient();

  // Fetch user preferences
  const {
    data: preferences,
    isLoading,
    error,
  } = useQuery<UserPreferences>('userPreferences', userApi.getPreferences, {
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Update preferences mutation
  const updateMutation = useMutation(
    (data: Partial<UserPreferences>) => userApi.updatePreferences(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('userPreferences');
      },
    }
  );

  return {
    preferences,
    isLoading,
    error,
    update: updateMutation.mutateAsync,
    isUpdating: updateMutation.isLoading,
  };
};
