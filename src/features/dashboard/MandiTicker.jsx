/**
 * MandiTicker — Redesigned premium Bento Box container.
 * 
 * Uses spacious horizontal row-based price tiles with dedicated 
 * emoji containers, Merriweather serif accents, and smart spacing 
 * to completely eliminate visual clutter and truncation.
 */

import React from 'react';
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

// ── Spacious Horizontal Price Card (Grid-Safe, Truncate-Free) ──
const PriceCard = ({ item }) => {
  const meta = COMMODITY_META[item.commodity] || DEFAULT_META;

  return (
    <div 
      className={`bg-gradient-to-br ${meta.gradient} shadow-sm rounded-2xl border ${meta.border} p-3 active:scale-[0.98] hover:shadow-md transition-all duration-150 cursor-pointer flex items-center justify-between gap-2.5`}
    >
      {/* Left Portion: Emoji Visual Anchor + Text stack */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="w-9 h-9 rounded-xl bg-white/95 border border-stone-100/80 flex items-center justify-center text-lg shrink-0 shadow-sm">
          {meta.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-serif-accent font-bold text-emerald-950 text-sm sm:text-base leading-tight break-words">
            {item.commodity}
          </h3>
          <p className="text-[10px] sm:text-xs font-sans text-stone-500 font-medium leading-none mt-0.5 break-words">
            {item.market}
          </p>
        </div>
      </div>

      {/* Right Portion: Clean Bhav Indicator + crisp geometric price */}
      <div className="text-right shrink-0">
        <span className="block text-[8px] sm:text-[9px] uppercase font-bold tracking-widest text-stone-400 font-sans mb-0.5">
          Bhav
        </span>
        <span className={`text-sm sm:text-base font-black ${meta.accent} font-sans leading-none`}>
          {formatINR(item.modal_price)}
        </span>
      </div>
    </div>
  );
};

// ── Loading Skeleton ───────────────────────────────────────────
const MandiSkeleton = () => (
  <div className="bg-white rounded-3xl shadow-md p-6 flex flex-col items-center justify-center min-h-[220px]">
    <div className="w-10 h-10 rounded-full bg-amber-400 animate-pulse mb-3" />
    <p className="text-stone-500 text-sm">Loading market prices...</p>
  </div>
);

// ── Empty State ────────────────────────────────────────────────
const MandiEmpty = () => (
  <div className="bg-white rounded-3xl shadow-md p-6 flex flex-col items-center justify-center min-h-[220px]">
    <Store size={36} className="text-emerald-950 mb-3 opacity-40" />
    <p className="font-serif text-emerald-950 text-center text-lg max-w-sm">
      Fetching latest market prices... No data available for your region yet.
    </p>
  </div>
);

// ═══════════════════════════════════════════════════════════════
//  MANDI TICKER SECTION
// ═══════════════════════════════════════════════════════════════
const MandiTicker = ({ data, isLoading, isError }) => {
  if (isLoading) return <MandiSkeleton />;
  
  const prices = data?.prices || [];
  
  if (isError || !data || prices.length === 0) return <MandiEmpty />;

  return (
    <div className="bg-white rounded-3xl shadow-md p-5 sm:p-6 border border-stone-100/30">
      {/* Modern Premium Header */}
      <div className="flex items-center gap-2.5 mb-5">
        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
        <h2 className="text-emerald-950 font-serif-accent text-xl sm:text-2xl font-bold">
          Aaj ke Mandi Bhav
        </h2>
      </div>

      {/* Chunky Grid: Mobile uses 2-columns as requested, tablet/desktop uses 3/4-columns */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {prices.map((item, index) => (
          <PriceCard key={`${item.commodity}-${item.market}-${index}`} item={item} />
        ))}
      </div>
    </div>
  );
};

export default MandiTicker;
