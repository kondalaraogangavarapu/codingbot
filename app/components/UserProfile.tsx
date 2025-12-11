import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '~/hooks/redux';
import { useKeycloak } from './KeycloakProvider';

export const UserProfile: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);
  const { keycloak } = useKeycloak();

  const handleLogout = () => {
    if (keycloak) {
      keycloak.logout();
    }
  };

  if (!user) return null;

  return (
    <div className="card p-6 mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src={user.avatar_url}
            alt={user.name || user.login}
            className="w-16 h-16 rounded-full border-2 border-gray-200"
          />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {t('auth.welcome', { name: user.name || user.login })}
            </h2>
            <p className="text-gray-600">@{user.login}</p>
            <div className="flex gap-4 mt-2 text-sm text-gray-500">
              <span>{user.public_repos} repositories</span>
              <span>{user.followers} followers</span>
              <span>{user.following} following</span>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="btn-secondary"
        >
          {t('auth.logout')}
        </button>
      </div>
    </div>
  );
};