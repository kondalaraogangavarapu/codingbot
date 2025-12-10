import React from 'react';
import { KeycloakProvider, useKeycloak } from './hooks/useKeycloak.jsx';
import { useGitHub } from './hooks/useGitHub';
import LoginPage from './components/LoginPage';
import Header from './components/Header';
import RepositoryList from './components/RepositoryList';

const AppContent = () => {
  const { authenticated, loading: authLoading } = useKeycloak();
  const { repos, githubUser, loading: reposLoading, error, refreshRepos } = useGitHub();

  if (authLoading) {
    return (
      <div className="loading">
        <h2>Loading...</h2>
        <p>Initializing application...</p>
      </div>
    );
  }

  if (!authenticated) {
    return <LoginPage />;
  }

  return (
    <div className="container">
      <Header githubUser={githubUser} />
      <main>
        <RepositoryList 
          repos={repos}
          loading={reposLoading}
          error={error}
          onRefresh={refreshRepos}
        />
      </main>
    </div>
  );
};

const App = () => {
  return (
    <KeycloakProvider>
      <AppContent />
    </KeycloakProvider>
  );
};

export default App;