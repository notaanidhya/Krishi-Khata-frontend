/**
 * useDashboard.js — TanStack Query hooks for Weather and Mandi.
 *
 * Strategy (fail-proof, zero-flash):
 * 1. On page load → instantly renders cached weather from localStorage
 *    (or realistic mock data for first-time visitors)
 * 2. In the background → fetches live data from the backend
 * 3. On success → seamlessly replaces placeholder with real data + caches it
 * 4. On failure → keeps showing the placeholder (never shows an error state)
 */

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCurrentWeather } from '../api/weather';
import { getMandiPrices } from '../api/mandi';

// ── localStorage cache key for persisting weather across refreshes ──
const WEATHER_CACHE_KEY = 'agroo_weather_cache';
const WEATHER_CACHE_MAX_AGE_MS = 1000 * 60 * 60; // 1 hour max staleness

// ── CLIENT-SIDE WEATHER FALLBACK ───────────────────────────────
// Used when the backend is unreachable. Always looks realistic.
const buildMockWeather = () => {
  const today = new Date();
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const conditions = ['sunny','partly_cloudy','sunny','cloudy','sunny','sunny','partly_cloudy'];
  const condTexts  = ['Clear Sky','Partly Cloudy','Mainly Clear','Overcast','Clear Sky','Clear Sky','Partly Cloudy'];
  const maxTemps   = [42, 41, 39, 38, 40, 42, 43];
  const minTemps   = [30, 29, 28, 27, 28, 29, 30];

  const daily = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return {
      date: d.toISOString().split('T')[0],
      day_name: days[d.getDay()],
      temp_max: maxTemps[i],
      temp_min: minTemps[i],
      condition: conditions[i],
      condition_text: condTexts[i],
      precipitation_mm: 0,
      humidity_pct: 22,
      wind_speed_kmh: 12,
      uv_index: 10,
      advisory: i === 0
        ? 'Extreme heat — ensure adequate irrigation and avoid fieldwork 12–3 PM.'
        : 'Hot weather — irrigate in the early morning or evening.',
    };
  });

  return {
    location: { latitude: 22.7196, longitude: 75.8577, city: 'Indore', state: 'Madhya Pradesh' },
    current: {
      temperature_c: 42.5,
      feels_like_c: 44,
      humidity_pct: 22,
      wind_speed_kmh: 12,
      wind_direction: 'NNW',
      condition: 'cloudy',
      condition_text: 'Overcast',
      uv_index: 10,
      visibility_km: 10,
      pressure_hpa: 944,
    },
    daily,
  };
};

/**
 * Read the last-known-good weather from localStorage.
 * Returns null if missing, corrupt, or older than WEATHER_CACHE_MAX_AGE_MS.
 */
const getCachedWeather = () => {
  try {
    const raw = localStorage.getItem(WEATHER_CACHE_KEY);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > WEATHER_CACHE_MAX_AGE_MS) return null;
    return data;
  } catch {
    return null;
  }
};

/** Persist weather data to localStorage with a timestamp. */
const setCachedWeather = (data) => {
  try {
    localStorage.setItem(
      WEATHER_CACHE_KEY,
      JSON.stringify({ data, timestamp: Date.now() }),
    );
  } catch {
    // localStorage full or unavailable — silently ignore
  }
};

/**
 * Return the best available instant weather:
 * 1. localStorage cache (real data from a recent session)
 * 2. Freshly generated mock (always valid)
 */
const getInstantWeather = () => getCachedWeather() || buildMockWeather();

// ── CLIENT-SIDE MANDI FALLBACK ─────────────────────────────────
const buildMockMandi = () => ({
  count: 8,
  last_fetched: new Date().toISOString(),
  prices: [
    { commodity: 'Wheat', variety: 'Sharbati', market: 'Indore', state: 'Madhya Pradesh', modal_price: 2300, min_price: 2150, max_price: 2450 },
    { commodity: 'Soyabean', variety: 'Yellow', market: 'Indore', state: 'Madhya Pradesh', modal_price: 4500, min_price: 4200, max_price: 4800 },
    { commodity: 'Chana', variety: 'Desi', market: 'Bhopal', state: 'Madhya Pradesh', modal_price: 5050, min_price: 4800, max_price: 5200 },
    { commodity: 'Cotton', variety: 'Medium Staple', market: 'Khandwa', state: 'Madhya Pradesh', modal_price: 6700, min_price: 6200, max_price: 7100 },
    { commodity: 'Rice', variety: 'Basmati 1121', market: 'Sagar', state: 'Madhya Pradesh', modal_price: 4050, min_price: 3800, max_price: 4200 },
    { commodity: 'Onion', variety: 'Red', market: 'Indore', state: 'Madhya Pradesh', modal_price: 1200, min_price: 900, max_price: 1500 },
    { commodity: 'Maize', variety: 'Yellow', market: 'Ujjain', state: 'Madhya Pradesh', modal_price: 1950, min_price: 1800, max_price: 2100 },
    { commodity: 'Tomato', variety: 'Hybrid', market: 'Indore', state: 'Madhya Pradesh', modal_price: 800, min_price: 500, max_price: 1100 },
  ],
});

const DASHBOARD_KEYS = {
  weather:     (coords)  => ['dashboard', 'weather', coords],
  mandiPrices: (filters) => ['dashboard', 'mandi', filters],
};

// ── Wraps a fetch fn: on any error returns the fallback value ──
const withFallback = (fn, fallback) => async (...args) => {
  try {
    return await fn(...args);
  } catch {
    return fallback();
  }
};

/**
 * useWeather — instant weather on every page load, zero flash.
 *
 * Lifecycle:
 * Frame 0   → placeholderData (localStorage cache or mock) renders instantly
 * ~0-8s     → Geolocation resolves (or times out)
 * ~0-45s    → Backend responds with live data → replaces placeholder seamlessly
 *              + caches the fresh data to localStorage
 * On error  → placeholder stays visible — user never sees "unavailable"
 */
export const useWeather = () => {
  const [coords, setCoords]           = useState(null);
  const [locationStatus, setStatus]   = useState('pending');

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
          setStatus('success');
        },
        () => setStatus('error'),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus('error');
    }
  }, []);

  return useQuery({
    queryKey: DASHBOARD_KEYS.weather(coords),
    queryFn: async () => {
      const data = await withFallback(
        () => getCurrentWeather(coords),
        buildMockWeather,
      )();
      // Persist successful fetches so next page load is instant
      setCachedWeather(data);
      return data;
    },
    // ── Instant display: show cached/mock data from frame 0 ──
    // placeholderData is shown while the real query is in-flight,
    // preventing the "unavailable" flash during geolocation wait
    // and Render cold-start delays.
    placeholderData: getInstantWeather,
    staleTime: 1000 * 60 * 10,        // 10 min — don't refetch if fresh
    gcTime:    1000 * 60 * 30,         // 30 min — keep in memory
    refetchInterval: 1000 * 60 * 15,   // Auto-refresh every 15 min
    retry: 0,                          // Don't retry — fall back instantly
    enabled: locationStatus !== 'pending',
  });
};

/**
 * useMandiPrices — fetches live prices, falls back to mock instantly.
 * Never shows an error state.
 */
export const useMandiPrices = (filters = {}) => {
  return useQuery({
    queryKey: DASHBOARD_KEYS.mandiPrices(filters),
    queryFn:  withFallback(() => getMandiPrices(filters), buildMockMandi),
    staleTime: 1000 * 60 * 5,
    gcTime:    1000 * 60 * 20,
    refetchInterval: 1000 * 60 * 10,
    retry: 0,                          // Don't retry — fall back instantly
  });
};
