/**
 * LaborDashboard — "Labor Hisab" premium tab view.
 *
 * Refined Earth theme: warm soil bg, forest greens, harvest gold, terracotta rust.
 * Features:
 * - Overview grid of laborer cards with color-coded balances
 * - Expandable detailed ledger per laborer
 * - Inline settlement (Pay Laborer) modal
 * - Visual paid-off indicator on old wage rows
 */

import React, { useState } from 'react';
import {
  Users, ChevronLeft, IndianRupee, Loader2, AlertCircle,
  Wallet, ArrowDownRight, ArrowUpRight, Calendar, X, Check,
  UserCheck, Clock, Banknote, Plus
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
          style={{ background: 'linear-gradient(135deg, var(--color-forest), var(--color-forest-mid))' }}
        >
          <div className="flex items-center gap-2 text-white">
            <Banknote size={20} style={{ color: 'var(--color-harvest)' }} />
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
            style={{ background: 'var(--color-forest-light)', border: '1px solid var(--color-forest-muted)' }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, var(--color-forest-mid), var(--color-forest))' }}
            >
              {laborer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: 'var(--color-forest)' }}>
                {laborer.name}
              </p>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                {t('labor.balance')}: <span className="font-bold" style={{ color: 'var(--color-danger)' }}>{formatINR(laborer.current_balance)}</span>
              </p>
            </div>
          </div>

          {/* Payment Amount */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-muted)' }}>
              <IndianRupee size={14} /> {t('labor.paymentAmount')}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-lg" style={{ color: 'var(--color-muted)' }}>₹</span>
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
                className="w-full px-4 py-3.5 pl-10 rounded-xl text-xl font-bold transition-all outline-none border-2"
                style={{ background: 'var(--color-cream)', borderColor: 'var(--border-subtle)', color: 'var(--color-ink)' }}
              />
            </div>
            {laborer.current_balance > 0 && (
              <button
                type="button"
                onClick={() => setPayAmount(String(laborer.current_balance))}
                className="text-xs font-bold mt-1.5 hover:underline"
                style={{ color: 'var(--color-forest)' }}
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
              className="flex-1 py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.97]"
              style={{ background: 'var(--color-soil-dark)', color: 'var(--color-muted)' }}
            >
              {t('labor.cancel')}
            </button>
            <button
              type="submit"
              disabled={settleMutation.isPending || !payAmount || parseFloat(payAmount) <= 0}
              className="flex-1 py-3 rounded-xl font-bold text-sm text-white transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, var(--color-forest-mid), var(--color-forest))',
                boxShadow: '0 4px 16px rgba(61,90,58,0.3)',
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
            <p className="text-center text-sm rounded-xl py-2 px-3" style={{ color: 'var(--color-danger)', background: 'var(--color-danger-soft)' }}>
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
        className="flex items-center gap-1.5 text-sm font-bold transition-colors"
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
            ? 'linear-gradient(135deg, var(--color-forest), var(--color-forest-mid))'
            : 'linear-gradient(135deg, #7c2d12, var(--color-rust))',
          boxShadow: isSettled
            ? '0 8px 40px rgba(61,90,58,0.35)'
            : '0 8px 40px rgba(201,123,74,0.35)',
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
            <Wallet size={16} style={{ color: isSettled ? '#a8d5a0' : 'var(--color-harvest)' }} />
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
            background: 'linear-gradient(135deg, var(--color-forest-mid), var(--color-forest))',
            boxShadow: '0 4px 20px rgba(61,90,58,0.3)',
          }}
        >
          <Banknote size={20} />
          {t('labor.pay')} {laborer.name}
        </button>
      )}

      {/* Transaction Ledger */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-muted)' }}>
          {t('labor.transactionHistory')}
        </h3>

        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 size={28} className="animate-spin" style={{ color: 'var(--color-forest)' }} />
          </div>
        )}

        {!isLoading && transactions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
              style={{ background: 'var(--color-forest-light)' }}
            >
              <Clock size={24} style={{ color: 'var(--color-forest-muted)' }} />
            </div>
            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>{t('labor.noTransactions', { name: laborer.name })}</p>
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
                    borderLeft: `4px solid ${isPayment ? 'var(--color-success)' : 'var(--color-harvest)'}`,
                    opacity: isPaidOff ? 0.5 : 1,
                  }}
                >
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: isPayment ? 'var(--color-forest-light)' : 'var(--color-warning-soft)',
                    }}
                  >
                    {isPayment ? (
                      <ArrowDownRight size={18} style={{ color: 'var(--color-success)' }} />
                    ) : (
                      <ArrowUpRight size={18} style={{ color: 'var(--color-harvest)' }} />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-bold text-sm ${isPaidOff ? 'line-through' : ''}`}
                      style={{ color: 'var(--color-ink)' }}
                    >
                      {isPayment ? t('labor.paymentMade') : t('labor.workDayWage')}
                    </p>
                    {txn.description && (
                      <p className="text-xs truncate" style={{ color: 'var(--color-muted)' }}>{txn.description}</p>
                    )}
                    <p className="text-[11px] mt-0.5 flex items-center gap-1" style={{ color: 'var(--color-muted)' }}>
                      <Calendar size={10} />
                      {formatDate(txn.transaction_date)}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="text-right shrink-0">
                    <p className="font-extrabold text-base" style={{ color: isPayment ? 'var(--color-success)' : 'var(--color-harvest)' }}>
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
        borderLeft: `4px solid ${isSettled ? 'var(--color-success)' : 'var(--color-harvest)'}`,
      }}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
          style={{
            background: isSettled
              ? 'linear-gradient(135deg, var(--color-forest-mid), var(--color-forest))'
              : 'linear-gradient(135deg, var(--color-harvest), var(--color-rust))',
          }}
        >
          {initial}
        </div>

        {/* Name + Status */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm truncate" style={{ color: 'var(--color-ink)' }}>
            {laborer.name}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            {isSettled ? (
              <UserCheck size={12} style={{ color: 'var(--color-success)' }} />
            ) : (
              <Clock size={12} style={{ color: 'var(--color-harvest)' }} />
            )}
            <span className="text-xs font-semibold" style={{ color: isSettled ? 'var(--color-success)' : 'var(--color-harvest)' }}>
              {isSettled ? t('labor.settled') : t('labor.due')}
            </span>
          </div>
        </div>

        {/* Balance */}
        <div className="text-right shrink-0">
          <p className="font-extrabold text-base" style={{ color: isSettled ? 'var(--color-success)' : 'var(--color-danger)' }}>
            {formatINR(Math.abs(laborer.current_balance))}
          </p>
          <p className="text-[10px] uppercase font-bold tracking-wide" style={{ color: 'var(--color-muted)' }}>
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
const LaborDashboard = ({ onAddWage }) => {
  const { t } = useTranslation();
  const { activeFarm } = useActiveFarm();
  const farmId = activeFarm?.id || null;
  const { data: laborers = [], isLoading, isError } = useLaborers(farmId);
  const [selectedLaborer, setSelectedLaborer] = useState(null);

  // Calculate summary stats
  const activeLaborers = laborers.filter((l) => l.transaction_count > 0 || l.current_balance > 0);

  const totalOwed = activeLaborers.reduce((sum, l) => sum + Math.max(l.current_balance, 0), 0);
  const pendingLaborers = activeLaborers.filter((l) => l.current_balance > 0);
  const settledLaborers = activeLaborers.filter((l) => l.current_balance <= 0);

  const settledCount = settledLaborers.length;
  const pendingCount = pendingLaborers.length;

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
          background: 'linear-gradient(135deg, var(--color-forest), var(--color-forest-mid))',
          boxShadow: '0 8px 40px rgba(61,90,58,0.3)',
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Users size={18} style={{ color: 'var(--color-harvest)' }} />
          <span
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: 'rgba(201,162,75,0.8)' }}
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
              <Clock size={14} style={{ color: 'var(--color-harvest)' }} />
              <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: 'rgba(201,162,75,0.9)' }}>{t('labor.pending')}</span>
            </div>
            <p className="text-xl font-bold text-white">{pendingCount}</p>
          </div>
          <div
            className="rounded-xl p-3"
            style={{ background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(4px)' }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <UserCheck size={14} style={{ color: '#a8d5a0' }} />
              <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: 'rgba(168,213,160,0.9)' }}>{t('labor.settled')}</span>
            </div>
            <p className="text-xl font-bold text-white">{settledCount}</p>
          </div>
        </div>
      </div>

      {/* ── Add Wage Button ───────────────────────── */}
      <button
        onClick={onAddWage}
        className="w-full py-4 text-white font-bold text-base rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        style={{
          background: 'linear-gradient(135deg, var(--color-forest-mid), var(--color-forest))',
          boxShadow: '0 4px 20px rgba(61,90,58,0.3)',
        }}
      >
        <Plus size={20} />
        {t('labor.addWage', 'Add Labor Wage')}
      </button>

      {/* ── Laborer List ──────────────────────────────── */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-muted)' }}>
          {t('labor.yourLaborers', { count: laborers.length })}
        </h2>

        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 size={28} className="animate-spin" style={{ color: 'var(--color-forest)' }} />
          </div>
        )}

        {isError && (
          <div className="flex items-center gap-2 p-4 rounded-2xl" style={{ color: 'var(--color-danger)', background: 'var(--color-danger-soft)' }}>
            <AlertCircle size={18} />
            <p className="text-sm">{t('labor.errorLoad')}</p>
          </div>
        )}

        {!isLoading && !isError && laborers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'var(--color-forest-light)' }}
            >
              <Users size={28} style={{ color: 'var(--color-forest-muted)' }} />
            </div>
            <h3 className="font-bold mb-1" style={{ color: 'var(--color-forest)' }}>
              {t('labor.emptyTitle')}
            </h3>
            <p className="text-sm max-w-[260px]" style={{ color: 'var(--color-muted)' }}>
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
