import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import keycloak from '~/utils/keycloak';
import { useAppDispatch } from '~/hooks/redux';
import { setLoading, setAuthenticated, setError, logout } from '~/store/authSlice';
import type { User } from '~/types';

interface KeycloakContextType {
  keycloak: typeof keycloak;
  initialized: boolean;
}

const KeycloakContext = createContext<KeycloakContextType | null>(null);

export const useKeycloak = () => {
  const context = useContext(KeycloakContext);
  if (!context) {
    throw new Error('useKeycloak must be used within a KeycloakProvider');
  }
  return context;
};

interface KeycloakProviderProps {
  children: ReactNode;
}

export const KeycloakProvider: React.FC<KeycloakProviderProps> = ({ children }) => {
  const [initialized, setInitialized] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const initKeycloak = async () => {
      if (!keycloak) {
        dispatch(setError('Keycloak not available'));
        setInitialized(true);
        return;
      }

      try {
        dispatch(setLoading(true));
        
        // Add timeout to prevent hanging
        const initPromise = keycloak.init({
          onLoad: 'check-sso',
          silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
          checkLoginIframe: false,
        });

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Keycloak initialization timeout')), 10000);
        });

        const authenticated = await Promise.race([initPromise, timeoutPromise]) as boolean;

        if (authenticated && keycloak.token) {
          // Fetch user info from GitHub API using the token
          const githubToken = keycloak.token;
          
          try {
            const response = await fetch('https://api.github.com/user', {
              headers: {
                'Authorization': `Bearer ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json',
              },
            });

            if (response.ok) {
              const userData = await response.json();
              const user: User = {
                id: userData.id.toString(),
                login: userData.login,
                name: userData.name,
                email: userData.email,
                avatar_url: userData.avatar_url,
                html_url: userData.html_url,
                public_repos: userData.public_repos,
                followers: userData.followers,
                following: userData.following,
              };

              dispatch(setAuthenticated({ user, token: githubToken }));
            } else {
              throw new Error('Failed to fetch user data from GitHub');
            }
          } catch (error) {
            console.error('Error fetching GitHub user data:', error);
            dispatch(setError('Failed to fetch user data from GitHub'));
          }
        } else {
          dispatch(logout());
        }

        setInitialized(true);
      } catch (error) {
        console.error('Keycloak initialization error:', error);
        dispatch(setError('Failed to initialize authentication'));
        setInitialized(true);
      }
    };

    initKeycloak();

    // Set up token refresh
    if (keycloak) {
      keycloak.onTokenExpired = () => {
        keycloak.updateToken(30).then((refreshed) => {
          if (refreshed) {
            console.log('Token refreshed');
          } else {
            console.log('Token not refreshed, valid for another 30 seconds');
          }
        }).catch(() => {
          console.log('Failed to refresh token');
          dispatch(logout());
        });
      };

      keycloak.onAuthLogout = () => {
        dispatch(logout());
      };
    }

  }, [dispatch]);

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <KeycloakContext.Provider value={{ keycloak, initialized }}>
      {children}
    </KeycloakContext.Provider>
  );
};