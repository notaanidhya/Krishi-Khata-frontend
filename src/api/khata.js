/**
 * Khata API Layer — Axios fetchers for the Kisan Khata ledger.
 * All requests target /api/v1/khata on the FastAPI backend.
 */

import axios from 'axios';

const API_BASE = 'https://krishi-khata.onrender.com/api/v1/khata';

/**
 * Fetch transactions with optional filters.
 * @param {Object} params - { farm_id, type, from_date, to_date }
 */
export const getTransactions = async (params = {}) => {
  // Strip out undefined/null values so they aren't sent as "null" strings
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v != null)
  );
  const { data } = await axios.get(`${API_BASE}/transactions`, { params: cleanParams });
  return data;
};

/**
 * Fetch aggregated summary (income, expense, net profit).
 * @param {number|null} farmId
 */
export const getSummary = async (farmId) => {
  const params = farmId ? { farm_id: farmId } : {};
  const { data } = await axios.get(`${API_BASE}/summary`, { params });
  return data;
};

/**
 * Create a new Khata transaction.
 * @param {Object} transaction - TransactionCreate payload
 */
export const addTransaction = async (transaction) => {
  const { data } = await axios.post(`${API_BASE}/transactions`, transaction);
  return data;
};

/**
 * Delete a Khata transaction by ID.
 * @param {number} id
 */
export const deleteTransaction = async (id) => {
  await axios.delete(`${API_BASE}/transactions/${id}`);
};
