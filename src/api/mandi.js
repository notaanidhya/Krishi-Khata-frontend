/**
 * Mandi API Layer — Axios fetchers for mandi price data.
 * All requests target /api/v1/mandi on the FastAPI backend.
 */

import axios from 'axios';

const API_BASE = 'https://krishi-khata.onrender.com/api/v1/mandi';

/**
 * Fetch mandi prices with optional filters.
 * @param {Object} params - { commodity, state }
 * @returns {Promise<Object>} MandiPricesResponse — { last_updated, prices[] }
 */
export const getMandiPrices = async (params = {}) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v != null)
  );
  const { data } = await axios.get(`${API_BASE}/latest`, { params: cleanParams });
  return data;
};

/**
 * Fetch list of available commodities.
 * @returns {Promise<Object>} { commodities: string[] }
 */
export const getCommodities = async () => {
  const { data } = await axios.get(`${API_BASE}/commodities`);
  return data;
};
