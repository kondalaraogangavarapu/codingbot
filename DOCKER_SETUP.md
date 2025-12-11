# 🐳 Docker Setup Guide for GitHub Repository Viewer

This guide provides comprehensive instructions for running the GitHub Repository Viewer application using Docker.

## 📋 Prerequisites

- Docker Engine 20.10+ installed
- Docker Compose 2.0+ installed
- At least 2GB of available RAM
- Ports 3001, 8080, and optionally 80/443 available

## 🚀 Quick Start

### 1. Clone and Navigate to Project
```bash
git clone <your-repo-url>
cd codingbot
```

### 2. Configure Environment Variables
```bash
# Copy the example environment file
cp .env.docker .env.docker.local

# Edit the environment file with your actual values
nano .env.docker.local
```

### 3. Start the Application
```bash
# Start all services
docker-compose --env-file .env.docker.local up -d

# Or start with logs visible
docker-compose --env-file .env.docker.local up
```

### 4. Access the Application
- **Main Application**: http://localhost:3001
- **Keycloak Admin**: http://localhost:8080/admin (admin/admin123)
- **With Nginx**: http://localhost (if using production profile)

## 🔧 Configuration

### Environment Variables

Edit `.env.docker.local` with your actual values:

#### Required Configuration
```bash
# Session secret (generate a strong random string)
SESSION_SECRET=your-super-secret-session-key-min-32-characters-long

# GitHub Personal Access Token (optional but recommended)
GITHUB_TOKEN=ghp_your_actual_github_token_here

# Keycloak configuration
KEYCLOAK_REALM=github-repo-viewer
KEYCLOAK_CLIENT_ID=github-repo-viewer-app
```

#### Optional Configuration
```bash
# Custom ports
PORT=3001
CLIENT_URL=http://localhost:3001

# Logging
LOG_LEVEL=info
DEBUG=false

# Security
RATE_LIMIT_REQUESTS=100
JWT_EXPIRATION=3600
```

### Keycloak Setup

After starting the containers, configure Keycloak:

1. **Access Keycloak Admin Console**
   ```
   URL: http://localhost:8080/admin
   Username: admin
   Password: admin123
   ```

2. **Create Realm**
   - Click "Create Realm"
   - Name: `github-repo-viewer`
   - Click "Create"

3. **Create Client**
   - Go to "Clients" → "Create client"
   - Client ID: `github-repo-viewer-app`
   - Client type: `OpenID Connect`
   - Click "Next"
   - Enable "Client authentication"
   - Valid redirect URIs: `http://localhost:3001/*`
   - Web origins: `http://localhost:3001`
   - Click "Save"

4. **Configure GitHub Identity Provider** (Recommended)
   - Follow the detailed guide in `KEYCLOAK_GITHUB_SETUP.md`

## 🏗️ Build Options

### Development Build
```bash
# Build and run in development mode
docker-compose -f docker-compose.yml up --build
```

### Production Build
```bash
# Build for production with Nginx
docker-compose --profile production up --build -d
```

### Custom Build
```bash
# Build only the application image
docker build -t github-repo-viewer .

# Run with custom settings
docker run -d \
  --name github-repo-viewer \
  --env-file .env.docker.local \
  -p 3001:3001 \
  github-repo-viewer
```

## 📊 Monitoring and Logs

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f github-repo-viewer
docker-compose logs -f keycloak

# Last 100 lines
docker-compose logs --tail=100 github-repo-viewer
```

### Health Checks
```bash
# Check application health
curl http://localhost:3001/api/health

# Check Keycloak health
curl http://localhost:8080/health/ready

# Check container status
docker-compose ps
```

### Resource Usage
```bash
# Monitor resource usage
docker stats

# Check disk usage
docker system df
```

## 🔒 Security Considerations

### Production Deployment

1. **Change Default Passwords**
   ```bash
   # Update in .env.docker.local
   KEYCLOAK_ADMIN_PASSWORD=your-strong-password
   SESSION_SECRET=your-32-char-minimum-secret
   ```

2. **Use HTTPS**
   ```bash
   # Enable SSL in nginx.conf
   # Uncomment HTTPS server block
   # Add SSL certificates to ./ssl/ directory
   ```

3. **Network Security**
   ```bash
   # Use custom network
   docker network create --driver bridge secure-network
   
   # Update docker-compose.yml to use custom network
   ```

4. **Environment Variables**
   ```bash
   # Never commit .env files with real credentials
   # Use Docker secrets in production
   echo "your-secret" | docker secret create session_secret -
   ```

## 🛠️ Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check what's using the ports
sudo netstat -tulpn | grep :3001
sudo netstat -tulpn | grep :8080

# Use different ports
docker-compose up -d --scale github-repo-viewer=1 -p 3002:3001
```

#### Memory Issues
```bash
# Check available memory
free -h

# Increase Docker memory limit
# Docker Desktop: Settings → Resources → Memory
```

#### Permission Issues
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
chmod +x scripts/*.sh
```

#### Container Won't Start
```bash
# Check container logs
docker-compose logs github-repo-viewer

# Restart specific service
docker-compose restart github-repo-viewer

# Rebuild without cache
docker-compose build --no-cache github-repo-viewer
```

### Debug Mode

Enable debug logging:
```bash
# In .env.docker.local
DEBUG=true
LOG_LEVEL=debug

# Restart services
docker-compose restart
```

### Reset Everything
```bash
# Stop and remove all containers, networks, and volumes
docker-compose down -v --remove-orphans

# Remove images
docker-compose down --rmi all

# Clean up Docker system
docker system prune -a
```

## 📈 Performance Optimization

### Production Optimizations

1. **Multi-stage Build Optimization**
   ```dockerfile
   # Already implemented in Dockerfile
   # Uses alpine images for smaller size
   # Separates build and runtime stages
   ```

2. **Nginx Caching**
   ```nginx
   # Static file caching (already configured)
   location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   ```

3. **Resource Limits**
   ```yaml
   # Add to docker-compose.yml
   deploy:
     resources:
       limits:
         cpus: '0.5'
         memory: 512M
       reservations:
         memory: 256M
   ```

### Scaling

```bash
# Scale the application
docker-compose up -d --scale github-repo-viewer=3

# Use load balancer
# Update nginx.conf upstream block with multiple servers
```

## 🔄 Updates and Maintenance

### Update Application
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose up --build -d

# Or rolling update
docker-compose up -d --no-deps github-repo-viewer
```

### Backup Data
```bash
# Backup Keycloak data
docker-compose exec keycloak /opt/keycloak/bin/kc.sh export --dir /tmp/backup

# Copy backup from container
docker cp $(docker-compose ps -q keycloak):/tmp/backup ./keycloak-backup
```

### Database Migration (if using external DB)
```bash
# Run Keycloak migrations
docker-compose exec keycloak /opt/keycloak/bin/kc.sh build
docker-compose restart keycloak
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Keycloak Docker Documentation](https://www.keycloak.org/server/containers)
- [Nginx Docker Documentation](https://hub.docker.com/_/nginx)

## 🆘 Support

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Verify environment variables: `docker-compose config`
3. Check container health: `docker-compose ps`
4. Review this documentation
5. Check GitHub issues or create a new one

---

**Happy Dockerizing! 🐳**