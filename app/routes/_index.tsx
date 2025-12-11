import type { MetaFunction } from "@remix-run/node";
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '~/hooks/redux';
import { LoginButton } from '~/components/LoginButton';
import { UserProfile } from '~/components/UserProfile';
import { RepositoryList } from '~/components/RepositoryList';

export const meta: MetaFunction = () => {
  return [
    { title: "GitHub Repository Viewer" },
    { name: "description", content: "View and manage your GitHub repositories with Keycloak authentication" },
  ];
};

export default function Index() {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('app.title')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('app.subtitle')}
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="card p-4 mb-8 border-l-4 border-red-500 bg-red-50">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!isAuthenticated ? (
          <div className="text-center">
            <div className="card p-12 max-w-md mx-auto">
              <div className="mb-8">
                <svg className="w-20 h-20 mx-auto text-gray-400 mb-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                </svg>
                <p className="text-gray-600 mb-8">
                  Sign in with your GitHub account to view and manage your repositories.
                </p>
              </div>
              <LoginButton />
            </div>
          </div>
        ) : (
          <div>
            <UserProfile />
            <RepositoryList />
          </div>
        )}

        {/* Language Switcher */}
        <div className="fixed bottom-4 right-4">
          <div className="card p-2">
            <select
              onChange={(e) => {
                const { i18n } = require('react-i18next');
                i18n.changeLanguage(e.target.value);
              }}
              className="text-sm border-none bg-transparent focus:ring-0"
              defaultValue="en"
            >
              <option value="en">🇺🇸 English</option>
              <option value="es">🇪🇸 Español</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}