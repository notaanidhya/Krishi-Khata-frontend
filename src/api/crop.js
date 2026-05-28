/**
 * Crop API Layer — uses centralized apiClient with JWT interceptor.
 * All requests target /api/v1 on the FastAPI backend.
 */

import apiClient from './apiClient';

/**
 * Fetch the currently active crop for a farm (with calculated stage).
 * Returns null if 404 (no active crop).
 */
export const getActiveCrop = async (farmId) => {
  try {
    const { data } = await apiClient.get(`/api/v1/farms/${farmId}/active_crop`);
    return data;
  } catch (err) {
    if (err.response?.status === 404) return null;
    throw err;
  }
};

/**
 * Fetch all crop cycles for a farm (includes logs).
 * @param {number} farmId
 * @param {string} [statusFilter] - Optional: "ACTIVE" | "HARVESTED"
 */
export const getCrops = async (farmId, statusFilter) => {
  const params = {};
  if (statusFilter) params.status_filter = statusFilter;
  const { data } = await apiClient.get(`/api/v1/farms/${farmId}/crops`, { params });
  return data;
};

/**
 * Plant a new crop cycle on a farm.
 * @param {number} farmId
 * @param {Object} cropData - { crop_name, planting_date }
 */
export const createCrop = async (farmId, cropData) => {
  const { data } = await apiClient.post(`/api/v1/farms/${farmId}/crops`, cropData);
  return data;
};

/**
 * Delete a crop.
 * @param {number} cropId
 */
export const deleteCrop = async (cropId) => {
  const { data } = await apiClient.delete(`/api/v1/crops/${cropId}`);
  return data;
};

/**
 * Fetch crop name presets for the Add Crop dropdown.
 */
export const getCropPresets = async () => {
  const { data } = await apiClient.get('/api/v1/crop-presets');
  return data;
};

/**
 * Fetch all diary logs for a specific crop cycle.
 * @param {number} cropId
 */
export const getCropLogs = async (cropId) => {
  const { data } = await apiClient.get(`/api/v1/crops/${cropId}/logs`);
  return data;
};

/**
 * Submit a new diary log entry for a crop cycle.
 * @param {number} cropId
 * @param {Object} logData - { raw_content, input_type?, log_date? }
 */
export const addCropLog = async (cropId, logData) => {
  const { data } = await apiClient.post(`/api/v1/crops/${cropId}/logs`, logData);
  return data;
};

/**
 * Ask the AI Crop Doctor a question about a specific crop.
 * @param {number} cropId
 * @param {string} query - The farmer's question or issue description
 * @returns {{ answer: string, crop_name: string, days_since_planting: number, current_stage: string }}
 */
export const askCropAI = async (cropId, query) => {
  const { data } = await apiClient.post(`/api/v1/crops/${cropId}/ask_ai`, { query });
  return data;
};
