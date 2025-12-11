import { http, HttpResponse } from 'msw';
import type { Repository, User } from '~/types';

const mockUser: User = {
  id: '1',
  login: 'testuser',
  name: 'Test User',
  email: 'test@example.com',
  avatar_url: 'https://github.com/images/error/testuser_happy.gif',
  html_url: 'https://github.com/testuser',
  public_repos: 10,
  followers: 5,
  following: 3,
};

const mockRepositories: Repository[] = [
  {
    id: 1,
    name: 'test-repo',
    full_name: 'testuser/test-repo',
    description: 'A test repository',
    html_url: 'https://github.com/testuser/test-repo',
    clone_url: 'https://github.com/testuser/test-repo.git',
    ssh_url: 'git@github.com:testuser/test-repo.git',
    language: 'TypeScript',
    stargazers_count: 10,
    forks_count: 2,
    watchers_count: 8,
    size: 1024,
    default_branch: 'main',
    open_issues_count: 3,
    private: false,
    fork: false,
    archived: false,
    disabled: false,
    pushed_at: '2023-12-01T10:00:00Z',
    created_at: '2023-01-01T10:00:00Z',
    updated_at: '2023-12-01T10:00:00Z',
    owner: {
      login: 'testuser',
      avatar_url: 'https://github.com/images/error/testuser_happy.gif',
    },
  },
  {
    id: 2,
    name: 'another-repo',
    full_name: 'testuser/another-repo',
    description: 'Another test repository',
    html_url: 'https://github.com/testuser/another-repo',
    clone_url: 'https://github.com/testuser/another-repo.git',
    ssh_url: 'git@github.com:testuser/another-repo.git',
    language: 'JavaScript',
    stargazers_count: 5,
    forks_count: 1,
    watchers_count: 4,
    size: 512,
    default_branch: 'main',
    open_issues_count: 1,
    private: true,
    fork: false,
    archived: false,
    disabled: false,
    pushed_at: '2023-11-15T10:00:00Z',
    created_at: '2023-06-01T10:00:00Z',
    updated_at: '2023-11-15T10:00:00Z',
    owner: {
      login: 'testuser',
      avatar_url: 'https://github.com/images/error/testuser_happy.gif',
    },
  },
];

export const handlers = [
  // GitHub API handlers
  http.get('https://api.github.com/user', () => {
    return HttpResponse.json(mockUser);
  }),

  http.get('https://api.github.com/user/repos', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const perPage = parseInt(url.searchParams.get('per_page') || '30');
    
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedRepos = mockRepositories.slice(startIndex, endIndex);
    
    return HttpResponse.json(paginatedRepos);
  }),

  // Keycloak mock handlers (if needed for testing)
  http.post('http://localhost:8080/realms/github-realm/protocol/openid-connect/token', () => {
    return HttpResponse.json({
      access_token: 'mock-access-token',
      token_type: 'Bearer',
      expires_in: 3600,
      refresh_token: 'mock-refresh-token',
    });
  }),
];