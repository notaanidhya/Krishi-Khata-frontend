/**
 * Weather API Layer — Axios fetchers for weather data.
 * All requests target /api/v1/weather on the FastAPI backend.
 */

import apiClient from './apiClient';

/**
 * Fetch current weather conditions + 7-day forecast.
 * @param {Object} coords - Optional { lat, lon }
 * @returns {Promise<Object>} WeatherResponse — { location, current, daily[] }
 */
export const getCurrentWeather = async (coords = null) => {
  const params = coords ? { lat: coords.lat, lon: coords.lon } : {};
  const { data } = await apiClient.get('/api/v1/weather/current', { params });
  return data;
};

/**
 * Fetch 7-day forecast only.
 * @param {number} lat — Latitude
 * @param {number} lon — Longitude
 * @returns {Promise<Object>} { location, daily[] }
 */
export const getForecast = async (lat = 23.2599, lon = 77.4126) => {
  const { data } = await apiClient.get('/api/v1/weather/forecast', {
    params: { lat, lon },
  });
  return data;
};

/**
 * Fetch the comprehensive weather dashboard data.
 * Includes AI summary, spraying windows, soil insights, and 7-day forecast.
 * @param {number} [lat] - Latitude of the farm
 * @param {number} [lon] - Longitude of the farm
 * @param {string} [city] - City name
 * @param {string} [state] - State name
 * @returns {Object} Full dashboard payload
 */
export const getWeatherDashboard = async (lat, lon, city, state) => {
  const params = {};
  if (lat != null) params.lat = lat;
  if (lon != null) params.lon = lon;
  if (city) params.city = city;
  if (state) params.state = state;
  const { data } = await apiClient.get('/api/v1/weather/dashboard', { params });
  return data;
};

/**
 * Fetch the AI-generated agricultural weather advisory.
 * Separated from the dashboard for faster initial load.
 * @param {number} [lat] - Latitude
 * @param {number} [lon] - Longitude
 * @param {string} [city] - City name
 * @param {string} [state] - State name
 * @returns {Object} { ai_summary: string }
 */
export const getWeatherAdvisory = async (lat, lon, city, state) => {
  const params = {};
  if (lat != null) params.lat = lat;
  if (lon != null) params.lon = lon;
  if (city) params.city = city;
  if (state) params.state = state;
  const { data } = await apiClient.get('/api/v1/weather/ai-advisory', { params });
  return data;
};

/**
 * Perform reverse geocoding to get the exact village/locality name.
 */
export const getExactLocationName = async (lat, lon) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`
    );
    const data = await res.json();
    if (data && data.address) {
      const addr = data.address;
      return addr.village || addr.town || addr.suburb || addr.city || addr.county || null;
    }
  } catch (err) {
    console.error("Reverse geocoding failed", err);
  }
  return null;
};
