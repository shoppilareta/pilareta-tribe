#!/bin/bash
# ============================================
# Pilareta Tribe - Deployment Script
# ============================================
# This script deploys the latest code from git
# and restarts the application.
#
# Usage: ./deploy.sh
# ============================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/var/www/pilareta-tribe"
ECOSYSTEM_FILE="ecosystem.config.js"
UPLOADS_DIR="/var/data/pilareta-uploads"

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Pilareta Tribe Deployment${NC}"
echo -e "${YELLOW}========================================${NC}"

# Ensure persistent uploads directory exists (outside git repo)
if [ ! -d "$UPLOADS_DIR" ]; then
    echo -e "${YELLOW}Creating persistent uploads directory: $UPLOADS_DIR${NC}"
    sudo mkdir -p "$UPLOADS_DIR"/{ugc/{images,thumbnails},track}
    sudo chown -R ec2-user:ec2-user "$UPLOADS_DIR"
    # Migrate any existing uploads from public/uploads
    if [ -d "$APP_DIR/public/uploads" ] && [ "$(ls -A $APP_DIR/public/uploads 2>/dev/null)" ]; then
        echo -e "${YELLOW}Migrating existing uploads to persistent directory...${NC}"
        cp -rn "$APP_DIR/public/uploads/"* "$UPLOADS_DIR/" 2>/dev/null || true
    fi
fi

# Navigate to app directory
cd "$APP_DIR" || {
    echo -e "${RED}Error: Could not navigate to $APP_DIR${NC}"
    exit 1
}

echo -e "\n${GREEN}[1/5]${NC} Pulling latest changes from git..."
git pull

echo -e "\n${GREEN}[2/5]${NC} Installing dependencies..."
pnpm install --frozen-lockfile --filter pilareta-tribe --filter @pilareta/shared || pnpm install --filter pilareta-tribe --filter @pilareta/shared
# Ensure @types/google.maps is available (filtered install may skip it)
pnpm add -wD @types/google.maps 2>/dev/null || true

echo -e "\n${GREEN}[3/5]${NC} Running database migrations..."
# Load .env.local so Prisma gets the real DATABASE_URL (not the placeholder in .env)
set -a; source "$APP_DIR/.env.local" 2>/dev/null; set +a
pnpm prisma generate
pnpm prisma db push --skip-generate || true

echo -e "\n${GREEN}[4/5]${NC} Building application..."
# Increase Node heap for build on small instances (916MB RAM)
NODE_OPTIONS="--max-old-space-size=700" npx next build

echo -e "\n${GREEN}[5/5]${NC} Restarting PM2..."
if [ -f "$ECOSYSTEM_FILE" ]; then
    pm2 restart "$ECOSYSTEM_FILE" --update-env
else
    pm2 restart pilareta-tribe --update-env
fi

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"

# Show status
pm2 status

echo -e "\n${YELLOW}View logs with: pm2 logs pilareta-tribe${NC}"
