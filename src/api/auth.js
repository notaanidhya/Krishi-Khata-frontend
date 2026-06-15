/**
 * Auth API — Register and Login with device ID + PIN.
 */

import apiClient from './apiClient';

/**
 * Check if a username is already taken.
 * @param {string} username
 * @returns {Promise<{exists: boolean}>}
 */
export const checkUsername = async (username) => {
  const { data } = await apiClient.get(`/api/v1/auth/check-username?name=${encodeURIComponent(username)}`);
  return data;
};

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
 * Login with username + PIN.
 * @param {string} username - User's name
 * @param {string} pin - 4-digit PIN
 * @returns {Promise<{token: string, user: object, device_id: string}>}
 */
export const loginDevice = async (username, pin) => {
  const { data } = await apiClient.post('/api/v1/auth/login', {
    username,
    pin,
  });
  return data;
};
