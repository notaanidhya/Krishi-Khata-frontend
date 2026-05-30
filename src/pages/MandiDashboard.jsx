import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, MapPin, Search, LineChart as LineChartIcon } from 'lucide-react';
import { useActiveFarm } from '../context/ActiveFarmContext';
import { useCrops } from '../hooks/useCrop';
import { getMandiHistory } from '../api/mandi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const formatINR = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

const MandiDashboard = () => {
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

  const { data: history, isLoading, isError } = useQuery({
    queryKey: ['mandiHistory', selectedCommodity, selectedDistrict],
    queryFn: () => getMandiHistory({ commodity: selectedCommodity, district: selectedDistrict }),
    enabled: !!selectedCommodity && !!selectedDistrict,
  });

  const historyData = history || [];
  
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
    if (isLoading) {
      return (
        <div className="h-64 flex items-center justify-center bg-white rounded-3xl shadow-sm border border-stone-100/50">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }
    
    if (historyData.length < 2) {
      return (
        <div className="h-72 flex flex-col items-center justify-center bg-gradient-to-br from-stone-50 to-white rounded-3xl shadow-sm border border-stone-100/50 p-6 text-center">
          <LineChartIcon size={48} className="text-emerald-800/20 mb-4" />
          <h3 className="font-serif-accent text-xl font-bold text-emerald-950 mb-2">
            Gathering Market Data
          </h3>
          <p className="text-stone-500 text-sm max-w-sm">
            Historical data gathering initiated. Check back tomorrow to see price trends for this market.
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
              formatter={(value) => [formatINR(value), 'Price']}
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
            Market Insights
          </h1>
          <p className="text-stone-500 text-sm sm:text-base mt-1">
            Track daily mandi bhav and historical price trends.
          </p>
        </div>
        
        <div className="flex gap-3 bg-white p-2 rounded-2xl shadow-sm border border-stone-100/50">
          <div className="flex items-center gap-2 bg-stone-50 rounded-xl px-3 py-2 border border-stone-200/50">
            <Search className="text-stone-400" size={18} />
            <input 
              type="text" 
              value={selectedCommodity}
              onChange={(e) => setSelectedCommodity(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-medium text-emerald-950 w-24 sm:w-32"
              placeholder="Commodity"
            />
          </div>
          <div className="flex items-center gap-2 bg-stone-50 rounded-xl px-3 py-2 border border-stone-200/50">
            <MapPin className="text-stone-400" size={18} />
            <input 
              type="text" 
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-medium text-emerald-950 w-24 sm:w-32"
              placeholder="District"
            />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100/50 flex flex-col justify-center transition-transform hover:scale-[1.02]">
          <span className="text-stone-400 text-xs font-bold uppercase tracking-wider mb-1">Today's Price</span>
          <span className="text-3xl font-bold text-emerald-950">
            {todayPrice > 0 ? formatINR(todayPrice) : '---'}
          </span>
        </div>
        
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100/50 flex flex-col justify-center transition-transform hover:scale-[1.02]">
          <span className="text-stone-400 text-xs font-bold uppercase tracking-wider mb-1">Yesterday's Price</span>
          <span className="text-2xl font-bold text-stone-600">
            {yesterdayPrice > 0 ? formatINR(yesterdayPrice) : '---'}
          </span>
        </div>

        <div className={`rounded-3xl p-5 shadow-sm border flex flex-col justify-center transition-transform hover:scale-[1.02] ${
          isPositiveTrend ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'
        }`}>
          <span className={`text-xs font-bold uppercase tracking-wider mb-1 ${
            isPositiveTrend ? 'text-emerald-600/80' : 'text-red-600/80'
          }`}>Trend (24h)</span>
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
          <h2 className="text-lg font-bold text-emerald-950 font-serif-accent">30-Day Price Trend</h2>
        </div>
        {renderChartOrEmptyState()}
      </div>

    </div>
  );
};

export default MandiDashboard;
