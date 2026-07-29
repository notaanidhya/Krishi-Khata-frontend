
import apiClient from './apiClient';

/**
 * @param {Object} coords 
 * @returns {Promise<Object>} 
 */
export const getCurrentWeather = async (coords = null) => {
  const params = coords ? { lat: coords.lat, lon: coords.lon } : {};
  const { data } = await apiClient.get('/api/v1/weather/current', { params });
  return data;
};

/**
 * @param {number} lat 
 * @param {number} lon 
 * @returns {Promise<Object>} 
 */
export const getForecast = async (lat = 23.2599, lon = 77.4126) => {
  const { data } = await apiClient.get('/api/v1/weather/forecast', {
    params: { lat, lon },
  });
  return data;
};

/**
 * @param {number} [lat] 
 * @param {number} [lon] 
 * @param {string} [city] 
 * @param {string} [state]
 * @returns {Object} 
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
 
 * @param {number} [lat] 
 * @param {number} [lon] 
 * @param {string} [city]
 * @param {string} [state]
 * @returns {Object} 
 */
export const getWeatherAdvisory = async (lat, lon, city, state, cropName, daysSincePlanting, currentStage) => {
  const params = {};
  if (lat != null) params.lat = lat;
  if (lon != null) params.lon = lon;
  if (city) params.city = city;
  if (state) params.state = state;
  if (cropName) params.crop_name = cropName;
  if (daysSincePlanting != null) params.days_since_planting = daysSincePlanting;
  if (currentStage) params.current_stage = currentStage;
  const { data } = await apiClient.get('/api/v1/weather/ai-advisory', { params });
  return data;
};


export const getExactLocationDetails = async (lat, lon) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`
    );
    const data = await res.json();
    if (data && data.address) {
      const addr = data.address;
      return {
        village: addr.village || addr.town || addr.suburb || addr.neighbourhood || null,
        city: addr.city || addr.state_district || addr.county || null,
        state: addr.state || null
      };
    }
  } catch (err) {
    console.error("Reverse geocoding failed", err);
  }
  return null;
};
