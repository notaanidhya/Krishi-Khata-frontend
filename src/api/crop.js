
import apiClient from './apiClient';

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
 * @param {number} farmId
 * @param {Object} cropData 
 */
export const createCrop = async (farmId, cropData) => {
  const { data } = await apiClient.post(`/api/v1/farms/${farmId}/crops`, cropData);
  return data;
};

/**
 * @param {number} cropId
 */
export const deleteCrop = async (cropId) => {
  const { data } = await apiClient.delete(`/api/v1/crops/${cropId}`);
  return data;
};

export const getCropPresets = async () => {
  const { data } = await apiClient.get('/api/v1/crop-presets');
  return data;
};

/**
 * @param {number} cropId
 */
export const retryCropValidation = async (cropId) => {
  const { data } = await apiClient.post(`/api/v1/crops/${cropId}/retry_validation`);
  return data;
};


/**
 * @param {number} cropId
 * @param {string} query 
 * @returns {{ answer: string, crop_name: string, days_since_planting: number, current_stage: string }}
 */
export const askCropAI = async (cropId, query) => {
  const { data } = await apiClient.post(`/api/v1/crops/${cropId}/ask_ai`, { query });
  return data;
};

/**
 * @param {number} cropId
 * @param {Object} logData 
 */
export const addCropLog = async (cropId, logData) => {
  const { data } = await apiClient.post(`/api/v1/crops/${cropId}/logs`, logData);
  return data;
};

