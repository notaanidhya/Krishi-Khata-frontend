/**
 * TanStack Query hooks for crop tracking & farm diary.
 *
 * useActiveCrop  — fetches the single active crop for a farm
 * useCrops       — fetches all crop cycles for a farm
 * useCropPresets — fetches known crop names for dropdown
 * useCreateCrop  — mutation to plant a new crop
 * useHarvestCrop — mutation to mark crop as harvested
 * useAddCropLog  — mutation that submits a diary entry
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getActiveCrop,
  getCrops,
  getCropPresets,
  createCrop,
  deleteCrop,
  addCropLog,
  retryCropValidation,
} from '../api/crop';

const CROP_KEYS = {
  activeCrop: (farmId) => ['activeCrop', farmId],
  crops: (farmId) => ['crops', farmId],
  presets: () => ['cropPresets'],
  logs: (cropId) => ['cropLogs', cropId],
};

/**
 * Fetch the active crop for a farm (null if none).
 */
export const useActiveCrop = (farmId) => {
  return useQuery({
    queryKey: CROP_KEYS.activeCrop(farmId),
    queryFn: () => getActiveCrop(farmId),
    enabled: !!farmId,
    staleTime: 1000 * 30,
  });
};

/**
 * Fetch all crop cycles for a farm.
 */
export const useCrops = (farmId) => {
  return useQuery({
    queryKey: CROP_KEYS.crops(farmId),
    queryFn: () => getCrops(farmId),
    enabled: !!farmId,
    staleTime: 1000 * 30,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (Array.isArray(data) && data.some((c) => c.is_processing)) {
        return 3000; // Poll every 3 seconds while crop is processing
      }
      return false;
    },
  });
};

/**
 * Fetch crop name presets for the dropdown.
 */
export const useCropPresets = () => {
  return useQuery({
    queryKey: CROP_KEYS.presets(),
    queryFn: getCropPresets,
    staleTime: 1000 * 60 * 60, // cache for 1 hour
  });
};

/**
 * Mutation: plant a new crop.
 */
export const useCreateCrop = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ farmId, cropData }) => createCrop(farmId, cropData),
    onMutate: async ({ farmId, cropData }) => {
      await queryClient.cancelQueries({ queryKey: ['activeCrop'] });
      await queryClient.cancelQueries({ queryKey: ['crops'] });

      const previousActiveCrop = queryClient.getQueriesData({ queryKey: ['activeCrop'] });
      const previousCrops = queryClient.getQueriesData({ queryKey: ['crops'] });

      const optimisticCrop = {
        id: `temp-${Date.now()}`,
        farm_id: farmId,
        name: cropData.name,
        variety: cropData.variety || null,
        planted_date: cropData.planted_date,
        expected_harvest_date: cropData.expected_harvest_date || null,
        is_active: true,
        is_processing: true, // Backend AI validation processing
        is_syncing: true,
        logs: [],
      };

      queryClient.setQueriesData({ queryKey: CROP_KEYS.activeCrop(farmId) }, optimisticCrop);

      queryClient.setQueriesData({ queryKey: CROP_KEYS.crops(farmId) }, (old) => {
        if (!Array.isArray(old)) return [optimisticCrop];
        return [optimisticCrop, ...old.map(c => ({ ...c, is_active: false }))];
      });

      return { previousActiveCrop, previousCrops };
    },
    onError: (err, variables, context) => {
      toast.error('Failed to plant crop. Changes reverted.');
      if (context?.previousActiveCrop) {
        context.previousActiveCrop.forEach(([queryKey, oldData]) => {
          queryClient.setQueryData(queryKey, oldData);
        });
      }
      if (context?.previousCrops) {
        context.previousCrops.forEach(([queryKey, oldData]) => {
          queryClient.setQueryData(queryKey, oldData);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['activeCrop'] });
      queryClient.invalidateQueries({ queryKey: ['crops'] });
    },
  });
};

/**
 * Mutation: delete crop.
 */
export const useDeleteCrop = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cropId }) => deleteCrop(cropId),
    onMutate: async ({ cropId }) => {
      await queryClient.cancelQueries({ queryKey: ['activeCrop'] });
      await queryClient.cancelQueries({ queryKey: ['crops'] });

      const previousActiveCrop = queryClient.getQueriesData({ queryKey: ['activeCrop'] });
      const previousCrops = queryClient.getQueriesData({ queryKey: ['crops'] });

      // If active crop is deleted, set to null
      queryClient.setQueriesData({ queryKey: ['activeCrop'] }, (old) => {
        if (old?.id === cropId) return null;
        return old;
      });

      queryClient.setQueriesData({ queryKey: ['crops'] }, (old) => {
        if (!Array.isArray(old)) return old;
        return old.filter(c => c.id !== cropId);
      });

      return { previousActiveCrop, previousCrops };
    },
    onError: (err, variables, context) => {
      toast.error('Failed to delete crop. Changes reverted.');
      if (context?.previousActiveCrop) {
        context.previousActiveCrop.forEach(([queryKey, oldData]) => {
          queryClient.setQueryData(queryKey, oldData);
        });
      }
      if (context?.previousCrops) {
        context.previousCrops.forEach(([queryKey, oldData]) => {
          queryClient.setQueryData(queryKey, oldData);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['activeCrop'] });
      queryClient.invalidateQueries({ queryKey: ['crops'] });
    },
  });
};

/**
 * Mutation: add crop log
 */
export const useAddCropLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cropId, logData }) => addCropLog(cropId, logData),
    onMutate: async ({ cropId, logData }) => {
      await queryClient.cancelQueries({ queryKey: ['activeCrop'] });
      await queryClient.cancelQueries({ queryKey: ['crops'] });

      const previousActiveCrop = queryClient.getQueriesData({ queryKey: ['activeCrop'] });
      const previousCrops = queryClient.getQueriesData({ queryKey: ['crops'] });

      const optimisticLog = {
        id: `temp-${Date.now()}`,
        crop_id: cropId,
        log_date: logData.log_date || new Date().toISOString().split('T')[0],
        activity: logData.activity,
        notes: logData.notes || null,
        created_at: new Date().toISOString(),
        is_syncing: true,
      };

      // Optimistically add to activeCrop's logs
      queryClient.setQueriesData({ queryKey: ['activeCrop'] }, (old) => {
        if (old?.id === cropId) {
          return { ...old, logs: [optimisticLog, ...(old.logs || [])] };
        }
        return old;
      });

      // Optimistically add to crops list
      queryClient.setQueriesData({ queryKey: ['crops'] }, (old) => {
        if (!Array.isArray(old)) return old;
        return old.map(c => c.id === cropId ? { ...c, logs: [optimisticLog, ...(c.logs || [])] } : c);
      });

      return { previousActiveCrop, previousCrops };
    },
    onError: (err, variables, context) => {
      toast.error('Failed to add crop log. Changes reverted.');
      if (context?.previousActiveCrop) {
        context.previousActiveCrop.forEach(([queryKey, oldData]) => {
          queryClient.setQueryData(queryKey, oldData);
        });
      }
      if (context?.previousCrops) {
        context.previousCrops.forEach(([queryKey, oldData]) => {
          queryClient.setQueryData(queryKey, oldData);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['activeCrop'] });
      queryClient.invalidateQueries({ queryKey: ['crops'] });
    },
  });
};

/**
 * Mutation: retry crop validation
 */
export const useRetryCropValidation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cropId }) => retryCropValidation(cropId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeCrop'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['crops'], refetchType: 'all' });
    },
  });
};


