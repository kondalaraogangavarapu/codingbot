import React from 'react';

const RepositoryCard = ({ repo }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="repo-card">
      <div className="repo-name">
        <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
          {repo.name}
        </a>
        {repo.private && (
          <span style={{ 
            marginLeft: '8px', 
            fontSize: '12px', 
            background: '#f44336', 
            color: 'white', 
            padding: '2px 6px', 
            borderRadius: '3px' 
          }}>
            Private
          </span>
        )}
      </div>
      
      {repo.description && (
        <div className="repo-description">
          {repo.description}
        </div>
      )}
      
      {repo.language && (
        <div className="repo-language">
          {repo.language}
        </div>
      )}
      
      <div className="repo-stats">
        <span>⭐ {repo.stargazers_count}</span>
        <span>🍴 {repo.forks_count}</span>
        <span>📅 Updated {formatDate(repo.updated_at)}</span>
      </div>
      
      <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
        <a 
          href={repo.clone_url} 
          style={{ color: '#646cff', textDecoration: 'none' }}
          title="Clone URL"
        >
          📋 {repo.clone_url}
        </a>
      </div>
    </div>
  );
};

const RepositoryList = ({ repos, loading, error, onRefresh }) => {
  if (loading) {
    return (
      <div className="loading">
        <h2>Loading repositories...</h2>
        <p>Fetching your GitHub repositories, please wait.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <h2>Error Loading Repositories</h2>
        <p>{error}</p>
        <button onClick={onRefresh} className="login-button">
          Try Again
        </button>
        <div style={{ marginTop: '15px', fontSize: '14px' }}>
          <p><strong>Possible solutions:</strong></p>
          <ul style={{ textAlign: 'left', maxWidth: '500px', margin: '0 auto' }}>
            <li>Make sure you have a GitHub token configured in your Keycloak profile</li>
            <li>Verify that your GitHub token has the necessary permissions</li>
            <li>Check if your GitHub token is still valid</li>
            <li>Contact your administrator if the issue persists</li>
          </ul>
        </div>
      </div>
    );
  }

  if (!repos || repos.length === 0) {
    return (
      <div className="loading">
        <h2>No Repositories Found</h2>
        <p>
          No GitHub repositories were found. This could mean:
        </p>
        <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '20px auto' }}>
          <li>You don't have any repositories yet</li>
          <li>Your GitHub token doesn't have access to your repositories</li>
          <li>Your GitHub token needs to be configured in Keycloak</li>
        </ul>
        <button onClick={onRefresh} className="login-button">
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <h2>Your Repositories ({repos.length})</h2>
        <button onClick={onRefresh} className="login-button">
          🔄 Refresh
        </button>
      </div>
      
      <div className="repos-grid">
        {repos.map((repo) => (
          <RepositoryCard key={repo.id} repo={repo} />
        ))}
      </div>
    </div>
  );
};

export default RepositoryList;