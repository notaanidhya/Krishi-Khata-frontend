/**
 * Mandi API Layer — uses centralized apiClient with JWT interceptor.
 * All requests target /api/v1/mandi on the FastAPI backend.
 */

import apiClient from './apiClient';

/**
 * Fetch mandi prices with optional filters.
 * @param {Object} params - { commodity, state }
 * @returns {Promise<Object>} MandiPricesResponse — { last_updated, prices[] }
 */
export const getMandiPrices = async (params = {}) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v != null)
  );
  const { data } = await apiClient.get('/api/v1/mandi/latest', { params: cleanParams });
  return data;
};

/**
 * Fetch list of available commodities.
 * @returns {Promise<Object>} { commodities: string[] }
 */
export const getCommodities = async () => {
  const { data } = await apiClient.get('/api/v1/mandi/commodities');
  return data;
};
