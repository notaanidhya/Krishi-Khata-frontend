
import axios from 'axios';
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:8000'
  : 'https://krishi-khata.onrender.com';

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 45000,
  headers: {
    'Content-Type': 'application/json',
  },
});


apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('agroo_jwt');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }


    config.headers['Accept-Language'] = localStorage.getItem('i18nextLng') || 'en';

    return config;
  },
  (error) => Promise.reject(error)
);


apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      console.warn('[apiClient] Request timed out — server may be waking up.');
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('agroo_jwt');
      localStorage.removeItem('agroo_device_id');
      localStorage.removeItem('agroo_user_name');

      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
