#!/bin/bash
# ─── Varahi React Deployment Script ────────────────────────────────────
# Usage: ./deploy.sh [production|staging] [server-name] [cpannel-mode]
#
# CPANNEL-MODE options:
#   --cpannel           Enable CPanel-specific configs (Apache proxy, SSL, etc.)
#   --no-cpannel        Disable CPanel configs (default: VPS/Docker mode)
#   --domain example.com  Set the domain for SSL/proxy configs
#
# Example: ./deploy.sh production mydomain.com --cpannel --domain example.com
#
# For pure CPanel shared hosting (without root access):
#   Use --no-cpannel flag and deploy via cPanel File Manager + WHM Terminal
#
# For CPanel VPS/WHM with root access:
#   Use --cpannel flag with --domain set

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ENVIRONMENT=${1:-production}
SERVER_NAME=${2:-$(hostname)}
CPANNEL_MODE=false
DOMAIN=""

# Parse additional arguments
shift 2
while [[ $# -gt 0 ]]; do
    case "$1" in
        --cpannel)
            CPANNEL_MODE=true
            ;;
        --domain)
            DOMAIN="$2"
            shift
            ;;
        --help|-h)
            echo "Usage: ./deploy.sh [production|staging] [server-name] [--cpannel] [--domain example.com]"
            echo ""
            echo "Options:"
            echo "  --cpannel       Enable CPanel-specific configs (Apache proxy, SSL, etc.)"
            echo "   --domain example.com  Set the domain for SSL/proxy configs"
            echo "  --no-cpannel    Disable CPanel configs (default: VPS/Docker mode)"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
    shift
done

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       Varahi React Deployment - ${ENVIRONMENT^^}                    ║${NC}"
echo -e "${BLUE}║       Server: ${SERVER_NAME}                              ║${NC}"
if [ "$CPANNEL_MODE" = true ] && [ -n "$DOMAIN" ]; then
    echo -e "${BLUE}║       Domain: ${DOMAIN}                                  ║${NC}"
    echo -e "${BLUE}║       Mode: CPanel Integration                              ║${NC}"
fi
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
    
    # CPanel-specific checks
    if [ "$CPANNEL_MODE" = true ]; then
        if [ -z "$DOMAIN" ]; then
            echo -e "${RED}✗ --domain is required when --cpannel is used${NC}"
            exit 1
        fi
        
        # Check if Apache is available (CPanel typically uses Apache)
        if command -v apache2 &> /dev/null || command -v httpd &> /dev/null; then
            echo -e "${GREEN}✓ Apache detected${NC}"
        else
            echo -e "${YELLOW}⚠ Apache not found in PATH${NC}"
        fi
        
        # Check for .htaccess support
        if [ ! -f "/etc/apache2/sites-available/000-default.conf" ] && \
           [ ! -f "/etc/httpd/conf/httpd.conf" ]; then
            echo -e "${YELLOW}⚠ Apache config not found at default paths${NC}"
        else
            echo -e "${GREEN}✓ Apache config found${NC}"
        fi
        
        # Check for Let's Encrypt client
        if command -v certbot &> /dev/null; then
            echo -e "${GREEN}✓ Certbot (Let's Encrypt) found${NC}"
        else
            echo -e "${YELLOW}⚠ Certbot not found, will install during setup${NC}"
        fi
    fi
}

# ─── Install Dependencies ────────────────────────────────────────────
install_dependencies() {
    echo -e "\n${YELLOW}▶ Installing dependencies...${NC}"
    
    # Must install devDependencies too so Vite, Terser, etc. are available for building frontend
    npm ci --workspaces --include-workspace-root
    
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
    
    # Stop existing processes (only non-CPannel ones)
    if [ "$CPANNEL_MODE" != true ]; then
        pm2 delete jaivarahi-backend 2>/dev/null || pm2 delete varahi-backend 2>/dev/null || true
    fi
    
    # Start with ecosystem config
    cd backend
    pm2 start ecosystem.config.cjs --env "$ENVIRONMENT"
    cd ..
    
    # Save PM2 configuration
    pm2 save
    
    # Setup startup script
    pm2 startup systemd -u "$(whoami)" --hp "$HOME" 2>/dev/null || true
    
    # CPanel-specific: Generate Apache proxy config
    if [ "$CPANNEL_MODE" = true ]; then
        generate_cpannel_proxy_config
    fi
    
    echo -e "${GREEN}✓ PM2 configured${NC}"
}

# ─── Generate CPanel Apache Proxy Config ───────────────────────────────
generate_cpannel_proxy_config() {
    echo -e "\n${YELLOW}▶ Generating CPanel Apache proxy config...${NC}"
    
    local docroot
    docroot="/var/www/html"
    # Adjust for cPanel user directories
    if [ -n "$CPANNEL_USER" ] && [ -n "$HOME" ]; then
        docroot="/home/$CPANNEL_USER/public_html"
    fi
    
    local config_file="/etc/apache2/sites-available/varahi.conf"
    local config_backup="${config_file}.backup-$(date +%Y%m%d%H%M%S)"
    
    # Backup existing config if it exists
    if [ -f "$config_file" ]; then
        cp "$config_file" "$config_backup"
        echo -e "${YELLOW}✓ Backed up existing config to $config_backup${NC}"
    fi
    
    # Generate new Apache config for CPanel integration
    cat > "$config_file" <<APACHECONF
<IfModule mod_ssl.c>
<IfModule mod_rewrite.c>
<IfModule mod_headers.c>
    # Varahi Admin Panel - CPanel Integration
    # Proxy to Node.js PM2 application
    
    # CPanel DocumentRoot
    DocumentRoot "${docroot}"
    
    # Admin panel proxy - passes all /admin/ requests to Node.js PM2
    <Location /admin>
        ProxyPreserveHost On
        ProxyPass http://127.0.0.1:5005/admin
        ProxyPassReverse http://127.0.0.1:5005/admin
        Require all granted
        
        # SSE/WebSocket support - critical for real-time updates
        RewriteEngine on
        RewriteCond %{HTTP:Upgrade} websocket [NC]
        RewriteCond %{HTTP:Connection} upgrade [NC]
        RewriteRule /admin/(.*) ws://127.0.0.1:5005/$1 [P,L]
        
        # Headers for real-time and CORS
        Header set Connection "upgrade"
        Header set Upgrade "websocket"
        Header set Access-Control-Allow-Origin "${DOMAIN}"
        Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
        Header set Access-Control-Allow-Headers "Content-Type, Authorization"
        Header set Access-Control-Max-Age "86400"
    </Location>
    
    # API proxy
    <Location /api>
        ProxyPreserveHost On
        ProxyPass http://127.0.0.1:5005/api
        ProxyPassReverse http://127.0.0.1:5005/api
        Require all granted
        
        # Headers
        Header set Access-Control-Allow-Origin "${DOMAIN}"
        Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
        Header set Access-Control-Allow-Headers "Content-Type, Authorization"
    </Location>
    
    # Real-time SSE endpoints
    <Location /api/realtime>
        ProxyPreserveHost On
        ProxyPass http://127.0.0.1:5005/api/realtime
        ProxyPassReverse http://127.0.0.1:5005/api/realtime
        Require all granted
        
        # SSE specific headers
        Header set Connection "keep-alive"
        Header set X-Content-Type-Options "nosniff"
    </Location>
    
    # Static files - serve directly from CPanel document root
    # No proxy needed for images, CSS, JS served from CPanel
    
    # CORS headers for all responses
    <IfModule mod_headers.c>
        always set env=strict-origin-when-cross-origin
        Header always set X-Content-Type-Options "nosniff"
        Header always set X-Frame-Options "SAMEORIGIN"
        Header always set X-XSS-Protection "1; mode=block"
        Header always set Referrer-Policy "strict-origin-when-cross-origin"
    </IfModule>
    
    # Error documents
    ErrorDocument 404 /404.html
    ErrorDocument 500 /500.html
    
    # Rewrite rules for SPA fallback (if using React Router)
    RewriteEngine On
    # Don't proxy static files that exist
    RewriteCond %{REQUEST_FILENAME} -f [OR]
    RewriteCond %{REQUEST_FILENAME} -d
    RewriteRule ^ - [NC,L]
    # Proxy everything else to Node.js
    RewriteRule ^/(.*)$ http://127.0.0.1:5005/$1 [P,L]
    
    # Security headers at the top level
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    
    # HSTS - only on HTTPS
    <IfModule mod_ssl.c>
        Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    </IfModule>
</IfModule>
</IfModule>

APACHECONF
    
    echo -e "${GREEN}✓ Apache proxy config generated at $config_file${NC}"
    
    # Enable the site (CPanel/Debian path)
    if [ -f "/usr/sbin/a2ensite" ]; then
        a2ensite varahi.conf 2>/dev/null || echo -e "${YELLOW}⚠ Could not enable site with a2ensite${NC}"
        systemctl reload apache2 2>/dev/null || true
    elif [ -f "/usr/sbin/a2enmod" ]; then
        # RedHat/CentOS path
        systemctl reload httpd 2>/dev/null || true
    fi
    
    echo -e "${YELLOW}⚠ Remember to reload Apache: sudo systemctl reload apache2${NC}"
}

# ─── Health Check ────────────────────────────────────────────────────
health_check() {
    echo -e "\n${YELLOW}▶ Running health checks...${NC}"
    
    # Wait for server to start
    sleep 10
    
    # Check health endpoint
    for i in {1..5}; do
        if curl -sf "http://localhost:5005/health" > /dev/null; then
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
    echo -e "${BLUE}CPANNEL Mode:${NC} ${CPANNEL_MODE}"
    if [ -n "$DOMAIN" ]; then
        echo -e "${BLUE}Domain:${NC} ${DOMAIN}"
    fi
    echo -e "${BLUE}Health Check:${NC} http://localhost:5005/health"
    echo -e "${BLUE}PM2 Monitor:${NC} pm2 monit"
    echo -e "${BLUE}Logs:${NC} pm2 logs jaivarahi-backend"
    
    # CPanel-specific post-deployment instructions
    if [ "$CPANNEL_MODE" = true ]; then
        echo -e "\n${YELLOW}╔══════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${YELLOW}║       CPanel Post-Deployment Steps                          ║${NC}"
        echo -e "${YELLOW}║                                                             ║${NC}"
        echo -e "${YELLOW}1. Upload frontend/dist/ contents to cPanel File Manager:${NC}"
        echo -e "${YELLOW}   → /home/$(whoami)/public_html/                          ║${NC}"
        echo -e "${YELLOW}2. Or via SSH: rsync -av frontend/dist/ $(whoami)@$(hostname):public_html/${NC}"
        echo -e "${YELLOW}3. Setup Apache proxy (already generated):${NC}"
        echo -e "${YELLOW}   → /etc/apache2/sites-available/varahi.conf              ║${NC}"
        echo -e "${YELLOW}4. Enable SSL via Let's Encrypt:${NC}"
        echo -e "${YELLOW}   → certbot --apache -d ${DOMAIN}                        ║${NC}"
        echo -e "${YELLOW}5. Update DNS A record to point to this server IP${NC}"
        echo -e "${YELLOW}6. Restart Apache: sudo systemctl restart apache2       ║${NC}"
        echo -e "${YELLOW}╚══════════════════════════════════════════════════════════════╝${NC}"
    fi
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