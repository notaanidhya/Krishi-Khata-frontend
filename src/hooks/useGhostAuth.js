/**
 * useGhostAuth — manages anonymous device-based authentication.
 *
 * On first launch, no device_id or user_name exists in localStorage.
 * After the WelcomeScreen captures the user's name, a UUID is generated
 * and both are stored permanently in localStorage.
 */

import { useState, useCallback } from 'react';

const DEVICE_ID_KEY = 'agroo_device_id';
const USER_NAME_KEY = 'agroo_user_name';

function generateUUID() {
  // Use crypto.randomUUID if available, otherwise fallback
  if (crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const useGhostAuth = () => {
  const [deviceId, setDeviceId] = useState(() => localStorage.getItem(DEVICE_ID_KEY));
  const [userName, setUserName] = useState(() => localStorage.getItem(USER_NAME_KEY));

  const isAuthenticated = Boolean(deviceId && userName);

  const register = useCallback((name) => {
    const id = generateUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
    localStorage.setItem(USER_NAME_KEY, name.trim());
    setDeviceId(id);
    setUserName(name.trim());
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(DEVICE_ID_KEY);
    localStorage.removeItem(USER_NAME_KEY);
    setDeviceId(null);
    setUserName(null);
  }, []);

  return { deviceId, userName, isAuthenticated, register, logout };
};
