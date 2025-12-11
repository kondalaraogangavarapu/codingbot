# 🚀 GitHub Repository Viewer with Keycloak Authentication

A simple web application that allows users to authenticate via Keycloak and view their GitHub repositories. Built with React, Express.js, and Keycloak integration.

## ✨ Features

- **🔐 Keycloak Authentication**: Secure OAuth2/OpenID Connect authentication
- **📱 Modern React UI**: Clean, responsive interface built with React 18
- **🔗 GitHub Integration**: View and manage your GitHub repositories
- **🚀 Fast Development**: Vite for lightning-fast frontend development

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js, Keycloak Node.js Adapter
- **Frontend**: React 18, Vite, Keycloak JS
- **Authentication**: Keycloak (OAuth2/OpenID Connect)
- **Containerization**: Docker

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Keycloak running on localhost:8080

### 1. Clone and Run

```bash
# Clone the repository
git clone https://github.com/kondalaraogangavarapu/codingbot.git
cd codingbot

# Optional: Add your GitHub token to .env file
# GITHUB_TOKEN=your_github_token_here

# Build and run with Docker
docker compose up --build
```

### 2. Access the Application

- **🌐 Main Application**: http://localhost:3001

### 3. Keycloak Configuration

Make sure your Keycloak has a client configured with:
- **Client ID**: `github-repo-viewer`
- **Valid Redirect URIs**: `http://localhost:3001/*`
- **Web Origins**: `http://localhost:3001`

## 📱 Usage

1. **Login**: Click "Login with Keycloak" to authenticate
2. **View Repositories**: Your GitHub repositories will be displayed after login
3. **Repository Details**: Each card shows:
   - Repository name and description
   - Programming language
   - Stars and forks count
   - Last updated date
   - Clone URL
   - Public/Private status

## 🔧 Configuration

### Environment Variables

Edit the `.env` file to configure:

```bash
# GitHub Personal Access Token (optional)
# Get one from: https://github.com/settings/tokens
# Required scopes: repo
GITHUB_TOKEN=your_github_token_here

# Session secret (change this in production)
SESSION_SECRET=your-secret-key-here
```

### Keycloak Setup

1. Create a new client in Keycloak admin console
2. Set client ID to `github-repo-viewer`
3. Configure redirect URIs: `http://localhost:3001/*`
4. Set web origins: `http://localhost:3001`
5. Enable "Standard Flow" and "Direct Access Grants"

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
2. **GitHub token issues**: Ensure token has `repo` scope
3. **Port conflicts**: Make sure port 3001 is available

---

**Happy coding! 🎉**