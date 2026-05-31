import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, MapPin, Search, LineChart as LineChartIcon, Sprout, Flame, Database } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useActiveFarm } from '../context/ActiveFarmContext';
import { useCrops } from '../hooks/useCrop';
import { getMandiHistory, getMandiMetadata } from '../api/mandi';
import Combobox from '../components/ui/Combobox';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// ── Static regional fallback commodities ────────────────────────────
const MARKET_FAVORITES = ['Wheat', 'Soybean', 'Mustard', 'Chana'];

const formatINR = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

const MandiDashboard = () => {
  const { t } = useTranslation();
  const { activeFarm } = useActiveFarm();
  const farmId = activeFarm?.id;
  
  const { data: crops } = useCrops(farmId);
  
  // Default values based on active farm
  const defaultDistrict = activeFarm?.district || 'Indore';
  const defaultCommodity = useMemo(() => {
    if (crops && crops.length > 0) {
      const active = crops.find(c => c.status === 'ACTIVE');
      if (active) return active.crop_name;
      return crops[0].crop_name;
    }
    return 'Wheat';
  }, [crops]);

  const [selectedDistrict, setSelectedDistrict] = useState(defaultDistrict);
  const [selectedCommodity, setSelectedCommodity] = useState(defaultCommodity);

  // Sync state if farm changes
  useEffect(() => {
    if (activeFarm?.district) setSelectedDistrict(activeFarm.district);
    if (defaultCommodity) setSelectedCommodity(defaultCommodity);
  }, [activeFarm, defaultCommodity]);

  // Fetch metadata for dropdowns
  const { data: metadata } = useQuery({
    queryKey: ['mandiMetadata'],
    queryFn: getMandiMetadata,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
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
    // TanStack Query will auto-refetch because queryKey includes selectedCommodity
  }, []);

  const { data: historyResponse, isLoading, isFetching, isError } = useQuery({
    queryKey: ['mandiHistory', selectedCommodity, selectedDistrict],
    queryFn: () => getMandiHistory({ commodity: selectedCommodity, district: selectedDistrict }),
    enabled: !!selectedCommodity && !!selectedDistrict,
    // JIT backfill may take 2-4s on first load — extend stale time
    staleTime: 1000 * 60 * 5,
  });

  // Handle new response shape: { records: [...], backfilled: bool }
  const historyData = historyResponse?.records ?? historyResponse ?? [];
  const wasBackfilled = historyResponse?.backfilled ?? false;
  
  // Calculations for KPI Cards
  const todayRecord = historyData.length > 0 ? historyData[historyData.length - 1] : null;
  const yesterdayRecord = historyData.length > 1 ? historyData[historyData.length - 2] : null;
  
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
        <div className="h-72 flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50/50 to-white rounded-3xl shadow-sm border border-stone-100/50 gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <Database size={18} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-600" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-emerald-900">
              {t('mandi.fetchingData')}
            </p>
            <p className="text-xs text-stone-400 mt-1">
              {t('mandi.fetchingSubtext')}
            </p>
          </div>
        </div>
      );
    }
    
    if (historyData.length < 2) {
      return (
        <div className="h-72 flex flex-col items-center justify-center bg-gradient-to-br from-stone-50 to-white rounded-3xl shadow-sm border border-stone-100/50 p-6 text-center">
          <LineChartIcon size={48} className="text-emerald-800/20 mb-4" />
          <h3 className="font-serif-accent text-xl font-bold text-emerald-950 mb-2">
            {t('mandi.gatheringTitle')}
          </h3>
          <p className="text-stone-500 text-sm max-w-sm">
            {t('mandi.gatheringText')}
          </p>
        </div>
      );
    }
    
    return (
      <div className="h-72 bg-white rounded-3xl shadow-sm border border-stone-100/50 p-4 sm:p-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
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
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
              formatter={(value) => [formatINR(value), t('mandi.price')]}
              labelStyle={{ color: '#052e16', fontWeight: 'bold', marginBottom: '4px' }}
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="#10b981" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorPrice)" 
              activeDot={{ r: 6, fill: '#052e16', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in space-y-6">
      
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif-accent font-bold text-emerald-950 flex items-center gap-3">
            <TrendingUp className="text-amber-500" size={32} />
            {t('mandi.title')}
          </h1>
          <p className="text-stone-500 text-sm sm:text-base mt-1">
            {t('mandi.subtitle')}
          </p>
        </div>
        
        <div className="flex gap-3 bg-white p-2 rounded-2xl shadow-sm border border-stone-100/50">
          <div className="flex items-center gap-2 bg-stone-50 rounded-xl px-3 py-2 border border-stone-200/50">
            <Search className="text-stone-400" size={18} />
            <Combobox 
              options={commodityOptions}
              value={selectedCommodity}
              onChange={setSelectedCommodity}
              className="w-28 sm:w-36"
              placeholder={t('mandi.commodity')}
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
            />
          </div>
        </div>
      </div>

      {/* ── Quick-Select Crop Hub ──────────────────────────────────── */}
      {(myCropNames.length > 0 || filteredFavorites.length > 0) && (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-stone-400">
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
                  className={`
                    inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2
                    text-sm font-semibold transition-all duration-200 cursor-pointer
                    border select-none shrink-0
                    ${isActive
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200 scale-105'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 hover:shadow-sm'
                    }
                  `}
                >
                  <Sprout size={14} className={isActive ? 'text-emerald-200' : 'text-emerald-500'} />
                  {name}
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
                  className={`
                    inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2
                    text-sm font-semibold transition-all duration-200 cursor-pointer
                    border select-none shrink-0
                    ${isActive
                      ? 'bg-stone-700 text-white border-stone-700 shadow-md shadow-stone-200 scale-105'
                      : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100 hover:border-stone-300 hover:shadow-sm'
                    }
                  `}
                >
                  <Flame size={14} className={isActive ? 'text-amber-300' : 'text-amber-500/60'} />
                  {name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100/50 flex flex-col justify-center transition-transform hover:scale-[1.02]">
          <span className="text-stone-400 text-xs font-bold uppercase tracking-wider mb-1">{t('mandi.todayPrice')}</span>
          <span className="text-3xl font-bold text-emerald-950">
            {todayPrice > 0 ? formatINR(todayPrice) : '---'}
          </span>
        </div>
        
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100/50 flex flex-col justify-center transition-transform hover:scale-[1.02]">
          <span className="text-stone-400 text-xs font-bold uppercase tracking-wider mb-1">{t('mandi.yesterdayPrice')}</span>
          <span className="text-2xl font-bold text-stone-600">
            {yesterdayPrice > 0 ? formatINR(yesterdayPrice) : '---'}
          </span>
        </div>

        <div className={`rounded-3xl p-5 shadow-sm border flex flex-col justify-center transition-transform hover:scale-[1.02] ${
          isPositiveTrend ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'
        }`}>
          <span className={`text-xs font-bold uppercase tracking-wider mb-1 ${
            isPositiveTrend ? 'text-emerald-600/80' : 'text-red-600/80'
          }`}>{t('mandi.trend24h')}</span>
          <span className={`text-2xl font-bold ${
            isPositiveTrend ? 'text-emerald-700' : 'text-red-700'
          }`}>
            {isPositiveTrend ? '+' : ''}{trendPct.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Main Chart Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
          <h2 className="text-lg font-bold text-emerald-950 font-serif-accent">{t('mandi.chartTitle')}</h2>
        </div>
        {renderChartOrEmptyState()}
      </div>

    </div>
  );
};

export default MandiDashboard;
