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
import { motion } from 'framer-motion';
import {
  CloudSun, Sparkles, Droplets, Sprout,
  Wind, Thermometer, CloudOff,
  CalendarDays,
} from 'lucide-react';
import { useWeatherDashboard, useWeatherAdvisory } from '../hooks/useWeather';
import { getExactLocationName } from '../api/weather';
import { useActiveFarm } from '../context/ActiveFarmContext';
import { useLocation } from '../hooks/useLocation';
import PageShell from '../components/layout/PageShell';
import { staggerContainer, fadeUp } from '../components/motion/motionPresets';

const conditionTranslations = {
  "Clear Sky": "साफ मौसम",
  "Partly Cloudy": "आंशिक बादल",
  "Fog": "कोहरा",
  "Light Drizzle": "हल्की बूंदाबांदी",
  "Drizzle": "बूंदाबांदी",
  "Rain": "बारिश",
  "Snow": "बर्फबारी",
  "Rain Showers": "बारिश की बौछारें",
  "Thunderstorm": "गरज के साथ बारिश",
  "Clear": "साफ"
};

const translateCondition = (text, lang) => {
  if (lang !== 'hi') return text;
  return conditionTranslations[text] || text;
};

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
        bg: 'linear-gradient(135deg, var(--color-success-soft), var(--color-forest-light))',
        border: '1.5px solid var(--color-forest-muted)',
        badgeBg: 'var(--color-success)', badgeText: '#fff',
        label: 'weather.optimal', textColor: 'var(--color-forest)',
      };
    case 'YELLOW':
      return {
        bg: 'linear-gradient(135deg, var(--color-warning-soft), #fef3c7)',
        border: '1.5px solid var(--color-harvest)',
        badgeBg: 'var(--color-warning)', badgeText: '#fff',
        label: 'weather.caution', textColor: 'var(--color-ink)',
      };
    case 'RED':
      return {
        bg: 'linear-gradient(135deg, var(--color-danger-soft), #fee2e2)',
        border: '1.5px solid var(--color-danger)',
        badgeBg: 'var(--color-danger)', badgeText: '#fff',
        label: 'weather.avoid', textColor: 'var(--color-ink)',
      };
    default:
      return {
        bg: 'var(--color-soil-dark)', border: '1.5px solid var(--border-subtle)',
        badgeBg: 'var(--color-muted)', badgeText: '#fff',
        label: '—', textColor: 'var(--color-ink)',
      };
  }
};

/* ── Moisture status → color helper ────────────────────────── */
const getMoistureColor = (status) => {
  if (status?.includes('Dry') || status?.includes('सूखा')) return { bg: 'var(--color-danger-soft)', text: 'var(--color-danger)', border: 'var(--color-danger)' };
  if (status === 'Moderate' || status === 'सामान्य') return { bg: 'var(--color-warning-soft)', text: 'var(--color-warning)', border: 'var(--color-harvest)' };
  return { bg: 'var(--color-success-soft)', text: 'var(--color-success)', border: 'var(--color-forest-muted)' };
};

/* ── Rain probability → color helper ───────────────────────── */
const getRainColor = (pct) => {
  if (pct > 60) return { bg: 'var(--color-danger-soft)', text: 'var(--color-danger)' };
  if (pct > 30) return { bg: 'var(--color-warning-soft)', text: 'var(--color-warning)' };
  return { bg: 'var(--color-success-soft)', text: 'var(--color-success)' };
};


const WeatherPage = () => {
  const { t, i18n } = useTranslation();
  const { activeFarm } = useActiveFarm();
  const [liveCoords, setLiveCoords] = useState(null);
  const [exactVillage, setExactVillage] = useState(null);

  // Fetch village name if we have coords
  useEffect(() => {
    const fetchVillage = async (lat, lon) => {
      const name = await getExactLocationName(lat, lon);
      if (name) setExactVillage(name);
    };
    
    if (liveCoords) {
      fetchVillage(liveCoords.lat, liveCoords.lon);
    } else if (activeFarm?.latitude && activeFarm?.longitude) {
      fetchVillage(activeFarm.latitude, activeFarm.longitude);
    }
  }, [liveCoords, activeFarm]);

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

  /* ── Error state ─────────────────────────────────────────── */
  if (isError || (!data && !isLoading)) {
    return (
      <PageShell ambient="weather">
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--color-soil-dark)' }}>
            <CloudOff size={28} style={{ color: 'var(--color-muted)' }} />
          </div>
          <p className="text-sm font-bold mb-1" style={{ color: 'var(--color-ink)' }}>{t('weather.errorTitle')}</p>
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{t('weather.errorText')}</p>
        </div>
      </PageShell>
    );
  }

  const { location, current, soil_insights, forecast_7day } = data || {};
  const ai_summary = advisoryData?.ai_summary;
  const daily_tip = advisoryData?.daily_tip;

  return (
    <PageShell ambient="weather">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        id="weather-page"
        className="px-4 pt-4 pb-24 max-w-lg mx-auto space-y-4"
      >

      {/* ═══════════════════════════════════════════════════════
          1. PAGE HEADER
      ═══════════════════════════════════════════════════════ */}
      <motion.div variants={fadeUp} className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, var(--color-forest-mid), var(--color-forest))', boxShadow: '0 4px 16px -4px rgba(92,122,85,0.5)' }}
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
          <p className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>
            {exactVillage ? `${exactVillage}, ` : ''}{location?.city || 'Local'}, {location?.state || ''}
          </p>
        </div>
      </motion.div>


      {/* ═══════════════════════════════════════════════════════
          2. CURRENT CONDITIONS STRIP
      ═══════════════════════════════════════════════════════ */}
      <motion.div
        variants={fadeUp}
        className="rounded-2xl px-4 py-3 flex items-center justify-between krishi-card"
      >
        <div className="flex items-center gap-3">
          <span className="text-4xl leading-none">{getWeatherEmoji(current?.condition)}</span>
          <div>
            <p className="text-2xl font-black" style={{ color: 'var(--color-forest)' }}>
              {current?.temperature_c ?? '--'}°
            </p>
            <p className="text-xs font-semibold" style={{ color: 'var(--color-muted)' }}>{translateCondition(current?.condition_text, i18n.language) || 'Loading...'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="px-2.5 py-1.5 rounded-lg text-center" style={{ background: 'var(--color-info-soft)', border: '1px solid rgba(107,138,158,0.2)' }}>
            <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-info)' }}>{t('weather.humidity')}</p>
            <p className="text-xs font-extrabold" style={{ color: 'var(--color-info)' }}>{current?.humidity_pct ?? '--'}%</p>
          </div>
          <div className="px-2.5 py-1.5 rounded-lg text-center" style={{ background: 'var(--color-forest-light)', border: '1px solid rgba(107,123,79,0.15)' }}>
            <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-forest-muted)' }}>{t('weather.wind')}</p>
            <p className="text-xs font-extrabold" style={{ color: 'var(--color-forest)' }}>{current?.wind_speed_kmh ?? '--'} km/h</p>
          </div>
        </div>
      </motion.div>


      {/* ═══════════════════════════════════════════════════════
          3. AI WEATHER IMPACT SUMMARY — HERO CARD
      ═══════════════════════════════════════════════════════ */}
      <motion.div
        variants={fadeUp}
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #3d5a3a 0%, #2d2a24 100%)',
          boxShadow: 'var(--shadow-hero)',
        }}
      >
        <div className="px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="px-2 py-1 rounded-lg flex items-center gap-1.5"
              style={{ background: 'rgba(201,162,75,0.15)', border: '1px solid rgba(201,162,75,0.3)' }}
            >
              <Sparkles size={11} style={{ color: 'var(--color-harvest)' }} />
              <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-harvest)' }}>{t('weather.aiAdvisory')}</span>
            </div>
          </div>
          {advisoryLoading ? (
            <div className="space-y-2.5 animate-pulse">
              <div className="h-3.5 bg-white/10 rounded-lg w-full" />
              <div className="h-3.5 bg-white/10 rounded-lg w-5/6" />
              <div className="h-3.5 bg-white/10 rounded-lg w-4/6" />
              <p className="text-[10px] text-white/30 font-medium mt-1 flex items-center gap-1.5">
                <Sparkles size={9} style={{ color: 'var(--color-harvest)', opacity: 0.5 }} className="animate-spin" style={{ animationDuration: '3s' }} />
                {t('weather.analysisLoading')}
              </p>
            </div>
          ) : (
            <p className="text-sm text-white/90 leading-relaxed font-medium">
              {ai_summary || t('weather.analysisLoading')}
            </p>
          )}
        </div>
      </motion.div>


      {/* ═══════════════════════════════════════════════════════
          4. DAILY FARMING TIP
      ═══════════════════════════════════════════════════════ */}
      <motion.div
        variants={fadeUp}
        className="rounded-2xl overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, var(--color-forest-light) 0%, #e4ebda 100%)', border: '1.5px solid rgba(107,123,79,0.15)', boxShadow: 'var(--shadow-card)' }}
      >
        <div className="px-4 py-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(107,123,79,0.15)' }}>
            <Sprout size={20} style={{ color: 'var(--color-forest-muted)' }} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles size={12} style={{ color: 'var(--color-forest-muted)' }} />
              <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-forest-mid)' }}>
                आज का कृषि सुझाव
              </h4>
            </div>
            {advisoryLoading ? (
              <div className="space-y-1.5 animate-pulse mt-2">
                 <div className="h-3 rounded w-full" style={{ background: 'rgba(107,123,79,0.12)' }} />
                 <div className="h-3 rounded w-4/5" style={{ background: 'rgba(107,123,79,0.12)' }} />
              </div>
            ) : (
              <p className="text-sm font-medium leading-snug" style={{ color: 'var(--color-forest)' }}>
                {daily_tip || "स्वस्थ फसल के लिए अच्छे बीजों का चयन करें और समय पर सिंचाई करें।"}
              </p>
            )}
          </div>
        </div>
      </motion.div>


      {/* ═══════════════════════════════════════════════════════
          5. SOIL & WATER RETENTION METRICS
      ═══════════════════════════════════════════════════════ */}
      <motion.div
        variants={fadeUp}
        className="rounded-2xl overflow-hidden krishi-card"
      >
        <div className="px-4 pt-4 pb-2 flex items-center gap-2" style={{ background: 'var(--color-cream)' }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-warning-soft)' }}>
            <Sprout size={16} style={{ color: 'var(--color-harvest)' }} />
          </div>
          <div>
            <h4 className="text-sm font-bold font-serif-accent" style={{ color: 'var(--color-forest)' }}>
              नमी
            </h4>
          </div>
        </div>

        <div className="px-4 pb-4 pt-2" style={{ background: 'var(--color-cream)' }}>
          {/* Moisture Status */}
          {(() => {
            const status = advisoryData?.moisture_status || soil_insights?.moisture_status;
            const desc = advisoryData?.moisture_description || soil_insights?.moisture_description;
            const mc = getMoistureColor(status);
            return (
              <div
                className="rounded-xl p-4 flex items-center justify-between gap-4"
                style={{ background: mc.bg, border: `1.5px solid ${mc.border}` }}
              >
                <div>
                  <p className="text-xs font-medium leading-relaxed" style={{ color: mc.text }}>
                    {desc || ''}
                  </p>
                </div>
                <div
                  className="shrink-0 px-3 py-1.5 rounded-lg text-sm font-black shadow-sm"
                  style={{ background: mc.text, color: '#fff' }}
                >
                  {status || '--'}
                </div>
              </div>
            );
          })()}
        </div>
      </motion.div>


      {/* ═══════════════════════════════════════════════════════
          6. 7-DAY AGRICULTURAL FORECAST
      ═══════════════════════════════════════════════════════ */}
      <motion.div
        variants={fadeUp}
        className="rounded-2xl overflow-hidden krishi-card"
      >
        <div className="px-4 pt-4 pb-2 flex items-center gap-2" style={{ background: 'var(--color-cream)' }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-info-soft)' }}>
            <CalendarDays size={16} style={{ color: 'var(--color-info)' }} />
          </div>
          <div>
            <h4 className="text-sm font-bold font-serif-accent" style={{ color: 'var(--color-forest)' }}>
              {t('weather.forecastTitle')}
            </h4>
          </div>
        </div>

        <div className="px-4 pb-4 pt-1 space-y-2" style={{ background: 'var(--color-cream)' }}>
          {(() => {
            const weekMin = Math.min(...(forecast_7day || []).map(d => d.temp_min));
            const weekMax = Math.max(...(forecast_7day || []).map(d => d.temp_max));
            const range = weekMax - weekMin || 1;

            return (forecast_7day || []).map((day, idx) => {
              const rain = getRainColor(day.precip_probability_pct);
              const isToday = idx === 0;
              
              const leftPercent = ((day.temp_min - weekMin) / range) * 100;
              const widthPercent = ((day.temp_max - day.temp_min) / range) * 100;

              return (
                <div
                  key={day.date}
                  className="rounded-xl px-3 py-2 flex items-center gap-2 transition-all"
                  style={{
                    background: isToday
                      ? 'linear-gradient(135deg, rgba(107,123,79,0.06), rgba(92,122,85,0.03))'
                      : 'rgba(255,255,255,0.6)',
                    border: isToday ? '1.5px solid rgba(107,123,79,0.2)' : '1px solid var(--border-subtle)',
                  }}
                >
                  {/* Day + emoji */}
                  <div className="w-10 text-center shrink-0">
                    <span className="text-[16px] leading-none">{getWeatherEmoji(day.condition)}</span>
                    <p className="text-[9px] font-bold mt-0.5 uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
                      {isToday ? t('weather.today') : day.day_name?.slice(0, 3)}
                    </p>
                  </div>
  
                  {/* Condition + date */}
                  <div className="w-24 min-w-[6rem] shrink-0">
                    <p className="text-[11px] font-bold truncate" style={{ color: 'var(--color-forest)' }}>
                      {translateCondition(day.condition_text, i18n.language)}
                    </p>
                    <p className="text-[9px] font-medium" style={{ color: 'var(--color-muted)' }}>
                      {new Date(day.date + 'T00:00:00').toLocaleDateString(i18n.language === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
  
                  {/* Temp Bar */}
                  <div className="flex-1 flex items-center gap-1.5 px-1 min-w-[70px]">
                    <span className="text-[9px] font-bold shrink-0 w-4 text-right" style={{ color: 'var(--color-muted)' }}>{day.temp_min}°</span>
                    <div className="flex-1 h-1.5 rounded-full relative overflow-hidden" style={{ background: 'var(--color-soil-dark)' }}>
                      <div 
                        className="absolute h-full rounded-full"
                        style={{
                          left: `${leftPercent}%`,
                          width: `${widthPercent}%`,
                          background: 'linear-gradient(90deg, var(--color-info), var(--color-rust))'
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-extrabold shrink-0 w-5" style={{ color: 'var(--color-forest)' }}>{day.temp_max}°</span>
                  </div>
  
                  {/* Rain badge */}
                  <div
                    className="shrink-0 px-2 py-1 rounded-lg text-center min-w-[40px]"
                    style={{ background: rain.bg }}
                  >
                    <p className="text-[9px] font-bold" style={{ color: rain.text }}>
                      {day.precip_probability_pct}%
                    </p>
                    <p className="text-[7px] font-semibold" style={{ color: 'var(--color-muted)' }}>{t('weather.rain')}</p>
                  </div>
                </div>
              );
            });
          })()}

        </div>
      </motion.div>

      </motion.div>
    </PageShell>
  );
};

export default WeatherPage;
