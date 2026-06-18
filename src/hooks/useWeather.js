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
  const cachedData = localStorage.getItem('agroo_weather_dashboard_cache');
  const initialData = cachedData ? JSON.parse(cachedData) : undefined;

  return useQuery({
    queryKey,
    queryFn: async () => {
      const data = await getWeatherDashboard(lat, lon, city, state);
      localStorage.setItem('agroo_weather_dashboard_cache', JSON.stringify(data));
      return data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    initialData, // Instantly load last known weather
    refetchOnWindowFocus: false,
  });
};

/**
 * Fetch the AI weather advisory separately.
 * This allows the main dashboard to load instantly while the AI
 * summary loads in the background.
 */
export const useWeatherAdvisory = (lat, lon, city, state) => {
  const queryKey = ['weatherAdvisory', lat, lon, city, state];
  const cachedData = localStorage.getItem('agroo_weather_advisory_cache');
  const initialData = cachedData ? JSON.parse(cachedData) : undefined;

  return useQuery({
    queryKey,
    queryFn: async () => {
      const data = await getWeatherAdvisory(lat, lon, city, state);
      if (!data.is_fallback) {
        localStorage.setItem('agroo_weather_advisory_cache', JSON.stringify(data));
      }
      return data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    initialData, // Instantly load last known advisory
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
