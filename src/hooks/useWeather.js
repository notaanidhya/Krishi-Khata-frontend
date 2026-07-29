
import { useQuery } from '@tanstack/react-query';
import { getWeatherDashboard, getWeatherAdvisory } from '../api/weather';

/**
 * @param {number} [lat] 
 * @param {number} [lon] 
 * @param {string} [city]
 * @param {string} [state] 
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
    staleTime: 1000 * 60 * 10,
    initialData,
    refetchOnWindowFocus: false,
    enabled: !!lat && !!lon,
  });
};


export const useWeatherAdvisory = (lat, lon, city, state, cropName, daysSincePlanting, currentStage) => {
  const queryKey = ['weatherAdvisory', lat, lon, city, state, cropName, currentStage];


  const localStorageKey = `agroo_weather_advisory_cache|${cropName || ''}|${currentStage || ''}`;
  const localStorageGoodKey = `agroo_weather_advisory_good_cache|${cropName || ''}|${currentStage || ''}`;


  const initialData = (() => {
    try {

      const good = localStorage.getItem(localStorageGoodKey);
      if (good) return JSON.parse(good);


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


      localStorage.setItem(
        localStorageKey,
        JSON.stringify({ ...data, _cachedAt: Date.now() })
      );


      if (!data.is_fallback) {
        localStorage.setItem(localStorageGoodKey, JSON.stringify(data));
      }

      return data;
    },

    staleTime: initialData?.is_fallback ? 0 : 1000 * 60 * 60,
    initialData,
    refetchOnWindowFocus: false,
    enabled: !!lat && !!lon,
    retry: 2,
    retryDelay: 3000,
  });
};
