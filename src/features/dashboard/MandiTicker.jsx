/**
 * MandiTicker — Redesigned premium Bento Box container.
 * 
 * Uses spacious horizontal row-based price tiles with dedicated 
 * emoji containers, Merriweather serif accents, and smart spacing 
 * to completely eliminate visual clutter and truncation.
 * 
 * Refined Earth theme — warm ivory cards, olive accents, harvest gold.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Store } from 'lucide-react';

import PriceCard from '../../components/ui/PriceCard';

// ── Loading Skeleton ───────────────────────────────────────────
const MandiSkeleton = () => {
  const { t } = useTranslation();
  return (
  <div className="krishi-card rounded-3xl shadow-md p-6 flex flex-col items-center justify-center min-h-[220px]">
    <div className="w-10 h-10 rounded-full animate-pulse mb-3" style={{ background: 'var(--color-harvest)' }} />
    <p className="text-sm" style={{ color: 'var(--color-muted)' }}>{t('mandi.loadingPrices')}</p>
  </div>
  );
};

// ── Empty State ────────────────────────────────────────────────
const MandiEmpty = () => {
  const { t } = useTranslation();
  return (
  <div className="krishi-card rounded-3xl shadow-md p-6 flex flex-col items-center justify-center min-h-[220px]">
    <Store size={36} className="mb-3 opacity-40" style={{ color: 'var(--color-ink)' }} />
    <p className="font-serif text-center text-lg max-w-sm" style={{ color: 'var(--color-ink)' }}>
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
    <div className="krishi-card rounded-3xl shadow-md p-5 sm:p-6">
      {/* Modern Premium Header */}
      <div className="flex items-center gap-2.5 mb-5">
        <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ background: 'var(--color-harvest)', boxShadow: '0 0 8px rgba(201,162,75,0.4)' }} />
        <h2 className="font-serif-accent text-xl sm:text-2xl font-bold" style={{ color: 'var(--color-ink)' }}>
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
