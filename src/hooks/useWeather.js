/**
 * TanStack Query hook for the Advanced Agriculture Weather Dashboard.
 */

import { useQuery } from '@tanstack/react-query';
import { getWeatherDashboard, getWeatherAdvisory } from '../api/weather';

/**
 * Fetch the weather dashboard data for the active farm.
 * @param {number} [lat] - Farm latitude
 * @param {number} [lon] - Farm longitude
 * @param {string} [city] - Farm district/city
 * @param {string} [state] - Farm state
 */
export const useWeatherDashboard = (lat, lon, city, state) => {
  const queryKey = ['weatherDashboard', lat, lon, city, state];
  const cachedData = localStorage.getItem('agroo_weather_dashboard_cache_v2');
  const initialData = cachedData ? JSON.parse(cachedData) : undefined;

  return useQuery({
    queryKey,
    queryFn: async () => {
      const data = await getWeatherDashboard(lat, lon, city, state);
      localStorage.setItem('agroo_weather_dashboard_cache_v2', JSON.stringify(data));
      return data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    initialData, // Instantly load last known weather
    refetchOnWindowFocus: false,
    enabled: !!lat && !!lon,
  });
};

/**
 * Fetch the AI weather advisory separately.
 * This allows the main dashboard to load instantly while the AI
 * summary loads in the background.
 *
 * Caching strategy (two-tier):
 *  - agroo_weather_advisory_good_cache: ONLY updated when Gemini succeeds.
 *    Represents the farmer's last real AI response. No TTL expiry — we
 *    always prefer showing this over a static fallback.
 *  - agroo_weather_advisory_cache: Always updated (fallback too), used to
 *    detect whether we need to refetch at all.
 */
export const useWeatherAdvisory = (lat, lon, city, state, cropName, daysSincePlanting, currentStage) => {
  const queryKey = ['weatherAdvisory', lat, lon, city, state, cropName, currentStage];

  // Cache key includes crop+stage so a different crop gets its own advisory
  const localStorageKey = `agroo_weather_advisory_cache|${cropName || ''}|${currentStage || ''}`;
  const localStorageGoodKey = `agroo_weather_advisory_good_cache|${cropName || ''}|${currentStage || ''}`;

  // Prefer the last real Gemini response. Fall back to any cached data
  // (including weather-aware fallback), respecting a 30-min TTL on fallbacks.
  const initialData = (() => {
    try {
      // First choice: last successful Gemini response for this crop+stage (no expiry)
      const good = localStorage.getItem(localStorageGoodKey);
      if (good) return JSON.parse(good);

      // Second choice: any cached response (fallback), but only if recent
      const raw = localStorage.getItem(localStorageKey);
      if (!raw) return undefined;
      const parsed = JSON.parse(raw);
      const cachedAt = parsed?._cachedAt || 0;
      const maxAge = 1000 * 60 * 30; // 30 min TTL on fallbacks
      if (Date.now() - cachedAt > maxAge) return undefined;
      return parsed;
    } catch {
      return undefined;
    }
  })();

  return useQuery({
    queryKey,
    queryFn: async () => {
      const data = await getWeatherAdvisory(lat, lon, city, state, cropName, daysSincePlanting, currentStage);

      // Always write to the general cache (with timestamp)
      localStorage.setItem(
        localStorageKey,
        JSON.stringify({ ...data, _cachedAt: Date.now() })
      );

      // Only write to the "good" cache if Gemini actually succeeded
      if (!data.is_fallback) {
        localStorage.setItem(localStorageGoodKey, JSON.stringify(data));
      }

      return data;
    },
    // Fallback initial data → ALWAYS refetch in background (staleTime: 0)
    // Real Gemini data → Keep fresh for 1 hour
    staleTime: initialData?.is_fallback ? 0 : 1000 * 60 * 60,
    initialData,
    refetchOnWindowFocus: false,
    enabled: !!lat && !!lon,
    retry: 2,
    retryDelay: 3000,
  });
};
