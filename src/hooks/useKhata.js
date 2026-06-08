/**
 * TanStack Query hooks for the Kisan Khata ledger.
 *
 * Fail-proof: if the backend is unreachable, falls back to empty state
 * instead of showing error messages.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTransactions, getSummary, addTransaction, deleteTransaction, updateTransaction } from '../api/khata';

const KHATA_KEYS = {
  transactions: (farmId) => ['khata', 'transactions', farmId],
  summary:      (farmId) => ['khata', 'summary',      farmId],
};

const EMPTY_SUMMARY      = { total_income: 0, total_expense: 0, net_profit: 0, transaction_count: 0 };
const EMPTY_TRANSACTIONS = [];

// Wraps a fetch fn: on any network error returns the fallback value
const withFallback = (fn, fallback) => async (...args) => {
  try {
    return await fn(...args);
  } catch {
    return fallback;
  }
};

/**
 * Fetch transactions for a given farm.
 * Falls back to [] so the empty state renders instead of an error.
 */
export const useTransactions = (farmId) => {
  const hasToken = !!localStorage.getItem('agroo_jwt');
  return useQuery({
    queryKey: KHATA_KEYS.transactions(farmId),
    queryFn:  withFallback(() => getTransactions({ farm_id: farmId }), EMPTY_TRANSACTIONS),
    staleTime: 1000 * 30,                 // 30s — feels real-time after mutations
    retry: 2,                            // Retry twice for Render cold-start resilience
    retryDelay: 3000,                     // 3s between retries
    enabled: hasToken,
  });
};

/**
 * Fetch aggregated summary for a given farm.
 * Falls back to zeroes so the summary card renders instead of error.
 */
export const useSummary = (farmId) => {
  const hasToken = !!localStorage.getItem('agroo_jwt');
  return useQuery({
    queryKey: KHATA_KEYS.summary(farmId),
    queryFn:  withFallback(() => getSummary(farmId), EMPTY_SUMMARY),
    staleTime: 1000 * 30,                 // 30s — feels real-time after mutations
    retry: 2,                            // Retry twice for Render cold-start resilience
    retryDelay: 3000,                     // 3s between retries
    enabled: hasToken,
  });
};

/**
 * Mutation: add a new transaction.
 */
export const useAddTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['khata'], refetchType: 'all' });
    },
  });
};

/**
 * Mutation: delete a transaction by ID.
 */
export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['khata'], refetchType: 'all' });
    },
  });
};

/**
 * Mutation: update a transaction by ID.
 */
export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['khata'], refetchType: 'all' });
    },
  });
};

/**
 * Fetch transactions for a specific laborer (labor_wage + labor_payment).
 * Falls back to [] so the empty state renders cleanly.
 */
export const useTransactionsByLaborer = (farmId, laborerId) => {
  const hasToken = !!localStorage.getItem('agroo_jwt');
  return useQuery({
    queryKey: [...KHATA_KEYS.transactions(farmId), 'laborer', laborerId],
    queryFn: withFallback(
      () => getTransactions({ farm_id: farmId, laborer_id: laborerId }),
      EMPTY_TRANSACTIONS
    ),
    staleTime: 1000 * 30,                 // 30s — feels real-time after mutations
    retry: 2,
    retryDelay: 3000,
    enabled: hasToken && !!farmId && !!laborerId,
  });
};

/**
 * Mutation: settle a laborer's account (labor_payment transaction).
 * Invalidates both khata and farms/laborers caches so balances update.
 */
export const useSettleLaborer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['khata'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['farms', 'laborers'], refetchType: 'all' });
    },
  });
};
