import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useKeycloak } from './useKeycloak.jsx';

export const useGitHub = () => {
  const { authenticated } = useKeycloak();
  const [repos, setRepos] = useState([]);
  const [githubUser, setGithubUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRepos = async () => {
    if (!authenticated) return;

    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getRepos();
      setRepos(response.data.repos);
    } catch (err) {
      console.error('Error fetching repositories:', err);
      setError(err.response?.data?.error || 'Failed to fetch repositories');
    } finally {
      setLoading(false);
    }
  };

  const fetchGitHubUser = async () => {
    if (!authenticated) return;

    try {
      const response = await apiService.getGitHubUser();
      setGithubUser(response.data.githubUser);
    } catch (err) {
      console.error('Error fetching GitHub user:', err);
      // Don't set error for GitHub user fetch as it's optional
    }
  };

  useEffect(() => {
    if (authenticated) {
      fetchRepos();
      fetchGitHubUser();
    }
  }, [authenticated]);

  const refreshRepos = () => {
    fetchRepos();
  };

  return {
    repos,
    githubUser,
    loading,
    error,
    refreshRepos,
  };
};