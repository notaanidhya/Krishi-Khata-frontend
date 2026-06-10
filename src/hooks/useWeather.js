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
  return useQuery({
    queryKey: ['weatherDashboard', lat, lon, city, state],
    queryFn: () => getWeatherDashboard(lat, lon, city, state),
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
  });
};

/**
 * Fetch the AI weather advisory separately.
 * This allows the main dashboard to load instantly while the AI
 * summary loads in the background.
 */
export const useWeatherAdvisory = (lat, lon, city, state) => {
  return useQuery({
    queryKey: ['weatherAdvisory', lat, lon, city, state],
    queryFn: () => getWeatherAdvisory(lat, lon, city, state),
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
