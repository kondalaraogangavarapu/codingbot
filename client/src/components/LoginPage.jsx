import React from 'react';
import { useKeycloak } from '../hooks/useKeycloak.jsx';
import { loginWithGitHub } from '../services/keycloak';

const LoginPage = () => {
  const { login, loading, error } = useKeycloak();

  if (loading) {
    return (
      <div className="login-container">
        <div className="loading">
          <h2>Initializing authentication...</h2>
          <p>Please wait while we set up your session.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="login-container">
        <div className="error">
          <h2>Authentication Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="login-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <h1>GitHub Repository Viewer</h1>
      <p>Welcome! Please log in to view your GitHub repositories.</p>
      <div className="card">
        <h2>🔐 GitHub Authentication</h2>
        <p>
          This application uses Keycloak with GitHub integration for secure authentication.
          Once logged in, you'll be able to view and manage your GitHub repositories.
        </p>
        <button onClick={loginWithGitHub} className="login-button github-login">
          🐙 Login with GitHub
        </button>
        <button onClick={login} className="login-button keycloak-login">
          🔐 Login with Keycloak
        </button>
      </div>
      <div className="card">
        <h3>Features:</h3>
        <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
          <li>🔒 Secure Keycloak authentication</li>
          <li>📂 View your GitHub repositories</li>
          <li>⭐ See repository statistics</li>
          <li>🔍 Repository details and links</li>
          <li>📱 Responsive design</li>
        </ul>
      </div>
    </div>
  );
};

export default LoginPage;