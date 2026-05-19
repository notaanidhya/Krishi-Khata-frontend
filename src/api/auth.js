/**
 * Auth API — Register and Login with device ID + PIN.
 */

import apiClient from './apiClient';

/**
 * Register a new device with a PIN.
 * @param {string} deviceId - UUID
 * @param {string} pin - 4-digit PIN
 * @param {string} displayName - User's name
 * @returns {Promise<{token: string, user: object}>}
 */
export const registerDevice = async (deviceId, pin, displayName) => {
  const { data } = await apiClient.post('/api/v1/auth/register', {
    device_id: deviceId,
    pin,
    display_name: displayName,
  });
  return data;
};

/**
 * Login with existing device ID + PIN.
 * @param {string} deviceId - UUID
 * @param {string} pin - 4-digit PIN
 * @returns {Promise<{token: string, user: object}>}
 */
export const loginDevice = async (deviceId, pin) => {
  const { data } = await apiClient.post('/api/v1/auth/login', {
    device_id: deviceId,
    pin,
  });
  return data;
};
