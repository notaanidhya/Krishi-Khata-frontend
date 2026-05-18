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
import {
  getActiveCrop,
  getCrops,
  getCropPresets,
  createCrop,
  deleteCrop,
  getCropLogs,
  addCropLog,
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
    staleTime: 1000 * 60 * 2,
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
    staleTime: 1000 * 60 * 2,
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
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: CROP_KEYS.activeCrop(variables.farmId) });
      queryClient.invalidateQueries({ queryKey: CROP_KEYS.crops(variables.farmId) });
      // Invalidate the generic 'crops' list as well
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeCrop'] });
      queryClient.invalidateQueries({ queryKey: ['crops'] });
    },
  });
};

/**
 * Fetch all diary logs for a specific crop cycle.
 */
export const useCropLogs = (cropId) => {
  return useQuery({
    queryKey: CROP_KEYS.logs(cropId),
    queryFn: () => getCropLogs(cropId),
    enabled: !!cropId,
    staleTime: 1000 * 60 * 2,
  });
};

/**
 * Mutation: add a new diary log entry.
 */
export const useAddCropLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cropId, logData }) => addCropLog(cropId, logData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeCrop'] });
      queryClient.invalidateQueries({ queryKey: ['crops'] });
      queryClient.invalidateQueries({ queryKey: ['cropLogs'] });
    },
  });
};
