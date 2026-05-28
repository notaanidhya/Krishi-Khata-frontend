/**
 * Farm API Layer — uses centralized apiClient with JWT interceptor.
 * All requests target /api/v1 on the FastAPI backend.
 */

import apiClient from './apiClient';

/**
 * Fetch all farms for the authenticated user.
 * @returns {Promise<Array>} Array of farm objects
 */
export const getFarms = async () => {
  const { data } = await apiClient.get('/api/v1/farms');
  return data;
};

/**
 * Create a new farm.
 * @param {Object} farmData - { name, area_acres, state, district? }
 * @returns {Promise<Object>} The created farm object
 */
export const createFarm = async (farmData) => {
  const { data } = await apiClient.post('/api/v1/farms', farmData);
  return data;
};

/**
 * Delete a farm by ID.
 * @param {number} farmId
 */
export const deleteFarm = async (farmId) => {
  await apiClient.delete(`/api/v1/farms/${farmId}`);
};

/**
 * Fetch laborers for a specific farm.
 * By default returns only active laborers.
 * @param {number} farmId
 * @param {boolean} [activeOnly=true]
 * @returns {Promise<Array>} Array of laborer objects with current_balance
 */
export const getLaborers = async (farmId, activeOnly = true) => {
  const { data } = await apiClient.get(`/api/v1/farms/${farmId}/laborers`, {
    params: { active_only: activeOnly },
  });
  return data;
};

/**
 * Create a new laborer for a specific farm.
 * @param {number} farmId
 * @param {Object} laborerData - { name, phone_number? }
 * @returns {Promise<Object>} The created laborer object with current_balance
 */
export const createLaborer = async (farmId, laborerData) => {
  const { data } = await apiClient.post(`/api/v1/farms/${farmId}/laborers`, laborerData);
  return data;
};
