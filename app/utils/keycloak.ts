import Keycloak from 'keycloak-js';

const keycloakConfig = {
  url: typeof window !== 'undefined' ? (window as any).ENV?.KEYCLOAK_URL || 'http://localhost:8080' : 'http://localhost:8080',
  realm: typeof window !== 'undefined' ? (window as any).ENV?.KEYCLOAK_REALM || 'github-realm' : 'github-realm',
  clientId: typeof window !== 'undefined' ? (window as any).ENV?.KEYCLOAK_CLIENT_ID || 'github-client' : 'github-client',
};

let keycloak: Keycloak | null = null;

if (typeof window !== 'undefined') {
  keycloak = new Keycloak(keycloakConfig);
}

export default keycloak;