import Keycloak from 'keycloak-js';

// Keycloak configuration - can be moved to environment variables
const keycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'master',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'github-repo-viewer',
};

const keycloak = new Keycloak(keycloakConfig);

const initKeycloak = async () => {
  try {
    const authenticated = await keycloak.init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
      pkceMethod: 'S256',
      checkLoginIframe: false, // Disable iframe for GitHub integration
    });

    return { keycloak, authenticated };
  } catch (error) {
    console.error('Failed to initialize Keycloak:', error);
    throw error;
  }
};

const getKeycloak = () => keycloak;

const login = () => {
  if (keycloak) {
    keycloak.login();
  }
};

const loginWithGitHub = () => {
  if (keycloak) {
    keycloak.login({
      idpHint: 'github' // This tells Keycloak to use GitHub identity provider
    });
  }
};

const logout = () => {
  if (keycloak) {
    keycloak.logout();
  }
};

const getToken = () => {
  return keycloak?.token;
};

const isAuthenticated = () => {
  return keycloak?.authenticated || false;
};

const getUserInfo = () => {
  if (keycloak?.tokenParsed) {
    return {
      id: keycloak.tokenParsed.sub,
      username: keycloak.tokenParsed.preferred_username,
      email: keycloak.tokenParsed.email,
      name: keycloak.tokenParsed.name,
      firstName: keycloak.tokenParsed.given_name,
      lastName: keycloak.tokenParsed.family_name,
    };
  }
  return null;
};

const updateToken = async () => {
  try {
    const refreshed = await keycloak.updateToken(30);
    return refreshed;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    return false;
  }
};

export {
  initKeycloak,
  getKeycloak,
  login,
  loginWithGitHub,
  logout,
  getToken,
  isAuthenticated,
  getUserInfo,
  updateToken,
};

export default keycloak;