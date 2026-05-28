/**
 * TanStack Query hook for the Advanced Agriculture Weather Dashboard.
 */

import { useQuery } from '@tanstack/react-query';
import { getWeatherDashboard } from '../api/weather';

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
