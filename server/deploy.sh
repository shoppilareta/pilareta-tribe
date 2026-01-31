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

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Pilareta Tribe Deployment${NC}"
echo -e "${YELLOW}========================================${NC}"

# Navigate to app directory
cd "$APP_DIR" || {
    echo -e "${RED}Error: Could not navigate to $APP_DIR${NC}"
    exit 1
}

echo -e "\n${GREEN}[1/5]${NC} Pulling latest changes from git..."
git pull

echo -e "\n${GREEN}[2/5]${NC} Installing dependencies..."
pnpm install --frozen-lockfile --filter pilareta-tribe --filter @pilareta/shared || pnpm install --filter pilareta-tribe --filter @pilareta/shared

echo -e "\n${GREEN}[3/5]${NC} Running database migrations..."
pnpm prisma db push --skip-generate || true

echo -e "\n${GREEN}[4/5]${NC} Building application..."
npx next build

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
