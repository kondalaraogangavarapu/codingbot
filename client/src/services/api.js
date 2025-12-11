import axios from 'axios';
import keycloak from './keycloak';

// GitHub API base URL
const GITHUB_API_BASE_URL = 'https://api.github.com';

// Create axios instance for GitHub API
const githubApi = axios.create({
  baseURL: GITHUB_API_BASE_URL,
});

// Function to get GitHub token from Keycloak
const getGitHubToken = () => {
  if (keycloak.authenticated && keycloak.tokenParsed) {
    // The GitHub token should be available in the Keycloak token
    // This depends on how Keycloak is configured with GitHub identity provider
    return keycloak.token;
  }
  return null;
};

// Request interceptor to add GitHub token
githubApi.interceptors.request.use(
  async (config) => {
    const token = getGitHubToken();
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
githubApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshed = await keycloak.updateToken(30);
        if (refreshed) {
          const token = getGitHubToken();
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return githubApi(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        keycloak.login();
      }
    }

    return Promise.reject(error);
  }
);

// GitHub API methods
export const githubAPI = {
  // Get user repositories
  getRepositories: async () => {
    try {
      const response = await githubApi.get('/user/repos', {
        params: {
          sort: 'updated',
          per_page: 100,
          type: 'all'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching repositories:', error);
      throw error;
    }
  },

  // Get user profile
  getUserProfile: async () => {
    try {
      const response = await githubApi.get('/user');
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  // Get repository details
  getRepository: async (owner, repo) => {
    try {
      const response = await githubApi.get(`/repos/${owner}/${repo}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching repository details:', error);
      throw error;
    }
  }
};

export default githubAPI;