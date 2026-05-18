/**
 * DashboardPage — "The Bento Box" Krishi redesign.
 *
 * - Warm stone-50 background with tactile bento cards
 * - Greeting in deep forest green
 * - MandiTicker as chunky commodity tiles
 * - KhataSummary as tactile tiles with deeper emerald
 * - FAB: deep emerald-800 with warm glow
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, ArrowRight, CalendarDays } from 'lucide-react';

import { useActiveFarm } from '../context/ActiveFarmContext';
import { useWeather, useMandiPrices } from '../hooks/useDashboard';
import { useSummary } from '../hooks/useKhata';
import WeatherCard from '../features/dashboard/WeatherCard';
import MandiTicker from '../features/dashboard/MandiTicker';

// ── Format currency ─────────────────────────────────────────────
const formatINR = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

// ── Get greeting based on time ──────────────────────────────────
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 5)  return 'Good Night 🌙';
  if (hour < 12) return 'Namaste 🌅';
  if (hour < 17) return 'Good Afternoon ☀️';
  return 'Shubh Sandhya 🌆';
};

// ── Format today's date ─────────────────────────────────────────
const formatToday = () =>
  new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

// ═══════════════════════════════════════════════════════════════
//  KHATA MINI SUMMARY — Tactile bento tiles
// ═══════════════════════════════════════════════════════════════
const KhataMiniSummary = ({ summary, isLoading, onViewAll }) => {
  if (isLoading) {
    return (
      <div className="krishi-card p-4 animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 bg-stone-200 rounded w-24" />
          <div className="h-3 bg-stone-200 rounded w-16" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="h-16 bg-stone-100 rounded-xl" />
          <div className="h-16 bg-stone-100 rounded-xl" />
          <div className="h-16 bg-stone-100 rounded-xl" />
        </div>
      </div>
    );
  }

  const data = summary || { total_income: 0, total_expense: 0, net_profit: 0, transaction_count: 0 };

  return (
    <div className="krishi-card p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-emerald-700" />
          <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#6b7280' }}>
            Khata Summary
          </h2>
        </div>
        <button
          onClick={onViewAll}
          className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
        >
          View All <ArrowRight size={12} />
        </button>
      </div>

      {/* Stats Grid — tactile tiles */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Income */}
        <div
          className="rounded-2xl p-3 text-center tactile"
          style={{ background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', border: '1px solid #a7f3d0' }}
        >
          <p className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider mb-1.5">
            Income
          </p>
          <p className="text-sm font-extrabold text-emerald-900 leading-tight">
            {formatINR(data.total_income)}
          </p>
        </div>
        {/* Expense */}
        <div
          className="rounded-2xl p-3 text-center tactile"
          style={{ background: 'linear-gradient(135deg, #fff1f2, #ffe4e6)', border: '1px solid #fecdd3' }}
        >
          <p className="text-[10px] uppercase font-bold text-red-600 tracking-wider mb-1.5">
            Kharcha
          </p>
          <p className="text-sm font-extrabold text-red-700 leading-tight">
            {formatINR(data.total_expense)}
          </p>
        </div>
        {/* Profit */}
        <div
          className="rounded-2xl p-3 text-center tactile"
          style={{
            background: data.net_profit >= 0
              ? 'linear-gradient(135deg, #fffbeb, #fef3c7)'
              : 'linear-gradient(135deg, #fff7ed, #ffedd5)',
            border: data.net_profit >= 0 ? '1px solid #fde68a' : '1px solid #fed7aa',
          }}
        >
          <p className="text-[10px] uppercase font-bold tracking-wider mb-1.5"
            style={{ color: data.net_profit >= 0 ? '#92400e' : '#9a3412' }}>
            Munafa
          </p>
          <p className="text-sm font-extrabold leading-tight"
            style={{ color: data.net_profit >= 0 ? '#78350f' : '#7c2d12' }}>
            {formatINR(data.net_profit)}
          </p>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
//  DASHBOARD PAGE
// ═══════════════════════════════════════════════════════════════
const DashboardPage = () => {
  const navigate = useNavigate();
  const { activeFarm } = useActiveFarm();
  const farmId = activeFarm?.id || null;

  const { data: weatherData, isLoading: weatherLoading, isError: weatherError } = useWeather();
  const { data: mandiData,   isLoading: mandiLoading,   isError: mandiError   } = useMandiPrices();
  const { data: khataSummary, isLoading: khataLoading } = useSummary(farmId);

  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-5 pb-32">

      {/* ── Greeting Section ─────────────────────────────── */}
      <div id="dashboard-greeting">
        <h2
          className="text-2xl font-extrabold leading-tight"
          style={{ color: 'var(--color-forest)' }}
        >
          {getGreeting()}
        </h2>
        <div className="flex items-center gap-1.5 mt-1" style={{ color: '#9ca3af' }}>
          <CalendarDays size={13} />
          <p className="text-xs font-medium">{formatToday()}</p>
        </div>
      </div>

      {/* ── Weather Card ────────────────────────────────── */}
      <WeatherCard data={weatherData} isLoading={weatherLoading} isError={weatherError} />

      {/* ── Mandi Ticker ────────────────────────────────── */}
      <MandiTicker data={mandiData} isLoading={mandiLoading} isError={mandiError} />

      {/* ── Khata Mini Summary ──────────────────────────── */}
      <KhataMiniSummary
        summary={khataSummary}
        isLoading={khataLoading}
        onViewAll={() => navigate('/khata')}
      />

      {/* ── Floating Quick-Add FAB ──────────────────────── */}
      <button
        id="quick-add-fab"
        onClick={() => navigate('/khata')}
        className="fixed bottom-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 text-white font-bold text-base px-7 py-4 rounded-2xl transition-all active:scale-95 animate-fab-pulse"
        style={{
          background: 'linear-gradient(135deg, #166534, #14532d)',
          boxShadow: '0 8px 32px rgba(22,101,52,0.45)',
        }}
      >
        <Plus size={22} strokeWidth={3} />
        Quick Add Expense / Income
      </button>
    </div>
  );
};

export default DashboardPage;
