#!/bin/bash
# ─── Varahi React Deployment Script ────────────────────────────────────
# Usage: ./deploy.sh [production|staging] [server-name]

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ENVIRONMENT=${1:-production}
SERVER_NAME=${2:-$(hostname)}

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       Varahi React Deployment - ${ENVIRONMENT^^}                    ║${NC}"
echo -e "${BLUE}║       Server: ${SERVER_NAME}                              ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"

# ─── Pre-deployment Checks ───────────────────────────────────────────
check_prerequisites() {
    echo -e "\n${YELLOW}▶ Checking prerequisites...${NC}"
    
    # Check Node version
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        echo -e "${RED}✗ Node.js 18+ required (found v$NODE_VERSION)${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Node.js $(node --version)${NC}"
    
    # Check npm
    echo -e "${GREEN}✓ npm $(npm --version)${NC}"
    
    # Check PM2
    if ! command -v pm2 &> /dev/null; then
        echo -e "${YELLOW}⚠ PM2 not found, installing...${NC}"
        npm install -g pm2
    fi
    echo -e "${GREEN}✓ PM2 $(pm2 --version)${NC}"
    
    # Check environment file
    if [ ! -f ".env" ]; then
        echo -e "${RED}✗ .env file not found${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ .env file exists${NC}"
}

# ─── Install Dependencies ────────────────────────────────────────────
install_dependencies() {
    echo -e "\n${YELLOW}▶ Installing dependencies...${NC}"
    
    if [ "$ENVIRONMENT" = "production" ]; then
        npm ci --production --workspaces --include-workspace-root
    else
        npm ci --workspaces --include-workspace-root
    fi
    
    echo -e "${GREEN}✓ Dependencies installed${NC}"
}

# ─── Build Frontend ──────────────────────────────────────────────────
build_frontend() {
    echo -e "\n${YELLOW}▶ Building frontend...${NC}"
    
    cd frontend
    npm run build
    cd ..
    
    echo -e "${GREEN}✓ Frontend built${NC}"
}

# ─── Run Migrations ──────────────────────────────────────────────────
run_migrations() {
    echo -e "\n${YELLOW}▶ Running database migrations...${NC}"
    
    # Check if migration runner exists
    if [ -f "backend/migrations/run.js" ]; then
        node backend/migrations/run.js
    else
        echo -e "${YELLOW}⚠ No migration runner found, skipping...${NC}"
    fi
    
    echo -e "${GREEN}✓ Migrations complete${NC}"
}

# ─── Setup PM2 ───────────────────────────────────────────────────────
setup_pm2() {
    echo -e "\n${YELLOW}▶ Setting up PM2...${NC}"
    
    # Create logs directory
    mkdir -p backend/logs
    
    # Stop existing processes
    pm2 delete jaivarahi-backend 2>/dev/null || true
    
    # Start with ecosystem config
    cd backend
    pm2 start ecosystem.config.cjs --env "$ENVIRONMENT"
    cd ..
    
    # Save PM2 configuration
    pm2 save
    
    # Setup startup script
    pm2 startup systemd -u "$(whoami)" --hp "$HOME" 2>/dev/null || true
    
    echo -e "${GREEN}✓ PM2 configured${NC}"
}

# ─── Health Check ────────────────────────────────────────────────────
health_check() {
    echo -e "\n${YELLOW}▶ Running health checks...${NC}"
    
    # Wait for server to start
    sleep 10
    
    # Check health endpoint
    for i in {1..5}; do
        if curl -sf "http://localhost:5000/health" > /dev/null; then
            echo -e "${GREEN}✓ Health check passed${NC}"
            return 0
        fi
        echo -e "${YELLOW}⚠ Health check attempt $i failed, retrying...${NC}"
        sleep 5
    done
    
    echo -e "${RED}✗ Health check failed after 5 attempts${NC}"
    pm2 logs jaivarahi-backend --lines 50
    exit 1
}

# ─── Post-Deployment ─────────────────────────────────────────────────
post_deployment() {
    echo -e "\n${YELLOW}▶ Post-deployment tasks...${NC}"
    
    # Show status
    pm2 status
    
    # Show logs
    echo -e "\n${BLUE}Recent logs:${NC}"
    pm2 logs jaivarahi-backend --lines 20
    
    echo -e "\n${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║           Deployment Successful! 🎉                          ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo -e "\n${BLUE}Server:${NC} ${SERVER_NAME}"
    echo -e "${BLUE}Environment:${NC} ${ENVIRONMENT}"
    echo -e "${BLUE}Health Check:${NC} http://localhost:5000/health"
    echo -e "${BLUE}PM2 Monitor:${NC} pm2 monit"
    echo -e "${BLUE}Logs:${NC} pm2 logs jaivarahi-backend"
}

# ─── Main ────────────────────────────────────────────────────────────
main() {
    check_prerequisites
    install_dependencies
    build_frontend
    run_migrations
    setup_pm2
    health_check
    post_deployment
}

# Run main
main "$@"