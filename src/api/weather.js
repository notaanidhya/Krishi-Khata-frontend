/**
 * Weather API Layer — Axios fetchers for weather data.
 * All requests target /api/v1/weather on the FastAPI backend.
 */

import axios from 'axios';

const API_BASE = 'https://krishi-khata.onrender.com/api/v1/weather';

/**
 * Fetch current weather conditions + 7-day forecast.
 * @param {Object} coords - Optional { lat, lon }
 * @returns {Promise<Object>} WeatherResponse — { location, current, daily[] }
 */
export const getCurrentWeather = async (coords = null) => {
  const params = coords ? { lat: coords.lat, lon: coords.lon } : {};
  const { data } = await axios.get(`${API_BASE}/current`, { params });
  return data;
};

/**
 * Fetch 7-day forecast only.
 * @param {number} lat — Latitude
 * @param {number} lon — Longitude
 * @returns {Promise<Object>} { location, daily[] }
 */
export const getForecast = async (lat = 23.2599, lon = 77.4126) => {
  const { data } = await axios.get(`${API_BASE}/forecast`, {
    params: { lat, lon },
  });
  return data;
};
