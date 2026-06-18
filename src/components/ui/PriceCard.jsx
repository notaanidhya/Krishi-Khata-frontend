import React from 'react';
import { useTranslation } from 'react-i18next';

// ── Curated Commodity Profiles (Warm, Organic Aesthetics) ──────
const COMMODITY_META = {
  Wheat:     { emoji: '🌾', gradient: 'from-[#fffdf9] to-[#fef8ed]', border: 'border-[#e8dcc0]/50', accent: 'text-[#c9a24b]' },
  Soybean:   { emoji: '🫘', gradient: 'from-[#fffdf9] to-[#f3eef8]', border: 'border-[#d8d0bf]/40', accent: 'text-[#7a7367]' },
  Chana:     { emoji: '🫘', gradient: 'from-[#fffdf9] to-[#fef8ed]', border: 'border-[#e8dcc0]/50', accent: 'text-[#c9a24b]' },
  Cotton:    { emoji: '🏵️', gradient: 'from-[#fffdf9] to-[#eef1e8]', border: 'border-[#c5d6b8]/40', accent: 'text-[#6b7b4f]' },
  Rice:      { emoji: '🍚', gradient: 'from-[#fffdf9] to-[#fdf2ed]', border: 'border-[#e0c8b0]/40', accent: 'text-[#c97b4a]' },
  Onion:     { emoji: '🧅', gradient: 'from-[#fffdf9] to-[#fdf2f0]', border: 'border-[#e0c0b8]/40', accent: 'text-[#c94a4a]' },
  Maize:     { emoji: '🌽', gradient: 'from-[#fffdf9] to-[#fef8ed]', border: 'border-[#e8dcc0]/50', accent: 'text-[#c9a24b]' },
  Tomato:    { emoji: '🍅', gradient: 'from-[#fffdf9] to-[#fdf2f0]', border: 'border-[#e0c0b8]/40', accent: 'text-[#c94a4a]' },
};

const DEFAULT_META = { 
  emoji: '📦', 
  gradient: 'from-[#fffdf9] to-[#faf7f2]', 
  border: 'border-[#e8e2d6]/50', 
  accent: 'text-[#c9a24b]' 
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
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/95 border shrink-0 shadow-sm" style={{ borderColor: 'var(--border-subtle)' }}>
          <span className="flex items-center justify-center text-base sm:text-xl">{meta.emoji}</span>
        </div>
        <h3 className="font-serif-accent text-lg sm:text-xl font-bold truncate min-w-0 flex-1" style={{ color: 'var(--color-ink)' }}>
          {t(`mandi.commodities.${commodity}`, { defaultValue: commodity })}
        </h3>
      </div>

      {/* Middle: Market Location */}
      <p className="text-xs sm:text-sm font-medium truncate min-w-0 w-full" style={{ color: 'var(--color-muted)' }}>
        {market}
      </p>

      {/* Bottom: Price pushed to bottom */}
      <div className="mt-auto pt-2 sm:pt-3 flex flex-col min-w-0">
        <span className="text-[9px] sm:text-[10px] tracking-widest uppercase" style={{ color: 'var(--color-muted)' }}>
          {t('mandi.bhav')}
        </span>
        <span className={`text-xl sm:text-2xl font-bold ${meta.accent} truncate min-w-0`}>
          {formatINR(modalPrice)} <span className="text-sm font-medium" style={{ color: 'var(--color-muted)' }}>/ {i18n.language === 'hi' ? 'क्विंटल' : t('mandi.quintal', 'Quintal')}</span>
        </span>
      </div>
    </div>
  );
};

export default PriceCard;
