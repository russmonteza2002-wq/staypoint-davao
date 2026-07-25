/**
 * Centralized Axios HTTP API Client Instance
 * 
 * Configures the base URL for communicating with the backend REST API server.
 * Includes request interceptors to automatically attach JWT Bearer tokens
 * and response interceptors to handle 401 Unauthorized errors globally.
 */

import axios from 'axios';

// Live production backend REST API URL on Render.com
const PRODUCTION_API_URL = 'https://staypoint-davao.onrender.com/api/v1';

// Base URL selection:
// 1. Uses VITE_API_URL environment variable if explicitly configured.
// 2. In production builds, falls back to the live Render API URL.
// 3. In local development, proxies through Vite to '/api/v1'.
const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? PRODUCTION_API_URL : '/api/v1');

// Create configured Axios instance
export const apiClient = axios.create({
  baseURL: BASE_URL,
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
 * Intercepts incoming API responses. If a 401 Unauthorized response is received,
 * it automatically clears the invalid/expired token from localStorage.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stored JWT token when session is invalid or expired
      localStorage.removeItem('admin_token');
    }
    return Promise.reject(error);
  }
);
