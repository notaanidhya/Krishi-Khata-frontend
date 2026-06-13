/**
 * WeatherPage — Advanced Agriculture Weather Dashboard.
 *
 * Sections:
 *   1. Current conditions strip
 *   2. AI Weather Impact Summary (hero card)
 *   3. Safe Spraying Window Timeline
 *   4. Soil & Water Retention Metrics
 *   5. 7-Day Agricultural Forecast
 *
 * Warm Krishi design system: forest green, amber accents, clay backgrounds.
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CloudSun, Sparkles, Droplets, Sprout,
  Wind, Thermometer, CloudOff,
  CalendarDays,
} from 'lucide-react';
import { useWeatherDashboard, useWeatherAdvisory } from '../hooks/useWeather';
import { useActiveFarm } from '../context/ActiveFarmContext';
import { useLocation } from '../hooks/useLocation';

/* ── Weather condition → emoji helper ──────────────────────── */
const getWeatherEmoji = (condition) => {
  const map = {
    sunny: '☀️', partly_cloudy: '⛅', cloudy: '☁️',
    rain: '🌧️', drizzle: '🌦️', thunderstorm: '⛈️',
    fog: '🌫️', snow: '❄️',
  };
  return map[condition] || '🌤️';
};

/* ── Spraying status → styles helper ───────────────────────── */
const getSprayStyle = (status) => {
  switch (status) {
    case 'GREEN':
      return {
        bg: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
        border: '1.5px solid #6ee7b7',
        badgeBg: '#059669', badgeText: '#fff',
        label: 'weather.optimal', textColor: '#065f46',
      };
    case 'YELLOW':
      return {
        bg: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
        border: '1.5px solid #fcd34d',
        badgeBg: '#d97706', badgeText: '#fff',
        label: 'weather.caution', textColor: '#92400e',
      };
    case 'RED':
      return {
        bg: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
        border: '1.5px solid #fca5a5',
        badgeBg: '#dc2626', badgeText: '#fff',
        label: 'weather.avoid', textColor: '#991b1b',
      };
    default:
      return {
        bg: '#f5f5f4', border: '1.5px solid #e7e5e4',
        badgeBg: '#78716c', badgeText: '#fff',
        label: '—', textColor: '#44403c',
      };
  }
};

/* ── Moisture status → color helper ────────────────────────── */
const getMoistureColor = (status) => {
  if (status?.includes('Dry')) return { bg: '#fef2f2', text: '#dc2626', border: '#fca5a5' };
  if (status === 'Moderate') return { bg: '#fffbeb', text: '#d97706', border: '#fcd34d' };
  return { bg: '#ecfdf5', text: '#059669', border: '#6ee7b7' };
};

/* ── Rain probability → color helper ───────────────────────── */
const getRainColor = (pct) => {
  if (pct > 60) return { bg: '#fef2f2', text: '#dc2626' };
  if (pct > 30) return { bg: '#fffbeb', text: '#d97706' };
  return { bg: '#ecfdf5', text: '#059669' };
};


const WeatherPage = () => {
  const { t, i18n } = useTranslation();
  const { activeFarm } = useActiveFarm();
  const [liveCoords, setLiveCoords] = useState(null);

  // Fetch precise live location on mount
  useEffect(() => {
    const cached = localStorage.getItem('cached_location');
    if (cached) {
      try {
        setLiveCoords(JSON.parse(cached));
        return;
      } catch (e) {}
    }

    if ('geolocation' in navigator) {
      const askLocation = () => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const newCoords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
            localStorage.setItem('cached_location', JSON.stringify(newCoords));
            localStorage.setItem('location_asked', 'true');
            setLiveCoords(newCoords);
          },
          (err) => {
            localStorage.setItem('location_asked', 'true');
            console.warn('Live location failed, falling back to farm coords', err);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      };

      if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
          if (result.state === 'granted') {
            askLocation();
          } else if (result.state === 'prompt') {
            if (!localStorage.getItem('location_asked')) {
              askLocation();
            }
          }
        });
      } else if (!localStorage.getItem('location_asked')) {
        askLocation();
      }
    }
  }, []);

  const lat = liveCoords?.lat || activeFarm?.latitude;
  const lon = liveCoords?.lon || activeFarm?.longitude;

  const { data, isLoading, isError } = useWeatherDashboard(
    lat,
    lon,
    activeFarm?.district,
    activeFarm?.state
  );

  const { data: advisoryData, isLoading: advisoryLoading } = useWeatherAdvisory(
    lat,
    lon,
    activeFarm?.district,
    activeFarm?.state
  );

  /* ── Loading state ───────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="px-4 pt-4 pb-24 max-w-lg mx-auto space-y-4 animate-page-enter">
        {/* Header skeleton */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl skeleton-shimmer" />
          <div className="space-y-2">
            <div className="h-5 w-32 rounded-lg skeleton-shimmer" />
            <div className="h-3 w-20 rounded-md skeleton-shimmer" />
          </div>
        </div>
        {/* Current conditions skeleton */}
        <div className="rounded-2xl p-4 skeleton-shimmer" style={{ height: '88px' }} />
        {/* AI summary skeleton */}
        <div className="rounded-2xl skeleton-shimmer" style={{ height: '120px' }} />
        {/* Spraying windows skeleton */}
        <div className="rounded-2xl skeleton-shimmer" style={{ height: '180px' }} />
        {/* Soil metrics skeleton */}
        <div className="rounded-2xl skeleton-shimmer" style={{ height: '140px' }} />
        {/* Forecast skeleton */}
        <div className="rounded-2xl skeleton-shimmer" style={{ height: '300px' }} />
      </div>
    );
  }

  /* ── Error state ─────────────────────────────────────────── */
  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mb-4">
          <CloudOff size={28} className="text-stone-300" />
        </div>
        <p className="text-stone-500 text-sm font-bold mb-1">{t('weather.errorTitle')}</p>
        <p className="text-stone-400 text-xs">{t('weather.errorText')}</p>
      </div>
    );
  }

  const { location, current, spraying_windows, soil_insights, forecast_7day } = data;
  const ai_summary = advisoryData?.ai_summary;

  return (
    <div id="weather-page" className="px-4 pt-4 pb-24 max-w-lg mx-auto space-y-4 animate-page-enter">

      {/* ═══════════════════════════════════════════════════════
          1. PAGE HEADER
      ═══════════════════════════════════════════════════════ */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #166534, #14532d)', boxShadow: '0 4px 16px rgba(22,101,52,0.3)' }}
        >
          <CloudSun size={20} className="text-white" />
        </div>
        <div>
          <h2
            className="text-lg font-bold font-serif-accent leading-tight"
            style={{ color: 'var(--color-forest)' }}
          >
            {t('weather.title')}
          </h2>
          <p className="text-xs text-stone-400 font-medium">
            {location?.city || 'Local'}, {location?.state || ''}
          </p>
        </div>
      </div>


      {/* ═══════════════════════════════════════════════════════
          2. CURRENT CONDITIONS STRIP
      ═══════════════════════════════════════════════════════ */}
      <div
        className="rounded-2xl px-4 py-3 flex items-center justify-between"
        style={{
          background: 'rgba(255,253,249,0.9)',
          border: '1.5px solid #e5e0d8',
          boxShadow: '0 2px 12px rgba(5,46,22,0.06)',
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-4xl leading-none">{getWeatherEmoji(current?.condition)}</span>
          <div>
            <p className="text-2xl font-black" style={{ color: 'var(--color-forest)' }}>
              {current?.temperature_c ?? '--'}°
            </p>
            <p className="text-xs text-stone-500 font-semibold">{current?.condition_text || 'Loading...'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="px-2.5 py-1.5 rounded-lg text-center" style={{ background: '#f0f9ff', border: '1px solid #bae6fd' }}>
            <p className="text-[9px] text-sky-400 font-bold uppercase tracking-wider">{t('weather.humidity')}</p>
            <p className="text-xs font-extrabold text-sky-600">{current?.humidity_pct ?? '--'}%</p>
          </div>
          <div className="px-2.5 py-1.5 rounded-lg text-center" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">{t('weather.wind')}</p>
            <p className="text-xs font-extrabold text-emerald-600">{current?.wind_speed_kmh ?? '--'} km/h</p>
          </div>
        </div>
      </div>


      {/* ═══════════════════════════════════════════════════════
          3. AI WEATHER IMPACT SUMMARY — HERO CARD
      ═══════════════════════════════════════════════════════ */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
          boxShadow: '0 8px 32px rgba(15,23,42,0.35)',
        }}
      >
        <div className="px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="px-2 py-1 rounded-lg flex items-center gap-1.5"
              style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)' }}
            >
              <Sparkles size={11} className="text-amber-400" />
              <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">{t('weather.aiAdvisory')}</span>
            </div>
          </div>
          {advisoryLoading ? (
            <div className="space-y-2.5 animate-pulse">
              <div className="h-3.5 bg-white/10 rounded-lg w-full" />
              <div className="h-3.5 bg-white/10 rounded-lg w-5/6" />
              <div className="h-3.5 bg-white/10 rounded-lg w-4/6" />
              <p className="text-[10px] text-white/30 font-medium mt-1 flex items-center gap-1.5">
                <Sparkles size={9} className="text-amber-400/50 animate-spin" style={{ animationDuration: '3s' }} />
                {t('weather.analysisLoading')}
              </p>
            </div>
          ) : (
            <p className="text-sm text-white/90 leading-relaxed font-medium">
              {ai_summary || t('weather.analysisLoading')}
            </p>
          )}
        </div>
      </div>


      {/* ═══════════════════════════════════════════════════════
          4. SAFE SPRAYING WINDOW TIMELINE
      ═══════════════════════════════════════════════════════ */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: '1.5px solid #e5e0d8', boxShadow: '0 2px 12px rgba(5,46,22,0.06)' }}
      >
        <div className="px-4 pt-4 pb-2 flex items-center gap-2" style={{ background: '#fffdf5' }}>
          <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center">
            <Droplets size={16} className="text-emerald-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold font-serif-accent" style={{ color: 'var(--color-forest)' }}>
              {t('weather.sprayingTitle')}
            </h4>
            <p className="text-[10px] text-stone-400 font-medium">{t('weather.sprayingSubtitle')}</p>
          </div>
        </div>

        <div className="px-4 pb-4 pt-2 flex gap-2" style={{ background: '#fffdf5' }}>
          {(spraying_windows || []).map((win) => {
            const s = getSprayStyle(win.status);
            return (
              <div
                key={win.block}
                className="flex-1 rounded-xl p-3 transition-all"
                style={{ background: s.bg, border: s.border }}
              >
                <p className="text-xs font-bold mb-0.5" style={{ color: s.textColor }}>{win.block}</p>
                <p className="text-[9px] text-stone-400 font-medium mb-2">{win.time_range}</p>
                <div
                  className="inline-block px-2 py-0.5 rounded-md text-[9px] font-bold mb-2"
                  style={{ background: s.badgeBg, color: s.badgeText }}
                >
                  {t(s.label)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Wind size={9} className="text-stone-400" />
                    <span className="text-[9px] font-semibold" style={{ color: s.textColor }}>{win.max_wind_kmh} km/h</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Droplets size={9} className="text-stone-400" />
                    <span className="text-[9px] font-semibold" style={{ color: s.textColor }}>{win.max_precip_pct}% rain</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>


      {/* ═══════════════════════════════════════════════════════
          5. SOIL & WATER RETENTION METRICS
      ═══════════════════════════════════════════════════════ */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: '1.5px solid #e5e0d8', boxShadow: '0 2px 12px rgba(5,46,22,0.06)' }}
      >
        <div className="px-4 pt-4 pb-2 flex items-center gap-2" style={{ background: '#fffdf5' }}>
          <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center">
            <Sprout size={16} className="text-amber-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold font-serif-accent" style={{ color: 'var(--color-forest)' }}>
              {t('weather.soilTitle')}
            </h4>
            <p className="text-[10px] text-stone-400 font-medium">{t('weather.soilSubtitle')}</p>
          </div>
        </div>

        <div className="px-4 pb-4 pt-2 grid grid-cols-2 gap-3" style={{ background: '#fffdf5' }}>
          {/* Evapotranspiration */}
          <div
            className="rounded-xl p-3"
            style={{ background: 'linear-gradient(135deg, #fdf4ff, #fae8ff)', border: '1.5px solid #e9d5ff' }}
          >
            <p className="text-[9px] text-purple-400 font-bold uppercase tracking-wider mb-1">{t('weather.et0Today')}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-purple-700">
                {soil_insights?.et0_today_mm ?? '--'}
              </span>
              <span className="text-[10px] font-bold text-purple-400">{t('weather.mmPerDay')}</span>
            </div>
            <div className="mt-2 flex items-center gap-1">
              <Thermometer size={10} className="text-purple-300" />
              <span className="text-[9px] text-purple-400 font-semibold">
                {t('weather.et07dayAvg', { value: soil_insights?.et0_7day_avg_mm ?? '--' })}
              </span>
            </div>
          </div>

          {/* Moisture Status */}
          {(() => {
            const mc = getMoistureColor(soil_insights?.moisture_status);
            return (
              <div
                className="rounded-xl p-3"
                style={{ background: mc.bg, border: `1.5px solid ${mc.border}` }}
              >
                <p className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: mc.text, opacity: 0.7 }}>
                  {t('weather.moisture')}
                </p>
                <div
                  className="inline-block px-2 py-0.5 rounded-md text-xs font-bold mb-2"
                  style={{ background: mc.text, color: '#fff' }}
                >
                  {soil_insights?.moisture_status || '--'}
                </div>
                <p className="text-[10px] font-medium leading-snug" style={{ color: mc.text }}>
                  {soil_insights?.moisture_description || ''}
                </p>
              </div>
            );
          })()}
        </div>
      </div>


      {/* ═══════════════════════════════════════════════════════
          6. 7-DAY AGRICULTURAL FORECAST
      ═══════════════════════════════════════════════════════ */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: '1.5px solid #e5e0d8', boxShadow: '0 2px 12px rgba(5,46,22,0.06)' }}
      >
        <div className="px-4 pt-4 pb-2 flex items-center gap-2" style={{ background: '#fffdf5' }}>
          <div className="w-8 h-8 bg-sky-50 rounded-xl flex items-center justify-center">
            <CalendarDays size={16} className="text-sky-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold font-serif-accent" style={{ color: 'var(--color-forest)' }}>
              {t('weather.forecastTitle')}
            </h4>
          </div>
        </div>

        <div className="px-4 pb-4 pt-1 space-y-2" style={{ background: '#fffdf5' }}>
          {(forecast_7day || []).map((day, idx) => {
            const rain = getRainColor(day.precip_probability_pct);
            const isToday = idx === 0;
            return (
              <div
                key={day.date}
                className="rounded-xl px-3 py-2.5 flex items-center gap-3 transition-all"
                style={{
                  background: isToday
                    ? 'linear-gradient(135deg, rgba(22,101,52,0.06), rgba(20,83,45,0.03))'
                    : 'rgba(255,253,249,0.6)',
                  border: isToday ? '1.5px solid #bbf7d0' : '1px solid #f0ebe4',
                }}
              >
                {/* Day + emoji */}
                <div className="w-12 text-center shrink-0">
                  <span className="text-lg leading-none">{getWeatherEmoji(day.condition)}</span>
                  <p className="text-[9px] font-bold text-stone-500 mt-0.5 uppercase tracking-wider">
                    {isToday ? t('weather.today') : day.day_name?.slice(0, 3)}
                  </p>
                </div>

                {/* Condition + date */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate" style={{ color: 'var(--color-forest)' }}>
                    {day.condition_text}
                  </p>
                  <p className="text-[10px] text-stone-400 font-medium">
                    {new Date(day.date + 'T00:00:00').toLocaleDateString(i18n.language === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                </div>

                {/* Temp */}
                <div className="text-right shrink-0 mr-1">
                  <p className="text-xs font-extrabold" style={{ color: 'var(--color-forest)' }}>
                    {day.temp_max}°
                  </p>
                  <p className="text-[10px] text-stone-400 font-bold">{day.temp_min}°</p>
                </div>

                {/* Rain badge */}
                <div
                  className="shrink-0 px-2 py-1 rounded-lg text-center min-w-[44px]"
                  style={{ background: rain.bg }}
                >
                  <p className="text-[9px] font-bold" style={{ color: rain.text }}>
                    {day.precip_probability_pct}%
                  </p>
                  <p className="text-[7px] font-semibold text-stone-400">{t('weather.rain')}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default WeatherPage;
