# GitHub Repository Viewer

A modern single-page application built with Remix SPA mode that allows users to authenticate with GitHub via Keycloak and view their repositories.

## Tech Stack

- **Remix SPA Mode** - React framework with Vite
- **TypeScript** - Type safety
- **Redux Toolkit** - State management
- **TanStack Query** - Server state management
- **Tailwind CSS** - Styling
- **i18next** - Internationalization
- **Keycloak** - OpenID Connect authentication
- **Vitest** - Testing framework
- **React Testing Library** - Component testing
- **Mock Service Worker** - API mocking

## Features

- 🔐 GitHub authentication via Keycloak OpenID Connect
- 📚 Repository listing with search and filtering
- 🌍 Multi-language support (English/Spanish)
- 📱 Responsive design
- ⚡ Fast and modern UI
- 🧪 Comprehensive testing setup

## Prerequisites

1. **Keycloak Server** - You need a running Keycloak instance
2. **GitHub OAuth App** - Configured in Keycloak as an identity provider

## Keycloak Setup

### 1. Install and Run Keycloak

```bash
# Using Docker
docker run -p 8080:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak:latest start-dev
```

### 2. Create Realm

1. Access Keycloak Admin Console at `http://localhost:8080`
2. Login with admin/admin
3. Create a new realm called `github-realm`

### 3. Configure GitHub Identity Provider

1. Go to Identity Providers → Add provider → GitHub
2. Set up GitHub OAuth App:
   - Go to GitHub Settings → Developer settings → OAuth Apps
   - Create new OAuth App with:
     - Authorization callback URL: `http://localhost:8080/realms/github-realm/broker/github/endpoint`
3. Copy Client ID and Client Secret to Keycloak GitHub provider configuration

### 4. Create Client

1. Go to Clients → Create client
2. Set Client ID: `github-client`
3. Set Client type: `Public`
4. Set Valid redirect URIs: `http://localhost:12000/*`
5. Set Web origins: `http://localhost:12000`

## Installation

1. **Clone and install dependencies:**

```bash
git clone <repository-url>
cd github-repo-viewer
npm install
```

2. **Environment Configuration:**

```bash
cp .env.example .env
```

Edit `.env` with your Keycloak configuration:

```env
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=github-realm
KEYCLOAK_CLIENT_ID=github-client
```

3. **Start the development server:**

```bash
npm run dev
```

The application will be available at `http://localhost:12000`

## Current Deployment

The application is currently built and running at:
- **Development URL**: https://work-2-fqgbktexsqeycpvh.prod-runtime.all-hands.dev
- **Local Server**: http://localhost:8080 (serving built static files)

To access the running application, visit the development URL above.

## Usage

1. Open the application in your browser
2. Click "Login with GitHub"
3. You'll be redirected to Keycloak, then to GitHub for authentication
4. After successful authentication, you'll see your GitHub repositories
5. Use the search and filter features to find specific repositories

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Lint code
- `npm run typecheck` - Type checking

### Testing

The project includes comprehensive testing setup:

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test -- --watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### Project Structure

```
app/
├── components/          # React components
│   ├── __tests__/      # Component tests
│   ├── KeycloakProvider.tsx
│   ├── LoginButton.tsx
│   ├── UserProfile.tsx
│   └── RepositoryList.tsx
├── hooks/              # Custom hooks
│   ├── redux.ts
│   └── useGitHubAPI.ts
├── locales/            # i18n translations
│   ├── en/
│   └── es/
├── routes/             # Remix routes
│   └── _index.tsx
├── store/              # Redux store
│   ├── index.ts
│   └── authSlice.ts
├── test/               # Test utilities
│   ├── mocks/
│   ├── setup.ts
│   └── utils.tsx
├── types/              # TypeScript types
│   └── index.ts
├── utils/              # Utility functions
│   ├── api.ts
│   ├── i18n.ts
│   └── keycloak.ts
├── entry.client.tsx
├── entry.server.tsx
├── root.tsx
└── tailwind.css
```

## Configuration

### Keycloak Configuration

The application expects the following Keycloak configuration:

- **Realm**: `github-realm`
- **Client ID**: `github-client`
- **Client Type**: Public
- **GitHub Identity Provider**: Configured with GitHub OAuth App

### Environment Variables

- `KEYCLOAK_URL` - Keycloak server URL
- `KEYCLOAK_REALM` - Keycloak realm name
- `KEYCLOAK_CLIENT_ID` - Keycloak client ID

## Troubleshooting

### Common Issues

1. **Authentication fails**
   - Verify Keycloak is running and accessible
   - Check GitHub OAuth App configuration
   - Ensure redirect URIs match

2. **Repositories not loading**
   - Check browser console for API errors
   - Verify GitHub token has proper scopes
   - Check network connectivity

3. **Build errors**
   - Clear node_modules and reinstall
   - Check TypeScript errors
   - Verify all dependencies are installed

### Debug Mode

Enable debug logging by setting localStorage:

```javascript
localStorage.setItem('debug', 'keycloak:*');
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run tests and linting
6. Submit a pull request

## License

MIT License - see LICENSE file for details