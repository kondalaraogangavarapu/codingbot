import React from 'react';
import { useKeycloak } from '../hooks/useKeycloak.jsx';

const Header = ({ githubUser }) => {
  const { user, logout } = useKeycloak();

  return (
    <header className="header">
      <div>
        <h1>🐙 GitHub Repository Viewer</h1>
        {githubUser && (
          <p style={{ margin: '5px 0', color: '#888', fontSize: '14px' }}>
            Connected to GitHub as @{githubUser.login}
          </p>
        )}
      </div>
      <div className="user-info">
        {user && (
          <>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 'bold' }}>
                {user.name || user.username}
              </div>
              {user.email && (
                <div style={{ fontSize: '12px', color: '#888' }}>
                  {user.email}
                </div>
              )}
            </div>
            {githubUser?.avatar_url && (
              <img 
                src={githubUser.avatar_url} 
                alt="Avatar" 
                className="avatar"
              />
            )}
            <button onClick={logout} className="logout-button">
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;