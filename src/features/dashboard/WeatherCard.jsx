/**
 * WeatherCard — Krishi redesign.
 * Keeps orange/amber sunny gradient. Cards have shadow-md rounded-2xl.
 * Amber accents on icons. Advisory uses warm frosted glass.
 */

import React from 'react';
import {
  Sun, Cloud, CloudRain, CloudLightning, CloudSun,
  Droplets, Wind, Eye, AlertCircle, Sprout, MapPin,
} from 'lucide-react';

// ── Weather condition → icon + gradient mapping ────────────────
const WEATHER_CONFIG = {
  sunny: {
    icon: Sun,
    gradient: 'from-amber-400 via-orange-400 to-orange-500',
    iconColor: 'text-amber-200',
  },
  partly_cloudy: {
    icon: CloudSun,
    gradient: 'from-sky-400 via-blue-400 to-blue-500',
    iconColor: 'text-sky-200',
  },
  cloudy: {
    icon: Cloud,
    gradient: 'from-slate-400 via-gray-500 to-slate-600',
    iconColor: 'text-slate-200',
  },
  rain: {
    icon: CloudRain,
    gradient: 'from-blue-500 via-blue-600 to-indigo-600',
    iconColor: 'text-blue-200',
  },
  thunderstorm: {
    icon: CloudLightning,
    gradient: 'from-indigo-600 via-purple-700 to-slate-800',
    iconColor: 'text-purple-200',
  },
};

const MiniWeatherIcon = ({ condition, size = 16 }) => {
  const config = WEATHER_CONFIG[condition] || WEATHER_CONFIG.sunny;
  const IconComponent = config.icon;
  return <IconComponent size={size} />;
};

const WeatherSkeleton = () => (
  <div className="bg-gradient-to-br from-stone-200 to-stone-300 rounded-2xl p-5 animate-pulse shadow-md">
    <div className="flex items-start justify-between mb-4">
      <div>
        <div className="flex items-center gap-1 mb-2">
          <MapPin size={12} className="text-stone-400" />
          <div className="h-4 bg-white/40 rounded w-24" />
        </div>
        <div className="h-10 bg-white/40 rounded w-20 mb-2" />
        <div className="h-3 bg-white/30 rounded w-32" />
      </div>
      <div className="w-16 h-16 bg-white/30 rounded-2xl" />
    </div>
    <div className="h-12 bg-white/20 rounded-xl mb-3" />
    <div className="grid grid-cols-5 gap-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-16 bg-white/20 rounded-xl" />
      ))}
    </div>
  </div>
);

const WeatherError = () => (
  <div className="krishi-card p-5 border border-red-100">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
        <AlertCircle size={20} className="text-red-400" />
      </div>
      <div>
        <p className="font-semibold text-red-700 text-sm">Mausam Data Unavailable</p>
        <p className="text-xs text-red-400">Unable to load weather data. Will retry automatically.</p>
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════
//  WEATHER CARD
// ═══════════════════════════════════════════════════════════════
const WeatherCard = ({ data, isLoading, isError }) => {
  if (isLoading) return <WeatherSkeleton />;
  if (isError || !data) return <WeatherError />;

  const { current, daily, location } = data;
  const today = daily?.[0];
  const config = WEATHER_CONFIG[current.condition] || WEATHER_CONFIG.sunny;
  const WeatherIcon = config.icon;

  return (
    <div
      id="weather-card"
      className={`bg-gradient-to-br ${config.gradient} rounded-2xl p-5 text-white relative overflow-hidden`}
      style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
    >
      {/* Decorative bg icon */}
      <div className="absolute -right-6 -top-6 opacity-10">
        <WeatherIcon size={120} />
      </div>

      {/* Top: Temp + Icon */}
      <div className="flex items-start justify-between mb-3 relative z-10">
        <div>
          <div className="flex items-center gap-1 mb-1">
            <MapPin size={12} className="text-white/80" />
            <p className="text-xs font-semibold uppercase tracking-wider text-white/90">
              {location.city}, {location.state}
            </p>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-black tracking-tighter leading-none">
              {current.temperature_c}°
            </span>
            <span className="text-lg font-medium text-white/60 ml-1">C</span>
          </div>
          <p className="text-sm font-medium text-white/80 mt-1">{current.condition_text}</p>
          <p className="text-xs text-white/50 mt-0.5">Feels like {current.feels_like_c}°C</p>
        </div>
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)' }}
        >
          <WeatherIcon size={36} className="text-white drop-shadow-lg" />
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-5 mb-3 relative z-10">
        <div className="flex items-center gap-1.5 text-xs text-white/75">
          <Droplets size={12} className="text-amber-200" />
          <span>{current.humidity_pct}%</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-white/75">
          <Wind size={12} className="text-amber-200" />
          <span>{current.wind_speed_kmh} km/h</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-white/75">
          <Eye size={12} className="text-amber-200" />
          <span>{current.visibility_km} km</span>
        </div>
      </div>

      {/* Advisory */}
      {today?.advisory && (
        <div
          className="rounded-xl p-3 mb-3 relative z-10"
          style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
        >
          <div className="flex items-start gap-2">
            <Sprout size={14} className="text-amber-200 mt-0.5 shrink-0" />
            <p className="text-xs font-medium text-white/90 leading-relaxed">
              {today.advisory}
            </p>
          </div>
        </div>
      )}

      {/* 5-Day Forecast Strip */}
      <div className="grid grid-cols-5 gap-1.5 relative z-10">
        {daily?.slice(1, 6).map((day) => (
          <div
            key={day.date}
            className="rounded-xl p-2 text-center"
            style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(4px)' }}
          >
            <p className="text-[10px] font-semibold text-white/60 uppercase">
              {day.day_name.slice(0, 3)}
            </p>
            <div className="flex justify-center my-1">
              <MiniWeatherIcon condition={day.condition} size={16} />
            </div>
            <p className="text-[11px] font-bold">{day.temp_max}°</p>
            <p className="text-[10px] text-white/50">{day.temp_min}°</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherCard;
