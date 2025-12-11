# 🚀 GitHub Repository Viewer - Setup Instructions

## Overview

This application provides a simple UI for GitHub login and repository listing using:
- **Backend**: Node.js with Express.js
- **Frontend**: React 18 with Vite
- **Authentication**: Keycloak (OAuth2/OpenID Connect)
- **Containerization**: Docker with Docker Compose

## 🐳 Quick Start with Docker (Recommended)

### Prerequisites
- Docker and Docker Compose installed
- Git

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/kondalaraogangavarapu/codingbot.git
cd codingbot

# Quick setup with Docker
./scripts/docker-dev.sh setup
```

This command will:
- ✅ Check Docker installation
- ✅ Create environment configuration
- ✅ Build Docker images
- ✅ Start all services (app + Keycloak)
- ✅ Show access URLs

### 2. Access the Application

- **🌐 Main Application**: http://localhost:3001
- **🔐 Keycloak Admin Console**: http://localhost:8080/admin
  - Username: `admin`
  - Password: `admin123`

### 3. Configure GitHub Integration (Optional)

1. Create a GitHub Personal Access Token:
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Generate a new token with `repo` scope
   
2. Update environment:
   ```bash
   # Edit the environment file
   nano .env.docker.local
   
   # Add your GitHub token
   GITHUB_TOKEN=your_github_token_here
   
   # Restart services
   ./scripts/docker-dev.sh restart
   ```

## 🛠️ Manual Installation (Alternative)

### Prerequisites
- Node.js 18+
- npm
- Keycloak server running

### 1. Install Dependencies

```bash
# Install all dependencies
npm run install:all
```

### 2. Configure Environment

```bash
# Copy environment templates
cp server/.env.example server/.env
cp client/.env.example client/.env

# Edit server/.env with your configuration
```

### 3. Start Services

```bash
# Development mode (both frontend and backend)
npm run dev

# Or start separately
npm run server:dev  # Backend on http://localhost:3001
npm run client:dev  # Frontend on http://localhost:5173
```

## 🔧 Configuration

### Environment Variables

Key configuration options in `.env.docker.local`:

```bash
# Application
NODE_ENV=development
PORT=3001
SESSION_SECRET=your-strong-secret-key-here

# Keycloak Configuration
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=master
KEYCLOAK_CLIENT_ID=github-repo-viewer

# GitHub Integration (Optional)
GITHUB_TOKEN=your_github_personal_access_token

# Client Configuration
CLIENT_URL=http://localhost:3001
```

### Keycloak Setup

The Docker setup automatically configures Keycloak, but for manual setup:

1. Create a new client in Keycloak admin console
2. Set client ID to `github-repo-viewer`
3. Configure redirect URIs:
   - `http://localhost:3001/*`
   - `http://localhost:5173/*`
4. Enable "Standard Flow" and "Direct Access Grants"

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

## 🐳 Docker Commands

### Development
```bash
./scripts/docker-dev.sh setup     # Initial setup
./scripts/docker-dev.sh start     # Start services
./scripts/docker-dev.sh stop      # Stop services
./scripts/docker-dev.sh logs      # View logs
./scripts/docker-dev.sh status    # Check status
./scripts/docker-dev.sh cleanup   # Clean up
```

### Production
```bash
./scripts/docker-prod.sh setup    # Production setup
./scripts/docker-prod.sh deploy   # Deploy to production
./scripts/docker-prod.sh monitor  # Monitoring dashboard
./scripts/docker-prod.sh backup   # Create backup
```

## 🔍 Troubleshooting

### Common Issues

1. **Docker daemon not running**
   ```bash
   sudo systemctl start docker
   ```

2. **Port already in use**
   ```bash
   # Check what's using the port
   lsof -i :3001
   
   # Kill the process or change port in .env.docker.local
   ```

3. **Keycloak connection issues**
   - Verify Keycloak is running: `docker compose ps`
   - Check logs: `./scripts/docker-dev.sh logs keycloak`

4. **GitHub token issues**
   - Ensure token has `repo` scope
   - Check token is correctly set in environment

### Debug Mode

Enable debug logging:
```bash
# Add to .env.docker.local
DEBUG=app:*
LOG_LEVEL=debug
```

## 📚 Documentation

- **[DOCKER_SETUP.md](DOCKER_SETUP.md)**: Comprehensive Docker documentation
- **[README.md](README.md)**: Full project documentation
- **API Documentation**: Available at `/api/health` endpoint

## 🚀 Production Deployment

For production deployment:

1. Use the production Docker setup:
   ```bash
   ./scripts/docker-prod.sh setup
   ```

2. Configure production environment variables
3. Set up SSL certificates (handled by Nginx in production)
4. Configure domain names and firewall rules

## 🤝 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review logs: `./scripts/docker-dev.sh logs`
3. Verify configuration in `.env.docker.local`
4. Ensure all prerequisites are installed

---

**Happy coding! 🎉**