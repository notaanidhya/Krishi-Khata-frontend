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
import { getFarms, getLaborers, createLaborer } from '../api/farm';

const FARM_KEYS = {
  all: () => ['farms'],
  laborers: (farmId) => ['farms', 'laborers', String(farmId)],
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
 * Fetch active laborers for a given farm.
 * Falls back to [] on error so the laborer dropdown renders cleanly.
 */
export const useLaborers = (farmId) => {
  const hasToken = !!localStorage.getItem('agroo_jwt');
  return useQuery({
    queryKey: FARM_KEYS.laborers(farmId),
    queryFn: async () => {
      try {
        return await getLaborers(farmId);
      } catch {
        return [];
      }
    },
    staleTime: 1000 * 60 * 2,
    retry: 2,
    retryDelay: 3000,
    enabled: hasToken && !!farmId,
  });
};


/**
 * Mutation: create a new laborer for a farm.
 * Invalidates the laborers cache on success so dropdowns update.
 */
export const useCreateLaborer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ farmId, name }) => createLaborer(farmId, { name }),
    onSuccess: async (newLaborer, variables) => {
      // Optimistically inject the new laborer into the dropdown list instantly
      queryClient.setQueryData(FARM_KEYS.laborers(variables.farmId), (oldData) => {
        if (!oldData) return [newLaborer];
        // Prevent duplicates
        if (oldData.some(l => l.id === newLaborer.id)) return oldData;
        return [...oldData, newLaborer];
      });

      // Trigger a background refetch to ensure perfect sync
      await queryClient.invalidateQueries({ queryKey: ['farms', 'laborers'] });
    },
  });
};
