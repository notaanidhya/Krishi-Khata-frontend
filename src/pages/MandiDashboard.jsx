import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, MapPin, Search, LineChart as LineChartIcon, Sprout, Flame, Database } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useActiveFarm } from '../context/ActiveFarmContext';
import { useCrops } from '../hooks/useCrop';
import { getMandiHistory, getMandiMetadata, getMandiPrices } from '../api/mandi';
import Combobox from '../components/ui/Combobox';
import { PriceCard } from '../features/dashboard/MandiTicker';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft } from 'lucide-react';
import PageShell from '../components/layout/PageShell';
import { staggerContainer, fadeUp } from '../components/motion/motionPresets';

// ── Static regional fallback commodities ────────────────────────────
const MARKET_FAVORITES = ['Wheat', 'Soybean', 'Mustard', 'Chana'];

const formatINR = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

const MandiDashboard = () => {
  const { t, i18n } = useTranslation();
  const { activeFarm } = useActiveFarm();
  const farmId = activeFarm?.id;
  
  const { data: crops } = useCrops(farmId);
  
  // Default values based on active farm
  const defaultCommodity = useMemo(() => {
    if (crops && crops.length > 0) {
      const active = crops.find(c => c.status === 'ACTIVE');
      if (active) return active.crop_name;
      return crops[0].crop_name;
    }
    return 'Wheat';
  }, [crops]);

  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedCommodity, setSelectedCommodity] = useState(defaultCommodity);

  // Sync state if farm changes
  useEffect(() => {
    // Start in overview mode by default
    setSelectedDistrict("");
    if (defaultCommodity) setSelectedCommodity(defaultCommodity);
  }, [activeFarm, defaultCommodity]);

  // Fetch metadata for dropdowns
  const { data: metadata } = useQuery({
    queryKey: ['mandiMetadata'],
    queryFn: getMandiMetadata,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24,    // Prevent garbage collection before staleTime
  });
  const commodityOptions = metadata?.commodities || [];
  const districtOptions = metadata?.districts || [];

  // ── Quick-Select Crop Hub: derive badge lists ─────────────────────
  const myCropNames = useMemo(() => {
    if (!crops || crops.length === 0) return [];
    // Deduplicate crop names preserving order, active crops first
    const seen = new Set();
    const sorted = [...crops].sort((a, b) => {
      if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1;
      if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') return 1;
      return 0;
    });
    return sorted.reduce((acc, c) => {
      const name = c.crop_name;
      if (name && !seen.has(name.toLowerCase())) {
        seen.add(name.toLowerCase());
        acc.push(name);
      }
      return acc;
    }, []);
  }, [crops]);

  // Fallback list minus anything already in the user's crops
  const filteredFavorites = useMemo(() => {
    const ownSet = new Set(myCropNames.map(n => n.toLowerCase()));
    return MARKET_FAVORITES.filter(f => !ownSet.has(f.toLowerCase()));
  }, [myCropNames]);

  // ── Chip click handler ────────────────────────────────────────────
  const handleChipClick = useCallback((commodity) => {
    setSelectedCommodity(commodity);
    setSelectedDistrict(""); // Return to Overview
  }, []);

  const { data: overviewResponse, isLoading: overviewLoading } = useQuery({
    queryKey: ['mandiOverview', selectedCommodity],
    queryFn: () => getMandiPrices({ commodity: selectedCommodity, overview: true }),
    enabled: !!selectedCommodity && !selectedDistrict,
    staleTime: 1000 * 60 * 5,
  });
  const overviewData = overviewResponse?.prices || [];

  const { data: historyResponse, isLoading, isFetching } = useQuery({
    queryKey: ['mandiHistory', selectedCommodity, selectedDistrict],
    queryFn: () => getMandiHistory({ commodity: selectedCommodity, district: selectedDistrict }),
    enabled: !!selectedCommodity && !!selectedDistrict,
    // JIT backfill may take 2-4s on first load — extend stale time
    staleTime: 1000 * 60 * 5,
  });

  // Handle new response shape: { records: [...], backfilled: bool }
  const historyData = historyResponse?.records ?? historyResponse ?? [];
  const historyRecords = historyData?.records || historyData || [];
  
  // Calculations for KPI Cards
  const todayRecord = historyRecords.length > 0 ? historyRecords[historyRecords.length - 1] : null;
  const yesterdayRecord = historyRecords.length > 1 ? historyRecords[historyRecords.length - 2] : null;
  
  const todayPrice = todayRecord ? todayRecord.price : 0;
  const yesterdayPrice = yesterdayRecord ? yesterdayRecord.price : 0;
  
  let trendPct = 0;
  if (yesterdayPrice > 0) {
    trendPct = ((todayPrice - yesterdayPrice) / yesterdayPrice) * 100;
  }
  const isPositiveTrend = trendPct >= 0;

  // Render Empty State if less than 2 days of history
  const renderChartOrEmptyState = () => {
    if (isLoading || isFetching) {
      return (
        <div className="h-72 flex flex-col items-center justify-center rounded-3xl krishi-card gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--color-forest-muted)', borderTopColor: 'transparent' }}></div>
            <Database size={18} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ color: 'var(--color-forest)' }} />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold" style={{ color: 'var(--color-forest)' }}>
              {t('mandi.fetchingData')}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
              {t('mandi.fetchingSubtext')}
            </p>
          </div>
        </div>
      );
    }
    
    if (historyData.length < 2) {
      return (
        <div className="h-72 flex flex-col items-center justify-center rounded-3xl krishi-card p-6 text-center">
          <LineChartIcon size={48} className="mb-4" style={{ color: 'var(--color-forest-muted)', opacity: 0.3 }} />
          <h3 className="font-serif-accent text-xl font-bold mb-2" style={{ color: 'var(--color-forest)' }}>
            {t('mandi.gatheringTitle')}
          </h3>
          <p className="text-sm max-w-sm" style={{ color: 'var(--color-muted)' }}>
            {t('mandi.gatheringText')}
          </p>
        </div>
      );
    }
    
    return (
      <div className="h-72 rounded-3xl krishi-card p-4 sm:p-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6b7b4f" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6b7b4f" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8e2d6" />
            <XAxis 
              dataKey="arrival_date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#a8a29e', fontSize: 12 }} 
              tickFormatter={(val) => val.slice(5)} // Show MM-DD
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#a8a29e', fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 6px 24px -6px rgba(61,58,36,0.18)', background: '#fffdf9' }}
              formatter={(value) => [formatINR(value), t('mandi.price')]}
              labelStyle={{ color: 'var(--color-forest)', fontWeight: 'bold', marginBottom: '4px' }}
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="#5c7a55" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorPrice)" 
              activeDot={{ r: 6, fill: '#3d5a3a', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <PageShell ambient="mandi">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6"
      >
      
      {/* Header & Filters */}
      <motion.div variants={fadeUp} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif-accent font-bold flex items-center gap-3" style={{ color: 'var(--color-forest)' }}>
            <TrendingUp size={32} style={{ color: 'var(--color-harvest)' }} />
            {t('mandi.title')}
          </h1>
          <p className="text-sm sm:text-base mt-1" style={{ color: 'var(--color-muted)' }}>
            {t('mandi.subtitle')}
          </p>
        </div>
        
        <div className="flex gap-3 p-2 rounded-2xl krishi-card">
          <div className="flex items-center gap-2 bg-stone-50 rounded-xl px-3 py-2 border border-stone-200/50">
            <Search className="text-stone-400" size={18} />
            <Combobox 
              options={commodityOptions}
              value={selectedCommodity}
              onChange={(val) => {
                setSelectedCommodity(val);
                setSelectedDistrict("");
              }}
              className="w-28 sm:w-36"
              placeholder={t('mandi.commodity')}
              getDisplayValue={(val) => t(`mandi.commodities.${val}`, { defaultValue: val })}
            />
          </div>
          <div className="flex items-center gap-2 bg-stone-50 rounded-xl px-3 py-2 border border-stone-200/50">
            <MapPin className="text-stone-400" size={18} />
            <Combobox 
              options={districtOptions}
              value={selectedDistrict}
              onChange={setSelectedDistrict}
              className="w-28 sm:w-36"
              placeholder={t('mandi.district')}
              getDisplayValue={(val) => i18n.language === 'hi' ? (metadata?.districts_hi?.[val] || val) : val}
            />
          </div>
        </div>
      </motion.div>

      {/* ── Quick-Select Crop Hub ──────────────────────────────────── */}
      {(myCropNames.length > 0 || filteredFavorites.length > 0) && (
        <motion.div variants={fadeUp} className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
            {t('mandi.quickSelect')}
          </p>
          <div
            className="flex overflow-x-auto gap-2 pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* My Crops badges */}
            {myCropNames.map((name) => {
              const isActive = selectedCommodity.toLowerCase() === name.toLowerCase();
              return (
                <button
                  key={`my-${name}`}
                  id={`crop-chip-${name.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => handleChipClick(name)}
                  style={isActive
                    ? { background: 'var(--color-forest-muted)', borderColor: 'var(--color-forest-muted)', color: '#fff', boxShadow: '0 4px 12px -2px rgba(107,123,79,0.4)' }
                    : { background: 'var(--color-forest-light)', color: 'var(--color-forest)', borderColor: 'rgba(107,123,79,0.2)' }
                  }
                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 cursor-pointer border select-none shrink-0 hover:shadow-sm"
                >
                  <Sprout size={14} />
                  {t(`mandi.commodities.${name}`, { defaultValue: name })}
                </button>
              );
            })}

            {/* Divider between sections (only if both exist) */}
            {myCropNames.length > 0 && filteredFavorites.length > 0 && (
              <div className="shrink-0 w-px bg-stone-200 my-1" />
            )}

            {/* Market Favorites badges */}
            {filteredFavorites.map((name) => {
              const isActive = selectedCommodity.toLowerCase() === name.toLowerCase();
              return (
                <button
                  key={`fav-${name}`}
                  id={`fav-chip-${name.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => handleChipClick(name)}
                  style={isActive
                    ? { background: 'var(--color-ink)', borderColor: 'var(--color-ink)', color: '#fff' }
                    : { background: 'var(--color-soil-dark)', color: 'var(--color-ink)', borderColor: 'var(--border-subtle)' }
                  }
                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 cursor-pointer border select-none shrink-0 hover:shadow-sm"
                >
                  <Flame size={14} style={{ color: isActive ? 'var(--color-harvest)' : 'var(--color-rust)', opacity: isActive ? 1 : 0.7 }} />
                  {t(`mandi.commodities.${name}`, { defaultValue: name })}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Overview or Graph View */}
      {!selectedDistrict ? (
        <motion.div variants={fadeUp} className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-6 rounded-full" style={{ background: 'var(--color-harvest)' }}></div>
            <h2 className="text-lg font-bold font-serif-accent" style={{ color: 'var(--color-forest)' }}>
              {t('mandi.marketOverview', 'Market Overview')}
            </h2>
          </div>
          {overviewLoading ? (
            <div className="h-48 flex items-center justify-center rounded-3xl krishi-card">
              <div className="w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--color-forest-muted)', borderTopColor: 'transparent' }}></div>
            </div>
          ) : overviewData.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {overviewData.map((item, i) => (
                <PriceCard 
                  key={`${item.district}-${item.market}-${i}`} 
                  item={item} 
                  onClick={() => setSelectedDistrict(item.district || item.District)}
                />
              ))}
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center rounded-3xl krishi-card" style={{ color: 'var(--color-muted)' }}>
              <Database size={32} className="mb-2 opacity-50" />
              <p>{t('mandi.noOverviewData', 'No recent markets found for this crop.')}</p>
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div variants={fadeUp} className="space-y-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSelectedDistrict("")}
              className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-500"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-bold font-serif-accent" style={{ color: 'var(--color-forest)' }}>
              {i18n.language === 'hi' ? (metadata?.districts_hi?.[selectedDistrict] || selectedDistrict) : selectedDistrict} Market Details
            </h2>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-3xl p-5 krishi-card flex flex-col justify-center transition-transform hover:scale-[1.02]">
              <span className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--color-muted)' }}>{t('mandi.todayPrice')}</span>
              <span className="text-3xl font-bold" style={{ color: 'var(--color-forest)' }}>
                {todayPrice > 0 ? formatINR(todayPrice) : '---'}
              </span>
            </div>
            
            <div className="rounded-3xl p-5 krishi-card flex flex-col justify-center transition-transform hover:scale-[1.02]">
              <span className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--color-muted)' }}>{t('mandi.yesterdayPrice')}</span>
              <span className="text-2xl font-bold text-stone-600">
                {yesterdayPrice > 0 ? formatINR(yesterdayPrice) : '---'}
              </span>
            </div>

            <div
              className="rounded-3xl p-5 border flex flex-col justify-center transition-transform hover:scale-[1.02]"
              style={{
                background: isPositiveTrend ? 'var(--color-forest-light)' : 'var(--color-danger-soft)',
                borderColor: isPositiveTrend ? 'rgba(107,123,79,0.2)' : 'rgba(184,92,74,0.2)',
              }}
            >
              <span className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: isPositiveTrend ? 'var(--color-forest-muted)' : 'var(--color-danger)' }}>
                {t('mandi.trend24h')}
              </span>
              <span className="text-2xl font-bold" style={{ color: isPositiveTrend ? 'var(--color-forest)' : 'var(--color-danger)' }}>
                {isPositiveTrend ? '+' : ''}{trendPct.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Main Chart Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-6 rounded-full" style={{ background: 'var(--color-forest-muted)' }}></div>
              <h2 className="text-lg font-bold font-serif-accent" style={{ color: 'var(--color-forest)' }}>{t('mandi.chartTitle')}</h2>
            </div>
            {renderChartOrEmptyState()}
          </div>
        </motion.div>
      )}

      </motion.div>
    </PageShell>
  );
};

export default MandiDashboard;
