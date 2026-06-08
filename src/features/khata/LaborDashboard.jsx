/**
 * LaborDashboard — "Labor Hisab" premium tab view.
 *
 * Features:
 * - Overview grid of laborer cards with color-coded balances
 * - Expandable detailed ledger per laborer
 * - Inline settlement (Pay Laborer) modal
 * - Visual paid-off indicator on old wage rows
 *
 * Follows Krishi design system: warm clay bg, forest greens, serif accents.
 */

import React, { useState } from 'react';
import {
  Users, ChevronLeft, IndianRupee, Loader2, AlertCircle,
  Wallet, ArrowDownRight, ArrowUpRight, Calendar, X, Check,
  UserCheck, Clock, Banknote,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useActiveFarm } from '../../context/ActiveFarmContext';
import { useLaborers } from '../../hooks/useFarm';
import { useTransactionsByLaborer, useSettleLaborer } from '../../hooks/useKhata';
import useModalAnimation from '../../hooks/useModalAnimation';

// ── Helpers ────────────────────────────────────────────────────
const formatINR = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

// ═══════════════════════════════════════════════════════════════
//  SETTLEMENT MODAL — Pay laborer prompt
// ═══════════════════════════════════════════════════════════════
const SettlementModal = ({ laborer, farmId, onClose, isOpen }) => {
  const { t } = useTranslation();
  const { mounted, animating } = useModalAnimation(isOpen, 340);
  const settleMutation = useSettleLaborer();
  const [payAmount, setPayAmount] = useState(
    laborer.current_balance > 0 ? String(laborer.current_balance) : ''
  );

  const handleSettle = (e) => {
    e.preventDefault();
    const amt = parseFloat(payAmount);
    if (!amt || amt <= 0) return;

    settleMutation.mutate(
      {
        type: 'labor_payment',
        amount: amt,
        category: 'labor_payment',
        laborer_id: laborer.id,
        farm_id: farmId,
        description: `Payment to ${laborer.name}`,
        transaction_date: new Date().toISOString().split('T')[0],
      },
      {
        onSuccess: () => onClose(),
      }
    );
  };

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm modal-backdrop ${animating ? 'modal-open' : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`w-full max-w-sm mx-4 rounded-2xl shadow-2xl overflow-hidden modal-center ${animating ? 'modal-open' : ''}`}
        style={{ background: 'var(--color-soil)' }}
      >
        {/* Header */}
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{
            background: 'linear-gradient(135deg, #052e16 0%, #14532d 100%)',
          }}
        >
          <div className="flex items-center gap-2 text-white">
            <Banknote size={20} className="text-amber-300" />
            <h3 className="font-bold font-serif-accent">{t('labor.payLaborer')}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={18} className="text-white/70" />
          </button>
        </div>

        <form onSubmit={handleSettle} className="p-5 space-y-4">
          {/* Laborer Info */}
          <div
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #166534, #14532d)' }}
            >
              {laborer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: 'var(--color-forest)' }}>
                {laborer.name}
              </p>
              <p className="text-xs text-stone-500">
                {t('labor.balance')}: <span className="font-bold text-red-500">{formatINR(laborer.current_balance)}</span>
              </p>
            </div>
          </div>

          {/* Payment Amount */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
              <IndianRupee size={14} /> {t('labor.paymentAmount')}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-lg text-stone-400">₹</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0.01"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                placeholder="0.00"
                required
                autoFocus
                className="w-full px-4 py-3.5 pl-10 rounded-xl text-xl font-bold transition-all outline-none border-2 focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-700"
                style={{ background: '#fffdf9', borderColor: '#d6cfc6', color: 'var(--color-forest)' }}
              />
            </div>
            {laborer.current_balance > 0 && (
              <button
                type="button"
                onClick={() => setPayAmount(String(laborer.current_balance))}
                className="text-xs text-emerald-700 font-bold mt-1.5 hover:underline"
              >
                {t('labor.payFullAmount')} {formatINR(laborer.current_balance)}
              </button>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-bold text-sm text-stone-500 transition-all hover:bg-stone-200 active:scale-[0.97]"
              style={{ background: '#e7e2db' }}
            >
              {t('labor.cancel')}
            </button>
            <button
              type="submit"
              disabled={settleMutation.isPending || !payAmount || parseFloat(payAmount) <= 0}
              className="flex-1 py-3 rounded-xl font-bold text-sm text-white transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #166534, #14532d)',
                boxShadow: '0 4px 16px rgba(22,101,52,0.35)',
              }}
            >
              {settleMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {t('labor.paying')}
                </>
              ) : (
                <>
                  <Check size={16} strokeWidth={3} />
                  {t('labor.payNow')}
                </>
              )}
            </button>
          </div>

          {settleMutation.isError && (
            <p className="text-center text-sm text-red-500 bg-red-50 rounded-xl py-2 px-3">
              {t('labor.paymentFailed')}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
//  LABORER DETAIL — Transaction ledger for a single laborer
// ═══════════════════════════════════════════════════════════════
const LaborerDetail = ({ laborer, farmId, onBack }) => {
  const { t } = useTranslation();
  const { data: transactions = [], isLoading } = useTransactionsByLaborer(farmId, laborer.id);
  const [showSettleModal, setShowSettleModal] = useState(false);

  const isSettled = laborer.current_balance <= 0;

  return (
    <div className="space-y-4 animate-slide-up" style={{ animationDuration: '0.25s' }}>
      {/* Back Header */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-bold transition-colors hover:text-emerald-800"
        style={{ color: 'var(--color-forest)' }}
      >
        <ChevronLeft size={18} strokeWidth={2.5} />
        {t('labor.backToAll')}
      </button>

      {/* Laborer Header Card */}
      <div
        className="rounded-2xl p-5 text-white"
        style={{
          background: isSettled
            ? 'linear-gradient(135deg, #052e16 0%, #14532d 50%, #166534 100%)'
            : 'linear-gradient(135deg, #7c2d12 0%, #9a3412 50%, #c2410c 100%)',
          boxShadow: isSettled
            ? '0 8px 40px rgba(5,46,22,0.4)'
            : '0 8px 40px rgba(154,52,18,0.35)',
        }}
      >
        <div className="flex items-center gap-4 mb-3">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold"
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)' }}
          >
            {laborer.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold font-serif-accent">{laborer.name}</h2>
            {laborer.phone_number && (
              <p className="text-sm opacity-70">{laborer.phone_number}</p>
            )}
          </div>
        </div>

        <div
          className="rounded-xl p-3 flex items-center justify-between"
          style={{ background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(4px)' }}
        >
          <div className="flex items-center gap-2">
            <Wallet size={16} className={isSettled ? 'text-emerald-300' : 'text-amber-300'} />
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">
              {isSettled ? t('labor.allSettled') : t('labor.balanceDue')}
            </span>
          </div>
          <p className="text-2xl font-black tracking-tight">
            {formatINR(Math.abs(laborer.current_balance))}
          </p>
        </div>
      </div>

      {/* Settle Button */}
      {laborer.current_balance > 0 && (
        <button
          onClick={() => setShowSettleModal(true)}
          className="w-full py-3.5 rounded-2xl font-bold text-base text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, #166534, #14532d)',
            boxShadow: '0 4px 20px rgba(22,101,52,0.35)',
          }}
        >
          <Banknote size={20} />
          {t('labor.pay')} {laborer.name}
        </button>
      )}

      {/* Transaction Ledger */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">
          {t('labor.transactionHistory')}
        </h3>

        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 size={28} className="text-emerald-700 animate-spin" />
          </div>
        )}

        {!isLoading && transactions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
              style={{ background: '#ecfdf5' }}
            >
              <Clock size={24} className="text-emerald-600" />
            </div>
            <p className="text-sm text-stone-400">{t('labor.noTransactions', { name: laborer.name })}</p>
          </div>
        )}

        {!isLoading && transactions.length > 0 && (
          <div className="space-y-2.5">
            {transactions.map((txn) => {
              const isWage = txn.type === 'labor_wage';
              const isPayment = txn.type === 'labor_payment';
              // Visual logic: if balance <= 0 (settled), dim old wage rows
              const isPaidOff = isSettled && isWage;

              return (
                <div
                  key={txn.id}
                  className={`krishi-card flex items-center gap-3 p-3.5 transition-all ${isPaidOff ? 'labor-paid-off' : ''}`}
                  style={{
                    borderLeft: `4px solid ${isPayment ? '#16a34a' : '#f59e0b'}`,
                    opacity: isPaidOff ? 0.5 : 1,
                  }}
                >
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: isPayment ? '#f0fdf4' : '#fffbeb',
                    }}
                  >
                    {isPayment ? (
                      <ArrowDownRight size={18} className="text-emerald-600" />
                    ) : (
                      <ArrowUpRight size={18} className="text-amber-600" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-bold text-sm ${isPaidOff ? 'line-through' : ''}`}
                      style={{ color: 'var(--color-forest)' }}
                    >
                      {isPayment ? t('labor.paymentMade') : t('labor.workDayWage')}
                    </p>
                    {txn.description && (
                      <p className="text-xs text-stone-400 truncate">{txn.description}</p>
                    )}
                    <p className="text-[11px] text-stone-400 mt-0.5 flex items-center gap-1">
                      <Calendar size={10} />
                      {formatDate(txn.transaction_date)}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="text-right shrink-0">
                    <p className={`font-extrabold text-base ${isPayment ? 'text-emerald-700' : 'text-amber-600'}`}>
                      {isPayment ? '−' : '+'}{formatINR(txn.amount)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Settlement Modal */}
      <SettlementModal
        laborer={laborer}
        farmId={farmId}
        isOpen={showSettleModal}
        onClose={() => setShowSettleModal(false)}
      />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
//  LABORER CARD — Grid card for the overview
// ═══════════════════════════════════════════════════════════════
const LaborerCard = ({ laborer, onClick }) => {
  const { t } = useTranslation();
  const isSettled = laborer.current_balance <= 0;
  const initial = laborer.name.charAt(0).toUpperCase();

  return (
    <button
      onClick={onClick}
      className="krishi-card tactile w-full text-left p-4 transition-all hover:shadow-lg"
      style={{
        borderLeft: `4px solid ${isSettled ? '#16a34a' : '#f59e0b'}`,
      }}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
          style={{
            background: isSettled
              ? 'linear-gradient(135deg, #16a34a, #15803d)'
              : 'linear-gradient(135deg, #f59e0b, #d97706)',
          }}
        >
          {initial}
        </div>

        {/* Name + Status */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm truncate" style={{ color: 'var(--color-forest)' }}>
            {laborer.name}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            {isSettled ? (
              <UserCheck size={12} className="text-emerald-600" />
            ) : (
              <Clock size={12} className="text-amber-600" />
            )}
            <span className={`text-xs font-semibold ${isSettled ? 'text-emerald-600' : 'text-amber-600'}`}>
              {isSettled ? t('labor.settled') : t('labor.due')}
            </span>
          </div>
        </div>

        {/* Balance */}
        <div className="text-right shrink-0">
          <p className={`font-extrabold text-base ${isSettled ? 'text-emerald-700' : 'text-red-500'}`}>
            {formatINR(Math.abs(laborer.current_balance))}
          </p>
          <p className="text-[10px] text-stone-400 uppercase font-bold tracking-wide">
            {isSettled ? t('labor.clear') : t('labor.owed')}
          </p>
        </div>
      </div>
    </button>
  );
};

// ═══════════════════════════════════════════════════════════════
//  LABOR DASHBOARD — Main exported component
// ═══════════════════════════════════════════════════════════════
const LaborDashboard = () => {
  const { t } = useTranslation();
  const { activeFarm } = useActiveFarm();
  const farmId = activeFarm?.id || null;
  const { data: laborers = [], isLoading, isError } = useLaborers(farmId);
  const [selectedLaborer, setSelectedLaborer] = useState(null);

  // Calculate summary stats
  const totalOwed = laborers.reduce((sum, l) => sum + Math.max(l.current_balance, 0), 0);
  const settledCount = laborers.filter((l) => l.current_balance <= 0).length;
  const pendingCount = laborers.length - settledCount;

  // If a laborer is selected, show the detail view
  if (selectedLaborer) {
    // Find the latest laborer data (balance may have changed after settlement)
    const freshLaborer = laborers.find(l => l.id === selectedLaborer.id) || selectedLaborer;
    return (
      <LaborerDetail
        laborer={freshLaborer}
        farmId={farmId}
        onBack={() => setSelectedLaborer(null)}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* ── Summary Card ──────────────────────────────── */}
      <div
        className="rounded-2xl p-5 text-white"
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
          boxShadow: '0 8px 40px rgba(30,27,75,0.35)',
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Users size={18} className="text-violet-300" />
          <span
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: 'rgba(196,181,253,0.8)' }}
          >
            {t('labor.title')}
          </span>
        </div>
        <p className="text-3xl font-black mb-4 tracking-tight text-white">
          {formatINR(totalOwed)}
          <span className="text-sm font-normal ml-2 opacity-60">{t('labor.totalDue')}</span>
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div
            className="rounded-xl p-3"
            style={{ background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(4px)' }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Clock size={14} className="text-amber-300" />
              <span className="text-[11px] font-bold uppercase tracking-wide text-amber-200">{t('labor.pending')}</span>
            </div>
            <p className="text-xl font-bold text-white">{pendingCount}</p>
          </div>
          <div
            className="rounded-xl p-3"
            style={{ background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(4px)' }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <UserCheck size={14} className="text-emerald-300" />
              <span className="text-[11px] font-bold uppercase tracking-wide text-emerald-200">{t('labor.settled')}</span>
            </div>
            <p className="text-xl font-bold text-white">{settledCount}</p>
          </div>
        </div>
      </div>

      {/* ── Laborer List ──────────────────────────────── */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">
          {t('labor.yourLaborers', { count: laborers.length })}
        </h2>

        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 size={28} className="text-emerald-700 animate-spin" />
          </div>
        )}

        {isError && (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100">
            <AlertCircle size={18} />
            <p className="text-sm">{t('labor.errorLoad')}</p>
          </div>
        )}

        {!isLoading && !isError && laborers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: '#ecfdf5' }}
            >
              <Users size={28} className="text-emerald-600" />
            </div>
            <h3 className="font-bold mb-1" style={{ color: 'var(--color-forest)' }}>
              {t('labor.emptyTitle')}
            </h3>
            <p className="text-sm text-stone-400 max-w-[260px]">
              {t('labor.emptyText')}
            </p>
          </div>
        )}

        {!isLoading && !isError && laborers.length > 0 && (
          <div className="space-y-3">
            {laborers.map((laborer) => (
              <LaborerCard
                key={laborer.id}
                laborer={laborer}
                onClick={() => setSelectedLaborer(laborer)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LaborDashboard;
