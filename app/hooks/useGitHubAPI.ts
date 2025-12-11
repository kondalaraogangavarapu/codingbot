import { useQuery } from '@tanstack/react-query';
import { GitHubAPI } from '~/utils/api';
import { useAppSelector } from './redux';
import type { Repository, User } from '~/types';

export const useGitHubAPI = () => {
  const { token } = useAppSelector((state) => state.auth);
  
  if (!token) {
    throw new Error('No GitHub token available');
  }
  
  return new GitHubAPI(token);
};

export const useRepositories = () => {
  const { token, isAuthenticated } = useAppSelector((state) => state.auth);
  
  return useQuery<Repository[], Error>({
    queryKey: ['repositories'],
    queryFn: async () => {
      if (!token) throw new Error('No token available');
      const api = new GitHubAPI(token);
      return api.getAllRepositories();
    },
    enabled: isAuthenticated && !!token,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUser = () => {
  const { token, isAuthenticated } = useAppSelector((state) => state.auth);
  
  return useQuery<User, Error>({
    queryKey: ['user'],
    queryFn: async () => {
      if (!token) throw new Error('No token available');
      const api = new GitHubAPI(token);
      return api.getUser();
    },
    enabled: isAuthenticated && !!token,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};