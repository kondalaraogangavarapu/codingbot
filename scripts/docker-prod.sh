#!/bin/bash

# GitHub Repository Viewer - Docker Production Script
# This script helps manage the Docker production environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENV_FILE=".env.docker.production"
COMPOSE_FILE="docker compose.yml"
BACKUP_DIR="./backups"

# Functions
print_header() {
    echo -e "${BLUE}🚀 GitHub Repository Viewer - Production Manager${NC}"
    echo -e "${BLUE}===================================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

check_requirements() {
    echo "Checking production requirements..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not available. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if running as root (recommended for production)
    if [ "$EUID" -ne 0 ]; then
        print_warning "Not running as root. Some operations might require sudo."
    fi
    
    print_success "Requirements check passed"
}

setup_production_env() {
    echo "Setting up production environment..."
    
    if [ ! -f "$ENV_FILE" ]; then
        if [ -f ".env.docker" ]; then
            cp .env.docker "$ENV_FILE"
            
            # Update for production
            sed -i 's/NODE_ENV=development/NODE_ENV=production/' "$ENV_FILE"
            sed -i 's/DEBUG=true/DEBUG=false/' "$ENV_FILE"
            sed -i 's/admin123/CHANGE_THIS_PASSWORD/' "$ENV_FILE"
            
            print_warning "Created $ENV_FILE from template."
            print_error "IMPORTANT: Update the following before deploying:"
            echo "  - SESSION_SECRET (use a strong 32+ character random string)"
            echo "  - GITHUB_TOKEN (your GitHub personal access token)"
            echo "  - KEYCLOAK_ADMIN_PASSWORD (change from CHANGE_THIS_PASSWORD)"
            echo "  - All other passwords and secrets"
            echo ""
            echo "Edit the file: nano $ENV_FILE"
            read -p "Press Enter after updating the environment file..."
        else
            print_error "Template file .env.docker not found!"
            exit 1
        fi
    else
        print_success "Production environment file exists"
    fi
    
    # Validate critical settings
    validate_production_config
}

validate_production_config() {
    echo "Validating production configuration..."
    
    if grep -q "your-super-secret" "$ENV_FILE"; then
        print_error "SESSION_SECRET still contains default value!"
        exit 1
    fi
    
    if grep -q "admin123" "$ENV_FILE"; then
        print_error "KEYCLOAK_ADMIN_PASSWORD still contains default value!"
        exit 1
    fi
    
    if grep -q "DEBUG=true" "$ENV_FILE"; then
        print_warning "DEBUG is enabled in production"
    fi
    
    print_success "Configuration validation passed"
}

build_production() {
    echo "Building production images..."
    docker compose --env-file "$ENV_FILE" build --no-cache
    print_success "Production images built"
}

deploy() {
    echo "Deploying to production..."
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    
    # Backup current data if exists
    if docker compose --env-file "$ENV_FILE" ps | grep -q "Up"; then
        backup_data
    fi
    
    # Deploy with production profile
    docker compose --env-file "$ENV_FILE" --profile production up -d
    
    print_success "Production deployment completed"
    
    # Wait for services
    echo "Waiting for services to be ready..."
    sleep 30
    
    # Health check
    check_production_health
    
    show_production_urls
}

backup_data() {
    echo "Creating backup..."
    
    local backup_file="$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).tar.gz"
    
    # Backup Keycloak data
    docker compose --env-file "$ENV_FILE" exec -T keycloak \
        /opt/keycloak/bin/kc.sh export --dir /tmp/backup --users realm_file
    
    # Copy backup from container
    docker cp $(docker compose --env-file "$ENV_FILE" ps -q keycloak):/tmp/backup "$BACKUP_DIR/keycloak-$(date +%Y%m%d-%H%M%S)"
    
    print_success "Backup created: $backup_file"
}

check_production_health() {
    echo "Checking production health..."
    
    local max_attempts=10
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        echo "Health check attempt $attempt/$max_attempts..."
        
        # Check main application
        if curl -f http://localhost/api/health &> /dev/null; then
            print_success "Main application is healthy"
            break
        elif curl -f http://localhost:3001/api/health &> /dev/null; then
            print_success "Main application is healthy (direct port)"
            break
        else
            print_warning "Main application not ready yet..."
            sleep 10
            ((attempt++))
        fi
    done
    
    if [ $attempt -gt $max_attempts ]; then
        print_error "Main application failed health check"
        show_logs "github-repo-viewer"
        exit 1
    fi
    
    # Check Keycloak
    if curl -f http://localhost:8080/health/ready &> /dev/null; then
        print_success "Keycloak is healthy"
    else
        print_warning "Keycloak may still be starting up"
    fi
}

rolling_update() {
    echo "Performing rolling update..."
    
    # Build new images
    build_production
    
    # Update services one by one
    docker compose --env-file "$ENV_FILE" up -d --no-deps github-repo-viewer
    
    # Wait and check health
    sleep 15
    check_production_health
    
    print_success "Rolling update completed"
}

scale_service() {
    local service="$1"
    local replicas="$2"
    
    if [ -z "$service" ] || [ -z "$replicas" ]; then
        print_error "Usage: scale <service> <replicas>"
        exit 1
    fi
    
    echo "Scaling $service to $replicas replicas..."
    docker compose --env-file "$ENV_FILE" up -d --scale "$service=$replicas"
    print_success "Scaled $service to $replicas replicas"
}

show_production_logs() {
    local service=${1:-""}
    local lines=${2:-100}
    
    if [ -n "$service" ]; then
        echo "Showing last $lines lines of logs for $service..."
        docker compose --env-file "$ENV_FILE" logs --tail="$lines" "$service"
    else
        echo "Showing last $lines lines of logs for all services..."
        docker compose --env-file "$ENV_FILE" logs --tail="$lines"
    fi
}

monitor() {
    echo "Production monitoring dashboard..."
    echo "Press Ctrl+C to exit"
    
    while true; do
        clear
        echo "=== Production Status $(date) ==="
        echo ""
        
        echo "Service Status:"
        docker compose --env-file "$ENV_FILE" ps
        echo ""
        
        echo "Resource Usage:"
        docker stats --no-stream
        echo ""
        
        echo "Health Checks:"
        if curl -f http://localhost/api/health &> /dev/null; then
            echo "✅ Main Application: Healthy"
        else
            echo "❌ Main Application: Unhealthy"
        fi
        
        if curl -f http://localhost:8080/health/ready &> /dev/null; then
            echo "✅ Keycloak: Healthy"
        else
            echo "❌ Keycloak: Unhealthy"
        fi
        
        sleep 30
    done
}

stop_production() {
    echo "Stopping production services..."
    
    # Graceful shutdown
    docker compose --env-file "$ENV_FILE" stop
    
    print_success "Production services stopped"
}

emergency_stop() {
    print_warning "Emergency stop initiated!"
    docker compose --env-file "$ENV_FILE" down
    print_success "All services stopped immediately"
}

show_production_urls() {
    echo "Production URLs:"
    echo "  🌐 Main Application: http://localhost (or your domain)"
    echo "  🔐 Keycloak Admin:   http://localhost:8080/admin"
    echo "  📊 Health Check:     http://localhost/api/health"
    echo ""
    echo "SSL/HTTPS Setup:"
    echo "  - Configure SSL certificates in ./ssl/ directory"
    echo "  - Uncomment HTTPS server block in nginx.conf"
    echo "  - Update environment variables for HTTPS"
}

show_help() {
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  setup           - Set up production environment"
    echo "  build           - Build production images"
    echo "  deploy          - Deploy to production"
    echo "  update          - Perform rolling update"
    echo "  scale <svc> <n> - Scale service to n replicas"
    echo "  backup          - Create data backup"
    echo "  logs [service]  - Show production logs"
    echo "  monitor         - Show monitoring dashboard"
    echo "  health          - Check production health"
    echo "  stop            - Gracefully stop services"
    echo "  emergency-stop  - Immediately stop all services"
    echo "  urls            - Show production URLs"
    echo "  help            - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 setup                    # Initial production setup"
    echo "  $0 deploy                   # Deploy to production"
    echo "  $0 scale github-repo-viewer 3  # Scale to 3 replicas"
    echo "  $0 logs nginx 50            # Show last 50 nginx logs"
}

# Main script
main() {
    print_header
    
    case "${1:-help}" in
        setup)
            check_requirements
            setup_production_env
            build_production
            ;;
        build)
            build_production
            ;;
        deploy)
            check_requirements
            setup_production_env
            deploy
            ;;
        update)
            rolling_update
            ;;
        scale)
            scale_service "$2" "$3"
            ;;
        backup)
            backup_data
            ;;
        logs)
            show_production_logs "$2" "$3"
            ;;
        monitor)
            monitor
            ;;
        health)
            check_production_health
            ;;
        stop)
            stop_production
            ;;
        emergency-stop)
            emergency_stop
            ;;
        urls)
            show_production_urls
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"