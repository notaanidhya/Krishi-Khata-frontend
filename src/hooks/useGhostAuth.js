/**
 * useGhostAuth — Device-based authentication with 4-digit PIN.
 *
 * States:
 *   - NEW_USER:     No device_id → show WelcomeScreen (name + PIN setup)
 *   - NEEDS_PIN:    Has device_id but no JWT → show PIN entry screen
 *   - AUTHENTICATED: Has device_id + valid JWT → show app
 *
 * The JWT is stored in localStorage and attached to all API calls
 * via the axios interceptor in apiClient.js.
 */

import { useState, useCallback } from 'react';
import { registerDevice, loginDevice } from '../api/auth';

const DEVICE_ID_KEY = 'agroo_device_id';
const USER_NAME_KEY = 'agroo_user_name';
const JWT_KEY = 'agroo_jwt';

function generateUUID() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// PINs that are too easy to guess
const WEAK_PINS = new Set([
  '0000', '1111', '2222', '3333', '4444',
  '5555', '6666', '7777', '8888', '9999',
  '1234', '4321', '1122', '2580', '0852',
  '1212', '6969', '1010',
]);

export const isWeakPin = (pin) => WEAK_PINS.has(pin);

export const useGhostAuth = () => {
  const [deviceId, setDeviceId] = useState(() => localStorage.getItem(DEVICE_ID_KEY));
  const [userName, setUserName] = useState(() => localStorage.getItem(USER_NAME_KEY));
  const [jwt, setJwt] = useState(() => localStorage.getItem(JWT_KEY));
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Auth state
  const isNewUser = !deviceId;
  const needsPin = Boolean(deviceId && !jwt);
  const isAuthenticated = Boolean(deviceId && jwt);

  /**
   * Register a new user — called from WelcomeScreen.
   * Generates device ID, sends to backend with PIN, stores JWT.
   */
  const register = useCallback(async (name, pin) => {
    setIsLoading(true);
    setError(null);
    try {
      const id = generateUUID();
      const result = await registerDevice(id, pin, name.trim());

      // Store credentials
      localStorage.setItem(DEVICE_ID_KEY, id);
      localStorage.setItem(USER_NAME_KEY, name.trim());
      localStorage.setItem(JWT_KEY, result.token);

      setDeviceId(id);
      setUserName(name.trim());
      setJwt(result.token);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Registration failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Login with existing device ID and PIN.
   */
  const login = useCallback(async (pin) => {
    if (!deviceId) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await loginDevice(deviceId, pin);

      localStorage.setItem(JWT_KEY, result.token);
      localStorage.setItem(USER_NAME_KEY, result.user?.display_name || userName);

      setJwt(result.token);
      setUserName(result.user?.display_name || userName);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Wrong PIN. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [deviceId, userName]);

  /**
   * Full logout — clears everything.
   */
  const logout = useCallback(() => {
    localStorage.removeItem(DEVICE_ID_KEY);
    localStorage.removeItem(USER_NAME_KEY);
    localStorage.removeItem(JWT_KEY);
    setDeviceId(null);
    setUserName(null);
    setJwt(null);
    setError(null);
  }, []);

  return {
    deviceId,
    userName,
    isNewUser,
    needsPin,
    isAuthenticated,
    isLoading,
    error,
    register,
    login,
    logout,
  };
};
