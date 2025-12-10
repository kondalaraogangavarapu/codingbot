import { useState, useEffect, createContext, useContext } from 'react';
import { initKeycloak, login, logout, isAuthenticated, getUserInfo } from '../services/keycloak';

const KeycloakContext = createContext();

export const KeycloakProvider = ({ children }) => {
  const [keycloakInitialized, setKeycloakInitialized] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeKeycloak = async () => {
      try {
        setLoading(true);
        const { keycloak, authenticated } = await initKeycloak();
        
        setKeycloakInitialized(true);
        setAuthenticated(authenticated);
        
        if (authenticated) {
          const userInfo = getUserInfo();
          setUser(userInfo);
        }

        // Set up token refresh
        if (keycloak) {
          setInterval(() => {
            keycloak.updateToken(70).then((refreshed) => {
              if (refreshed) {
                console.log('Token refreshed');
              }
            }).catch(() => {
              console.log('Failed to refresh token');
            });
          }, 60000);
        }
      } catch (err) {
        console.error('Keycloak initialization failed:', err);
        setError('Failed to initialize authentication');
      } finally {
        setLoading(false);
      }
    };

    initializeKeycloak();
  }, []);

  const handleLogin = () => {
    login();
  };

  const handleLogout = () => {
    logout();
  };

  const value = {
    keycloakInitialized,
    authenticated,
    user,
    loading,
    error,
    login: handleLogin,
    logout: handleLogout,
  };

  return (
    <KeycloakContext.Provider value={value}>
      {children}
    </KeycloakContext.Provider>
  );
};

export const useKeycloak = () => {
  const context = useContext(KeycloakContext);
  if (!context) {
    throw new Error('useKeycloak must be used within a KeycloakProvider');
  }
  return context;
};