import { useState, useEffect } from 'react';
import { githubAPI } from '../services/api';
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
      const repos = await githubAPI.getRepositories();
      setRepos(repos);
    } catch (err) {
      console.error('Error fetching repositories:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch repositories');
    } finally {
      setLoading(false);
    }
  };

  const fetchGitHubUser = async () => {
    if (!authenticated) return;

    try {
      const user = await githubAPI.getUserProfile();
      setGithubUser(user);
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