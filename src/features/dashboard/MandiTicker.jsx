/**
 * MandiTicker — Redesigned premium Bento Box container.
 * 
 * Uses spacious horizontal row-based price tiles with dedicated 
 * emoji containers, Merriweather serif accents, and smart spacing 
 * to completely eliminate visual clutter and truncation.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Store } from 'lucide-react';

// ── Curated Commodity Profiles (Warm, Organic Aesthetics) ──────
const COMMODITY_META = {
  Wheat:     { emoji: '🌾', gradient: 'from-[#fffdf9] to-[#fffbeb]', border: 'border-amber-200/50', accent: 'text-amber-600' },
  Soybean:   { emoji: '🫘', gradient: 'from-[#fffdf9] to-[#faf5ff]', border: 'border-purple-200/40', accent: 'text-purple-600' },
  Chana:     { emoji: '🫘', gradient: 'from-[#fffdf9] to-[#fefce8]', border: 'border-yellow-200/50', accent: 'text-yellow-600' },
  Cotton:    { emoji: '🏵️', gradient: 'from-[#fffdf9] to-[#f0fdf4]', border: 'border-emerald-200/40', accent: 'text-emerald-600' },
  Rice:      { emoji: '🍚', gradient: 'from-[#fffdf9] to-[#fff7ed]', border: 'border-orange-200/40', accent: 'text-orange-600' },
  Onion:     { emoji: '🧅', gradient: 'from-[#fffdf9] to-[#fdf2f8]', border: 'border-pink-200/40', accent: 'text-pink-600' },
  Maize:     { emoji: '🌽', gradient: 'from-[#fffdf9] to-[#fffbeb]', border: 'border-amber-200/50', accent: 'text-amber-600' },
  Tomato:    { emoji: '🍅', gradient: 'from-[#fffdf9] to-[#fff1f2]', border: 'border-red-200/40', accent: 'text-red-600' },
};

const DEFAULT_META = { 
  emoji: '📦', 
  gradient: 'from-[#fffdf9] to-[#fafaf9]', 
  border: 'border-stone-200/50', 
  accent: 'text-amber-600' 
};

const formatINR = (value) =>
  new Intl.NumberFormat('en-IN', { 
    style: 'currency', 
    currency: 'INR', 
    maximumFractionDigits: 0 
  }).format(value);

// ── Vertical Bento Price Card (Surgical Flex Layout Fix) ────────────
export const PriceCard = ({ item, onClick }) => {
  const { t, i18n } = useTranslation();
  const commodity = item.commodity || item.Commodity || '';
  const rawMarket = item.market || item.Market || item.mandi || item.Mandi || '';
  const marketHi = item.market_hi || rawMarket;
  const market = i18n.language === 'hi' ? marketHi : rawMarket;
  const modalPrice = item.modal_price || item.Modal_Price || 0;
  
  const meta = COMMODITY_META[commodity] || DEFAULT_META;

  return (
    <div 
      onClick={onClick}
      className={`h-full bg-gradient-to-br ${meta.gradient} shadow-sm rounded-2xl border ${meta.border} p-3 sm:p-4 lg:p-5 flex flex-col gap-2 min-w-0 w-full active:scale-[0.98] hover:shadow-md transition-all duration-150 cursor-pointer`}
    >
      {/* Top: Icon + Name horizontally */}
      <div className="flex items-center gap-2 min-w-0 w-full">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/95 border border-stone-100/80 flex items-center justify-center text-base sm:text-xl shrink-0 shadow-sm">
          {meta.emoji}
        </div>
        <h3 className="font-serif-accent text-lg sm:text-xl font-bold text-emerald-950 truncate min-w-0 flex-1">
          {t(`mandi.commodities.${commodity}`, { defaultValue: commodity })}
        </h3>
      </div>

      {/* Middle: Market Location */}
      <p className="text-xs sm:text-sm text-stone-500 font-medium truncate min-w-0 w-full">
        {market}
      </p>

      {/* Bottom: Price pushed to bottom */}
      <div className="mt-auto pt-2 sm:pt-3 flex flex-col min-w-0">
        <span className="text-[9px] sm:text-[10px] tracking-widest text-stone-400 uppercase">
          {t('mandi.bhav')}
        </span>
        <span className={`text-xl sm:text-2xl font-bold ${meta.accent} truncate min-w-0`}>
          {formatINR(modalPrice)} <span className="text-sm font-medium text-stone-500">/ {i18n.language === 'hi' ? 'क्विंटल' : t('mandi.quintal', 'Quintal')}</span>
        </span>
      </div>
    </div>
  );
};

// ── Loading Skeleton ───────────────────────────────────────────
const MandiSkeleton = () => {
  const { t } = useTranslation();
  return (
  <div className="bg-white rounded-3xl shadow-md p-6 flex flex-col items-center justify-center min-h-[220px]">
    <div className="w-10 h-10 rounded-full bg-amber-400 animate-pulse mb-3" />
    <p className="text-stone-500 text-sm">{t('mandi.loadingPrices')}</p>
  </div>
  );
};

// ── Empty State ────────────────────────────────────────────────
const MandiEmpty = () => {
  const { t } = useTranslation();
  return (
  <div className="bg-white rounded-3xl shadow-md p-6 flex flex-col items-center justify-center min-h-[220px]">
    <Store size={36} className="text-emerald-950 mb-3 opacity-40" />
    <p className="font-serif text-emerald-950 text-center text-lg max-w-sm">
      {t('mandi.emptyState')}
    </p>
  </div>
  );
};

// ═══════════════════════════════════════════════════════════════
//  MANDI TICKER SECTION
// ═══════════════════════════════════════════════════════════════
const MandiTicker = ({ data, isLoading, isError }) => {
  const { t } = useTranslation();
  if (isLoading) return <MandiSkeleton />;
  
  const prices = data?.prices || [];
  
  if (isError || !data || prices.length === 0) return <MandiEmpty />;

  return (
    <div className="bg-white rounded-3xl shadow-md p-5 sm:p-6 border border-stone-100/30">
      {/* Modern Premium Header */}
      <div className="flex items-center gap-2.5 mb-5">
        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
        <h2 className="text-emerald-950 font-serif-accent text-xl sm:text-2xl font-bold">
          {t('mandi.tickerTitle')}
        </h2>
      </div>

      {/* Chunky Grid Container */}
      <div className="grid grid-cols-2 gap-4">
        {prices.map((item, index) => {
          const commodity = item.commodity || item.Commodity || '';
          const market = item.market || item.Market || item.mandi || item.Mandi || '';
          return (
            <PriceCard key={`${commodity}-${market}-${index}`} item={item} />
          );
        })}
      </div>
    </div>
  );
};

export default MandiTicker;
