#!/bin/bash

# GitHub Repository Viewer - Docker Development Script
# This script helps manage the Docker development environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENV_FILE=".env.docker.local"
COMPOSE_FILE="docker-compose.yml"

# Functions
print_header() {
    echo -e "${BLUE}🐳 GitHub Repository Viewer - Docker Manager${NC}"
    echo -e "${BLUE}================================================${NC}"
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
    echo "Checking requirements..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not available. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed"
}

setup_env() {
    echo "Setting up environment..."
    
    if [ ! -f "$ENV_FILE" ]; then
        if [ -f ".env.docker" ]; then
            cp .env.docker "$ENV_FILE"
            print_warning "Created $ENV_FILE from template. Please edit it with your actual values."
            echo "Important variables to update:"
            echo "  - SESSION_SECRET (use a strong random string)"
            echo "  - GITHUB_TOKEN (your GitHub personal access token)"
            echo "  - KEYCLOAK_ADMIN_PASSWORD (change from default)"
        else
            print_error "Template file .env.docker not found!"
            exit 1
        fi
    else
        print_success "Environment file $ENV_FILE exists"
    fi
}

build_images() {
    echo "Building Docker images..."
    docker compose --env-file "$ENV_FILE" build --no-cache
    print_success "Images built successfully"
}

start_services() {
    echo "Starting services..."
    docker compose --env-file "$ENV_FILE" up -d
    print_success "Services started"
    
    echo "Waiting for services to be ready..."
    sleep 10
    
    # Check health
    check_health
}

stop_services() {
    echo "Stopping services..."
    docker compose --env-file "$ENV_FILE" down
    print_success "Services stopped"
}

restart_services() {
    echo "Restarting services..."
    docker compose --env-file "$ENV_FILE" restart
    print_success "Services restarted"
}

check_health() {
    echo "Checking service health..."
    
    # Check main application
    if curl -f http://localhost:3001/api/health &> /dev/null; then
        print_success "Main application is healthy"
    else
        print_warning "Main application is not responding"
    fi
    
    # Check Keycloak
    if curl -f http://localhost:8080/health/ready &> /dev/null; then
        print_success "Keycloak is healthy"
    else
        print_warning "Keycloak is not ready yet (this is normal on first start)"
    fi
}

show_logs() {
    local service=${1:-""}
    if [ -n "$service" ]; then
        echo "Showing logs for $service..."
        docker compose --env-file "$ENV_FILE" logs -f "$service"
    else
        echo "Showing logs for all services..."
        docker compose --env-file "$ENV_FILE" logs -f
    fi
}

show_status() {
    echo "Service status:"
    docker compose --env-file "$ENV_FILE" ps
    
    echo ""
    echo "Resource usage:"
    docker stats --no-stream
}

cleanup() {
    echo "Cleaning up..."
    docker compose --env-file "$ENV_FILE" down -v --remove-orphans
    docker system prune -f
    print_success "Cleanup completed"
}

show_urls() {
    echo "Application URLs:"
    echo "  🌐 Main Application: http://localhost:3001"
    echo "  🔐 Keycloak Admin:   http://localhost:8080/admin"
    echo "  📊 Health Check:     http://localhost:3001/api/health"
    echo ""
    echo "Default Keycloak Admin Credentials:"
    echo "  Username: admin"
    echo "  Password: admin123"
    echo ""
    echo "⚠️  Remember to configure Keycloak realm and client!"
    echo "   See KEYCLOAK_GITHUB_SETUP.md for detailed instructions."
}

show_help() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  setup     - Set up environment and build images"
    echo "  start     - Start all services"
    echo "  stop      - Stop all services"
    echo "  restart   - Restart all services"
    echo "  build     - Build Docker images"
    echo "  logs      - Show logs (optionally specify service name)"
    echo "  status    - Show service status and resource usage"
    echo "  health    - Check service health"
    echo "  urls      - Show application URLs"
    echo "  cleanup   - Stop services and clean up"
    echo "  help      - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 setup          # Initial setup"
    echo "  $0 start          # Start services"
    echo "  $0 logs keycloak  # Show Keycloak logs"
    echo "  $0 status         # Show status"
}

# Main script
main() {
    print_header
    
    case "${1:-help}" in
        setup)
            check_requirements
            setup_env
            build_images
            start_services
            show_urls
            ;;
        start)
            check_requirements
            setup_env
            start_services
            show_urls
            ;;
        stop)
            stop_services
            ;;
        restart)
            restart_services
            ;;
        build)
            build_images
            ;;
        logs)
            show_logs "$2"
            ;;
        status)
            show_status
            ;;
        health)
            check_health
            ;;
        urls)
            show_urls
            ;;
        cleanup)
            cleanup
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