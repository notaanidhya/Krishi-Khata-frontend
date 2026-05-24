/**
 * apiClient.js — Centralized Axios instance with JWT interceptor.
 *
 * ALL API modules should import this client instead of raw axios.
 * The request interceptor automatically attaches the JWT token
 * from localStorage to every outgoing request.
 */

import axios from 'axios';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:8001'
  : 'https://krishi-khata.onrender.com';

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 15000, // 15s timeout — generous for Render cold starts
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor — Attach JWT ──────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('agroo_jwt');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor — Handle 401 (expired token) ─────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear auth state
      localStorage.removeItem('agroo_jwt');
      localStorage.removeItem('agroo_device_id');
      localStorage.removeItem('agroo_user_name');
      
      // Redirect to root without triggering a hard reload loop
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
