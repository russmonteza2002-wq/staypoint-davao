/**
 * Centralized Axios HTTP API Client Instance
 * 
 * Configures the base URL for communicating with the backend REST API server.
 * Includes request interceptors to attach JWT Bearer tokens and credentials,
 * and response interceptors to perform silent token refresh via HttpOnly cookies.
 */

import axios from 'axios';

// Live production backend REST API URL on Render.com
const PRODUCTION_API_URL = 'https://staypoint-davao.onrender.com/api/v1';

// Base URL selection
const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? PRODUCTION_API_URL : '/api/v1');

// Create configured Axios instance with credentials support
export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Axios Request Interceptor
 * Automatically retrieves the admin JWT token from browser localStorage
 * and attaches it to the Authorization header as 'Bearer <token>'.
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Axios Response Interceptor
 * Automatically performs silent HttpOnly cookie token refresh on 401 Unauthorized errors.
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;
      try {
        const refreshRes = await apiClient.post('/auth/refresh');
        const newToken = refreshRes.data.data?.accessToken;
        if (newToken) {
          localStorage.setItem('admin_token', newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('admin_token');
        window.dispatchEvent(new CustomEvent('session_expired'));
      }
    } else if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.dispatchEvent(new CustomEvent('session_expired'));
    }

    return Promise.reject(error);
  }
);
