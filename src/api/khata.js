/**
 * Khata API Layer — uses centralized apiClient with JWT interceptor.
 * All requests target /api/v1/khata on the FastAPI backend.
 */

import apiClient from './apiClient';

/**
 * Fetch transactions with optional filters.
 * @param {Object} params - { farm_id, type, from_date, to_date }
 */
export const getTransactions = async (params = {}) => {
  // Strip out undefined/null values so they aren't sent as "null" strings
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v != null)
  );
  const { data } = await apiClient.get('/api/v1/khata/transactions', { params: cleanParams });
  return data;
};

/**
 * Fetch aggregated summary (income, expense, net profit).
 * @param {number|null} farmId
 */
export const getSummary = async (farmId) => {
  const params = farmId ? { farm_id: farmId } : {};
  const { data } = await apiClient.get('/api/v1/khata/summary', { params });
  return data;
};

/**
 * Create a new Khata transaction.
 * @param {Object} transaction - TransactionCreate payload
 */
export const addTransaction = async (transaction) => {
  const { data } = await apiClient.post('/api/v1/khata/transactions', transaction);
  return data;
};

/**
 * Delete a Khata transaction by ID.
 * @param {number} id
 */
export const deleteTransaction = async (id) => {
  await apiClient.delete(`/api/v1/khata/transactions/${id}`);
};

/**
 * Update a Khata transaction by ID.
 * @param {Object} payload - { id, data }
 */
export const updateTransaction = async ({ id, data }) => {
  const response = await apiClient.patch(`/api/v1/khata/transactions/${id}`, data);
  return response.data;
};

