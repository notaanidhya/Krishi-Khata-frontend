/**
 * TanStack Query hooks for the Kisan Khata ledger.
 *
 * Fail-proof: if the backend is unreachable, falls back to empty state
 * instead of showing error messages.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
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
 * Helper to incrementally update the summary cache without needing the full transactions list.
 */
const applySummaryDelta = (queryClient, farmId, incomeChange, expenseChange, countChange) => {
  if (!farmId) return;
  queryClient.setQueryData(KHATA_KEYS.summary(farmId), (old) => {
    // If we haven't fetched the summary yet, don't guess it. Just let the next GET fetch it.
    if (!old) return old;
    
    const newIncome = Number(old.total_income || 0) + incomeChange;
    const newExpense = Number(old.total_expense || 0) + expenseChange;
    
    return {
      ...old,
      total_income: newIncome,
      total_expense: newExpense,
      net_profit: newIncome - newExpense,
      transaction_count: Math.max(0, Number(old.transaction_count || 0) + countChange)
    };
  });
};

/**
 * Mutation: add a new transaction.
 */
export const useAddTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addTransaction,
    onMutate: async (newTxn) => {
      await queryClient.cancelQueries({ queryKey: ['khata', 'transactions'] });
      await queryClient.cancelQueries({ queryKey: ['farms', 'laborers'] });
      
      const previousTxns = queryClient.getQueriesData({ queryKey: ['khata', 'transactions'] });
      const previousLaborers = queryClient.getQueriesData({ queryKey: ['farms', 'laborers'] });
      const previousSummary = newTxn.farm_id ? queryClient.getQueryData(KHATA_KEYS.summary(newTxn.farm_id)) : null;

      const tempId = `temp-${Date.now()}`;
      queryClient.setQueriesData({ queryKey: ['khata', 'transactions'] }, (old) => {
        if (!Array.isArray(old)) return old;
        const optimisticTxn = {
          ...newTxn,
          id: tempId,
          transaction_date: newTxn.transaction_date || new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString(),
          is_syncing: true
        };
        return [optimisticTxn, ...old];
      });

      if (newTxn.farm_id) {
        let incomeChange = 0;
        let expenseChange = 0;
        if (newTxn.type === 'income') incomeChange = Number(newTxn.amount);
        else if (newTxn.type === 'expense' || newTxn.type === 'labor_wage') expenseChange = Number(newTxn.amount);
        
        applySummaryDelta(queryClient, newTxn.farm_id, incomeChange, expenseChange, 1);
        
        if (newTxn.laborer_id) {
          queryClient.setQueryData(['farms', 'laborers', String(newTxn.farm_id)], (old) => {
            if (!Array.isArray(old)) return old;
            return old.map(lab => {
              if (String(lab.id) === String(newTxn.laborer_id)) {
                let amountChange = 0;
                if (newTxn.type === 'labor_wage') amountChange = Number(newTxn.amount);
                if (newTxn.type === 'labor_payment') amountChange = -Number(newTxn.amount);
                return {
                  ...lab,
                  current_balance: Number(lab.current_balance || 0) + amountChange,
                  transaction_count: Number(lab.transaction_count || 0) + 1
                };
              }
              return lab;
            });
          });
        }
      }

      return { previousTxns, previousLaborers, previousSummary, tempId, farmId: newTxn.farm_id };
    },
    onError: (err, newTxn, context) => {
      const msg = err.response?.data?.detail || err.message || 'Unknown error';
      toast.error(`Failed to save: ${msg}`);
      if (context?.previousTxns) {
        context.previousTxns.forEach(([queryKey, oldData]) => {
          queryClient.setQueryData(queryKey, oldData);
        });
      }
      if (context?.previousLaborers) {
        context.previousLaborers.forEach(([queryKey, oldData]) => {
          queryClient.setQueryData(queryKey, oldData);
        });
      }
      if (context?.previousSummary && context?.farmId) {
        queryClient.setQueryData(KHATA_KEYS.summary(context.farmId), context.previousSummary);
      }
    },
    onSuccess: (savedTxn, variables, context) => {
      queryClient.setQueriesData({ queryKey: ['khata', 'transactions'] }, (old) => {
        if (!Array.isArray(old)) return old;
        return old.map(txn => txn.id === context.tempId ? savedTxn : txn);
      });
      // Summary delta handled optimistically
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
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['khata', 'transactions'] });
      await queryClient.cancelQueries({ queryKey: ['farms', 'laborers'] });

      const previousTxns = queryClient.getQueriesData({ queryKey: ['khata', 'transactions'] });
      const previousLaborers = queryClient.getQueriesData({ queryKey: ['farms', 'laborers'] });

      let farmId = null;
      if (previousTxns[0] && previousTxns[0][1] && previousTxns[0][1].length > 0) {
        const deletedTxn = previousTxns[0][1].find(t => t.id === id);
        if (deletedTxn && deletedTxn.farm_id) {
          farmId = deletedTxn.farm_id;
        }
      }
      const previousSummary = farmId ? queryClient.getQueryData(KHATA_KEYS.summary(farmId)) : null;

      queryClient.setQueriesData({ queryKey: ['khata', 'transactions'] }, (old) => {
        if (!Array.isArray(old)) return old;
        return old.filter(txn => txn.id !== id);
      });

      if (previousTxns[0] && previousTxns[0][1] && previousTxns[0][1].length > 0) {
        const deletedTxn = previousTxns[0][1].find(t => t.id === id);
        if (deletedTxn && deletedTxn.farm_id) {
          let incomeChange = 0;
          let expenseChange = 0;
          if (deletedTxn.type === 'income') incomeChange = -Number(deletedTxn.amount);
          else if (deletedTxn.type === 'expense' || deletedTxn.type === 'labor_wage') expenseChange = -Number(deletedTxn.amount);
          
          applySummaryDelta(queryClient, deletedTxn.farm_id, incomeChange, expenseChange, -1);
          
          if (deletedTxn.laborer_id) {
            queryClient.setQueryData(['farms', 'laborers', String(deletedTxn.farm_id)], (old) => {
              if (!Array.isArray(old)) return old;
              return old.map(lab => {
                if (String(lab.id) === String(deletedTxn.laborer_id)) {
                  let amountChange = 0;
                  if (deletedTxn.type === 'labor_wage') amountChange = -Number(deletedTxn.amount);
                  if (deletedTxn.type === 'labor_payment') amountChange = Number(deletedTxn.amount);
                  return {
                    ...lab,
                    current_balance: Number(lab.current_balance || 0) + amountChange,
                    transaction_count: Math.max(0, Number(lab.transaction_count || 0) - 1)
                  };
                }
                return lab;
              });
            });
          }
        }
      }

      return { previousTxns, previousLaborers, previousSummary, farmId };
    },
    onError: (err, id, context) => {
      const msg = err.response?.data?.detail || err.message || 'Unknown error';
      toast.error(`Failed to delete: ${msg}`);
      if (context?.previousTxns) {
        context.previousTxns.forEach(([queryKey, oldData]) => {
          queryClient.setQueryData(queryKey, oldData);
        });
      }
      if (context?.previousLaborers) {
        context.previousLaborers.forEach(([queryKey, oldData]) => {
          queryClient.setQueryData(queryKey, oldData);
        });
      }
      if (context?.previousSummary && context?.farmId) {
        queryClient.setQueryData(KHATA_KEYS.summary(context.farmId), context.previousSummary);
      }
    },
    onSuccess: (data, id, context) => {
      // Delta applied optimistically
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
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['khata', 'transactions'] });
      await queryClient.cancelQueries({ queryKey: ['farms', 'laborers'] });

      const previousTxns = queryClient.getQueriesData({ queryKey: ['khata', 'transactions'] });
      const previousLaborers = queryClient.getQueriesData({ queryKey: ['farms', 'laborers'] });

      let updatedFarmId = null;
      if (previousTxns[0] && previousTxns[0][1]) {
        const oldTxn = previousTxns[0][1].find(t => t.id === id);
        if (oldTxn) updatedFarmId = oldTxn.farm_id;
      }
      const previousSummary = updatedFarmId ? queryClient.getQueryData(KHATA_KEYS.summary(updatedFarmId)) : null;
      queryClient.setQueriesData({ queryKey: ['khata', 'transactions'] }, (old) => {
        if (!Array.isArray(old)) return old;
        return old.map(txn => {
          if (txn.id === id) {
            updatedFarmId = txn.farm_id;
            return { ...txn, ...data, is_syncing: true };
          }
          return txn;
        });
      });

      if (updatedFarmId) {
        // Reverse old laborer balance and summary, then apply new one
        if (previousTxns[0] && previousTxns[0][1]) {
          const oldTxn = previousTxns[0][1].find(t => t.id === id);
          if (oldTxn) {
            const updatedTxn = { ...oldTxn, ...data };
            
            // Summary delta
            let oldIncome = 0, oldExpense = 0;
            if (oldTxn.type === 'income') oldIncome = -Number(oldTxn.amount);
            else if (oldTxn.type === 'expense' || oldTxn.type === 'labor_wage') oldExpense = -Number(oldTxn.amount);

            let newIncome = 0, newExpense = 0;
            if (updatedTxn.type === 'income') newIncome = Number(updatedTxn.amount);
            else if (updatedTxn.type === 'expense' || updatedTxn.type === 'labor_wage') newExpense = Number(updatedTxn.amount);
            
            applySummaryDelta(queryClient, updatedFarmId, oldIncome + newIncome, oldExpense + newExpense, 0);
            
            // Laborer delta
            if (oldTxn.laborer_id) {
            queryClient.setQueryData(['farms', 'laborers', String(updatedFarmId)], (old) => {
              if (!Array.isArray(old)) return old;
              return old.map(lab => {
                if (String(lab.id) === String(updatedTxn.laborer_id)) {
                  let oldChange = 0;
                  if (oldTxn.type === 'labor_wage') oldChange = -Number(oldTxn.amount);
                  if (oldTxn.type === 'labor_payment') oldChange = Number(oldTxn.amount);
                  
                  let newChange = 0;
                  if (updatedTxn.type === 'labor_wage') newChange = Number(updatedTxn.amount);
                  if (updatedTxn.type === 'labor_payment') newChange = -Number(updatedTxn.amount);
                  
                  return {
                    ...lab,
                    current_balance: Number(lab.current_balance || 0) + oldChange + newChange
                  };
                }
                return lab;
              });
            });
          }
        }
      }
      }

      return { previousTxns, previousLaborers, previousSummary, farmId: updatedFarmId };
    },
    onError: (err, variables, context) => {
      const msg = err.response?.data?.detail || err.message || 'Unknown error';
      toast.error(`Failed to update: ${msg}`);
      if (context?.previousTxns) {
        context.previousTxns.forEach(([queryKey, oldData]) => {
          queryClient.setQueryData(queryKey, oldData);
        });
      }
      if (context?.previousLaborers) {
        context.previousLaborers.forEach(([queryKey, oldData]) => {
          queryClient.setQueryData(queryKey, oldData);
        });
      }
      if (context?.previousSummary && context?.farmId) {
        queryClient.setQueryData(KHATA_KEYS.summary(context.farmId), context.previousSummary);
      }
    },
    onSuccess: (savedTxn) => {
      queryClient.setQueriesData({ queryKey: ['khata', 'transactions'] }, (old) => {
        if (!Array.isArray(old)) return old;
        return old.map(txn => txn.id === savedTxn.id ? savedTxn : txn);
      });
      // Summary delta handled optimistically
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
 */
export const useSettleLaborer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addTransaction,
    onMutate: async (newTxn) => {
      await queryClient.cancelQueries({ queryKey: ['khata', 'transactions'] });
      await queryClient.cancelQueries({ queryKey: ['farms', 'laborers'] });

      const previousTxns = queryClient.getQueriesData({ queryKey: ['khata', 'transactions'] });
      const previousLaborers = queryClient.getQueriesData({ queryKey: ['farms', 'laborers'] });
      const previousSummary = newTxn.farm_id ? queryClient.getQueryData(KHATA_KEYS.summary(newTxn.farm_id)) : null;

      const tempId = `temp-${Date.now()}`;
      queryClient.setQueriesData({ queryKey: ['khata', 'transactions'] }, (old) => {
        if (!Array.isArray(old)) return old;
        const optimisticTxn = {
          ...newTxn,
          id: tempId,
          transaction_date: newTxn.transaction_date || new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString(),
          is_syncing: true
        };
        return [optimisticTxn, ...old];
      });

      if (newTxn.farm_id) {
        // Settlements do not affect Khata income/expense summary, but we increment count.
        applySummaryDelta(queryClient, newTxn.farm_id, 0, 0, 1);
        
        if (newTxn.laborer_id) {
          queryClient.setQueryData(['farms', 'laborers', String(newTxn.farm_id)], (old) => {
            if (!Array.isArray(old)) return old;
            return old.map(lab => {
              if (String(lab.id) === String(newTxn.laborer_id)) {
                let amountChange = 0;
                if (newTxn.type === 'labor_wage') amountChange = Number(newTxn.amount);
                if (newTxn.type === 'labor_payment') amountChange = -Number(newTxn.amount);
                return {
                  ...lab,
                  current_balance: Number(lab.current_balance || 0) + amountChange,
                  transaction_count: Number(lab.transaction_count || 0) + 1
                };
              }
              return lab;
            });
          });
        }
      }

      return { previousTxns, previousLaborers, previousSummary, tempId, farmId: newTxn.farm_id };
    },
    onError: (err, newTxn, context) => {
      const msg = err.response?.data?.detail || err.message || 'Unknown error';
      toast.error(`Failed to settle: ${msg}`);
      if (context?.previousTxns) {
        context.previousTxns.forEach(([queryKey, oldData]) => {
          queryClient.setQueryData(queryKey, oldData);
        });
      }
      if (context?.previousLaborers) {
        context.previousLaborers.forEach(([queryKey, oldData]) => {
          queryClient.setQueryData(queryKey, oldData);
        });
      }
      if (context?.previousSummary && context?.farmId) {
        queryClient.setQueryData(KHATA_KEYS.summary(context.farmId), context.previousSummary);
      }
    },
    onSuccess: (savedTxn, variables, context) => {
      queryClient.setQueriesData({ queryKey: ['khata', 'transactions'] }, (old) => {
        if (!Array.isArray(old)) return old;
        return old.map(txn => txn.id === context.tempId ? savedTxn : txn);
      });
      // We no longer need to recalculate on success since the optimistic delta handled it.
    },
  });
};
