# 🚀 GitHub Repository Viewer with Keycloak Authentication

A frontend-only web application that uses Keycloak with GitHub identity provider to authenticate users and directly access GitHub repositories. No backend required!

## ✨ Features

- **🔐 GitHub OAuth via Keycloak**: Direct GitHub authentication through Keycloak identity provider
- **📱 Modern React UI**: Clean, responsive interface built with React 18
- **🔗 Direct GitHub API**: Frontend directly calls GitHub APIs using tokens from Keycloak
- **🚀 Fast Development**: Vite for lightning-fast frontend development
- **🐳 Simple Deployment**: Single container with nginx serving static files

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Keycloak JS
- **Authentication**: Keycloak with GitHub Identity Provider
- **API**: Direct GitHub REST API calls
- **Deployment**: Docker with nginx

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Keycloak running on localhost:8080 with GitHub identity provider configured

### 1. Clone and Run

```bash
# Clone the repository
git clone https://github.com/kondalaraogangavarapu/codingbot.git
cd codingbot

# Build and run with Docker
docker compose up --build
```

### 2. Access the Application

- **🌐 Main Application**: http://localhost:3001

### 3. Keycloak Configuration Required

Your Keycloak must be configured with:

#### Client Configuration:
- **Client ID**: `github-repo-viewer`
- **Client Type**: Public
- **Valid Redirect URIs**: `http://localhost:3001/*`
- **Web Origins**: `http://localhost:3001`
- **Standard Flow**: Enabled

#### GitHub Identity Provider:
- **Provider**: GitHub
- **Client ID**: Your GitHub OAuth App Client ID
- **Client Secret**: Your GitHub OAuth App Client Secret
- **Default Scopes**: `repo user:email`

## 📱 Usage

1. **Login**: Click "🐙 Login with GitHub" to authenticate via Keycloak's GitHub provider
2. **View Repositories**: Your GitHub repositories will be displayed after login
3. **Repository Details**: Each card shows:
   - Repository name and description
   - Programming language
   - Stars and forks count
   - Last updated date
   - Clone URL
   - Public/Private status

## 🔧 Configuration

### Frontend Environment Variables

Edit `client/.env` to configure:

```bash
# Keycloak Configuration
VITE_KEYCLOAK_URL=http://localhost:8080
VITE_KEYCLOAK_REALM=master
VITE_KEYCLOAK_CLIENT_ID=github-repo-viewer
```

### Keycloak Setup Steps

1. **Create GitHub OAuth App**:
   - Go to GitHub Settings > Developer settings > OAuth Apps
   - Create new OAuth App
   - Authorization callback URL: `http://localhost:8080/realms/master/broker/github/endpoint`

2. **Configure Keycloak GitHub Identity Provider**:
   - Login to Keycloak admin console
   - Go to Identity Providers > Add provider > GitHub
   - Enter your GitHub OAuth App credentials
   - Set default scopes: `repo user:email`

3. **Create Keycloak Client**:
   - Go to Clients > Create client
   - Client ID: `github-repo-viewer`
   - Client type: Public
   - Valid redirect URIs: `http://localhost:3001/*`
   - Web origins: `http://localhost:3001`

## 🐳 Docker Commands

```bash
# Build and start
docker compose up --build

# Run in background
docker compose up -d --build

# Stop services
docker compose down

# View logs
docker compose logs -f
```

## 🔍 Troubleshooting

1. **Keycloak connection issues**: Verify Keycloak is running on localhost:8080
2. **GitHub authentication fails**: Check GitHub OAuth App configuration and Keycloak identity provider setup
3. **CORS issues**: Ensure web origins are properly configured in Keycloak client
4. **Port conflicts**: Make sure port 3001 is available

## 🏗️ Architecture

This is a **frontend-only** application that:
- Uses Keycloak as an authentication proxy to GitHub
- Gets GitHub access tokens through Keycloak's token exchange
- Makes direct API calls to GitHub from the browser
- Requires no backend service or database

---

**Happy coding! 🎉**