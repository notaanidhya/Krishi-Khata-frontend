/**
 * Crop API Layer — Axios fetchers for crop tracking & farm diary.
 * All requests target /api/v1 on the FastAPI backend.
 */

import axios from 'axios';

const API_BASE = 'https://krishi-khata.onrender.com/api/v1';

/**
 * Fetch the currently active crop for a farm (with calculated stage).
 * Returns null if 404 (no active crop).
 */
export const getActiveCrop = async (farmId) => {
  try {
    const { data } = await axios.get(`${API_BASE}/farms/${farmId}/active_crop`);
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
  const { data } = await axios.get(`${API_BASE}/farms/${farmId}/crops`, { params });
  return data;
};

/**
 * Plant a new crop cycle on a farm.
 * @param {number} farmId
 * @param {Object} cropData - { crop_name, planting_date }
 */
export const createCrop = async (farmId, cropData) => {
  const { data } = await axios.post(`${API_BASE}/farms/${farmId}/crops`, cropData);
  return data;
};

/**
 * Delete a crop.
 * @param {number} cropId
 */
export const deleteCrop = async (cropId) => {
  const { data } = await axios.delete(`${API_BASE}/crops/${cropId}`);
  return data;
};

/**
 * Fetch crop name presets for the Add Crop dropdown.
 */
export const getCropPresets = async () => {
  const { data } = await axios.get(`${API_BASE}/crop-presets`);
  return data;
};

/**
 * Fetch all diary logs for a specific crop cycle.
 * @param {number} cropId
 */
export const getCropLogs = async (cropId) => {
  const { data } = await axios.get(`${API_BASE}/crops/${cropId}/logs`);
  return data;
};

/**
 * Submit a new diary log entry for a crop cycle.
 * @param {number} cropId
 * @param {Object} logData - { raw_content, input_type?, log_date? }
 */
export const addCropLog = async (cropId, logData) => {
  const { data } = await axios.post(`${API_BASE}/crops/${cropId}/logs`, logData);
  return data;
};
