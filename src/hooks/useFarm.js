/**
 * useFarm.js — TanStack Query hooks for farm management.
 *
 * useFarms      — fetches all farms for the current user
 * useCreateFarm — mutation to create a new farm
 *
 * On network failure, useFarms falls back to an empty array
 * so the empty-state UI renders cleanly.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFarms, createFarm } from '../api/farm';

const FARM_KEYS = {
  all: () => ['farms'],
};

/**
 * Fetch all farms for the current user.
 * Falls back to [] on error so the empty state renders.
 */
export const useFarms = () => {
  const hasToken = !!localStorage.getItem('agroo_jwt');
  return useQuery({
    queryKey: FARM_KEYS.all(),
    queryFn: async () => {
      try {
        return await getFarms();
      } catch {
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,                            // Retry twice for Render cold-start resilience
    retryDelay: 3000,                     // 3s between retries
    enabled: hasToken, // Prevent fetching if no token
  });
};

/**
 * Mutation: create a new farm.
 * Invalidates the farms list on success.
 */
export const useCreateFarm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFarm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FARM_KEYS.all() });
    },
  });
};
