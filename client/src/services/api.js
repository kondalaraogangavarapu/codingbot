import axios from 'axios';
import { getToken, updateToken } from './keycloak';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshed = await updateToken();
        if (refreshed) {
          const token = getToken();
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Redirect to login or handle as needed
        window.location.reload();
      }
    }

    return Promise.reject(error);
  }
);

// API methods
export const apiService = {
  // Health check
  health: () => api.get('/api/health'),

  // User info
  getUser: () => api.get('/api/user'),

  // GitHub repositories
  getRepos: () => api.get('/api/repos'),

  // GitHub user info
  getGitHubUser: () => api.get('/api/github/user'),
};

export default api;