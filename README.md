# GitHub Repository Viewer with Keycloak Authentication

A modern web application that allows users to authenticate via Keycloak and view their GitHub repositories. Built with Node.js, Express, React, and Vite.

## Features

- 🔐 **Secure Authentication**: Uses Keycloak for enterprise-grade authentication
- 📂 **GitHub Integration**: View and manage your GitHub repositories
- ⭐ **Repository Details**: See stars, forks, languages, and last updated dates
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🔄 **Real-time Updates**: Refresh repository data on demand
- 🎨 **Modern UI**: Clean and intuitive user interface

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Keycloak Connect** - Authentication middleware
- **Axios** - HTTP client for API calls

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Keycloak JS** - Frontend authentication adapter
- **Axios** - HTTP client

## Prerequisites

Before running this application, make sure you have:

1. **Node.js** (v18 or higher)
2. **npm** (comes with Node.js)
3. **Keycloak Server** running and configured
4. **GitHub Personal Access Token** (optional, can be configured per user)

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd github-repo-viewer-keycloak
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install all dependencies (root, server, and client)
npm run install:all
```

### 3. Configure Environment Variables

#### Server Configuration
Copy the server environment template:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Server Configuration
PORT=3001
CLIENT_URL=http://localhost:5173
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# Keycloak Configuration
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=your-realm-name
KEYCLOAK_CLIENT_ID=github-repo-viewer

# GitHub Configuration (Optional)
GITHUB_TOKEN=your-github-personal-access-token
```

#### Client Configuration
Copy the client environment template:
```bash
cp client/.env.example client/.env
```

Edit `client/.env`:
```env
VITE_API_URL=http://localhost:3001
```

### 4. Keycloak + GitHub Setup

#### Recommended: GitHub as Identity Provider (Best Experience)

For the best user experience, configure GitHub as an identity provider in Keycloak. This allows users to log in with their GitHub accounts and automatically provides GitHub API access.

**📖 See [KEYCLOAK_GITHUB_SETUP.md](./KEYCLOAK_GITHUB_SETUP.md) for detailed setup instructions.**

**Quick Setup:**
1. Create GitHub OAuth App with callback: `http://localhost:8080/realms/YOUR_REALM/broker/github/endpoint`
2. Add GitHub as Identity Provider in Keycloak
3. Configure token storage and mappers
4. Users can now login with GitHub and get automatic repository access!

#### Alternative: Manual Keycloak Client Setup

If you prefer not to use GitHub as an identity provider:

1. Log in to your Keycloak Admin Console
2. Select your realm (or create a new one)
3. Go to **Clients** → **Create Client**
4. Configure the client:
   - **Client ID**: `github-repo-viewer`
   - **Client Type**: `OpenID Connect`
   - **Client authentication**: `Off` (public client)
5. Set **Valid redirect URIs**: `http://localhost:5173/*`
6. Set **Web origins**: `http://localhost:5173`

### 5. GitHub Token Setup

#### Option A: GitHub Identity Provider (Recommended ⭐)
- Users log in with GitHub through Keycloak
- GitHub tokens are automatically obtained and stored
- No manual token configuration needed!

#### Option B: Global Token (Simpler)
Set `GITHUB_TOKEN` in your server `.env` file with a GitHub personal access token.

#### Option C: Per-User Tokens
1. Each user sets their GitHub token in their Keycloak profile
2. Go to Keycloak Account Console → Personal Info → Attributes
3. Add attribute: `github_token` with their personal access token

## Running the Application

### Development Mode

Start both server and client in development mode:
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:3001`
- Frontend client on `http://localhost:5173`

### Individual Services

Start only the server:
```bash
npm run server:dev
```

Start only the client:
```bash
npm run client:dev
```

### Production Mode

Build the client:
```bash
npm run build
```

Start the server:
```bash
npm start
```

## Usage

1. **Access the Application**: Open `http://localhost:5173` in your browser
2. **Login**: Click "Login with Keycloak" to authenticate
3. **View Repositories**: Once authenticated, your GitHub repositories will be displayed
4. **Repository Details**: Each repository card shows:
   - Repository name and description
   - Programming language
   - Stars and forks count
   - Last updated date
   - Clone URL
   - Public/Private status

## API Endpoints

### Authentication
- `GET /api/keycloak-config` - Get Keycloak configuration
- `GET /api/user` - Get current user info (requires auth)

### GitHub Integration
- `GET /api/repos` - Get user's GitHub repositories (requires auth)
- `GET /api/github/user` - Get GitHub user info (requires auth)

### Utility
- `GET /api/health` - Health check endpoint

## Troubleshooting

### Common Issues

1. **"GitHub token not found" error**
   - Make sure you've configured a GitHub token either globally or per-user
   - Verify the token has the necessary permissions (`repo` scope)

2. **Keycloak connection issues**
   - Check that Keycloak server is running
   - Verify the Keycloak URL, realm, and client ID in your configuration
   - Ensure redirect URIs are correctly configured in Keycloak

3. **CORS errors**
   - Make sure the client URL is correctly set in server configuration
   - Verify web origins are configured in Keycloak client settings

4. **Token refresh issues**
   - Check that your Keycloak client is configured as a public client
   - Verify token refresh settings in Keycloak

### Debug Mode

Enable debug logging by setting environment variables:
```bash
DEBUG=* npm run dev
```

## Security Considerations

- Always use HTTPS in production
- Set secure session secrets
- Configure proper CORS origins
- Use environment variables for sensitive data
- Regularly rotate GitHub tokens
- Configure proper Keycloak security policies

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Review the Keycloak and GitHub API documentation
3. Open an issue in the repository