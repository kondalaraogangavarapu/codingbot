import Keycloak from 'keycloak-js';

let keycloak = null;

const initKeycloak = async () => {
  try {
    // Get Keycloak configuration from backend
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/keycloak-config`);
    const config = await response.json();

    keycloak = new Keycloak({
      url: config.url,
      realm: config.realm,
      clientId: config.clientId,
    });

    const authenticated = await keycloak.init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
      pkceMethod: 'S256',
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
  logout,
  getToken,
  isAuthenticated,
  getUserInfo,
  updateToken,
};