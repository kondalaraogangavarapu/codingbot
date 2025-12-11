import type { Repository, User } from '~/types';

const GITHUB_API_BASE = 'https://api.github.com';

export class GitHubAPI {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async request<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getUser(): Promise<User> {
    return this.request<User>('/user');
  }

  async getRepositories(page = 1, perPage = 30): Promise<Repository[]> {
    return this.request<Repository[]>(`/user/repos?sort=updated&per_page=${perPage}&page=${page}`);
  }

  async getAllRepositories(): Promise<Repository[]> {
    const allRepos: Repository[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const repos = await this.getRepositories(page, 100);
      allRepos.push(...repos);
      
      if (repos.length < 100) {
        hasMore = false;
      } else {
        page++;
      }
    }

    return allRepos;
  }
}