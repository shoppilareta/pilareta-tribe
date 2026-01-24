#!/bin/bash
# ============================================
# Pilareta Tribe - EC2 Initial Setup Script
# ============================================
# Run this script on a fresh Amazon Linux 2023 EC2 instance
# to set up all required dependencies and services.
#
# Usage: sudo ./setup-ec2.sh
# ============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Pilareta Tribe EC2 Setup${NC}"
echo -e "${YELLOW}========================================${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run as root (sudo ./setup-ec2.sh)${NC}"
    exit 1
fi

# ============================================
# 1. System Update
# ============================================
echo -e "\n${GREEN}[1/8]${NC} Updating system packages..."
dnf update -y

# ============================================
# 2. Install Node.js 20 LTS
# ============================================
echo -e "\n${GREEN}[2/8]${NC} Installing Node.js 20 LTS..."
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
dnf install -y nodejs

# Verify installation
node --version
npm --version

# ============================================
# 3. Install pnpm
# ============================================
echo -e "\n${GREEN}[3/8]${NC} Installing pnpm..."
npm install -g pnpm
pnpm --version

# ============================================
# 4. Install PM2
# ============================================
echo -e "\n${GREEN}[4/8]${NC} Installing PM2..."
npm install -g pm2
pm2 --version

# ============================================
# 5. Install Nginx
# ============================================
echo -e "\n${GREEN}[5/8]${NC} Installing Nginx..."
dnf install -y nginx
systemctl enable nginx
systemctl start nginx

# ============================================
# 6. Install PostgreSQL 15
# ============================================
echo -e "\n${GREEN}[6/8]${NC} Installing PostgreSQL 15..."
dnf install -y postgresql15-server postgresql15
postgresql-setup --initdb
systemctl enable postgresql
systemctl start postgresql

# ============================================
# 7. Configure PostgreSQL
# ============================================
echo -e "\n${GREEN}[7/8]${NC} Configuring PostgreSQL..."

# Prompt for database password
echo -e "${YELLOW}Enter a secure password for the 'tribe' database user:${NC}"
read -s DB_PASSWORD

# Create database and user
sudo -u postgres psql << EOF
CREATE USER tribe WITH PASSWORD '$DB_PASSWORD';
CREATE DATABASE pilareta_tribe OWNER tribe;
GRANT ALL PRIVILEGES ON DATABASE pilareta_tribe TO tribe;
EOF

# Configure authentication (allow password auth for local connections)
PG_HBA="/var/lib/pgsql/data/pg_hba.conf"
if ! grep -q "pilareta_tribe" "$PG_HBA"; then
    echo "host    pilareta_tribe    tribe    127.0.0.1/32    md5" >> "$PG_HBA"
fi

systemctl restart postgresql

# ============================================
# 8. Create Application Directory
# ============================================
echo -e "\n${GREEN}[8/8]${NC} Creating application directory..."
mkdir -p /var/www/pilareta-tribe
chown -R ec2-user:ec2-user /var/www/pilareta-tribe

# Create uploads directory
mkdir -p /var/www/pilareta-tribe/public/uploads/ugc/images
mkdir -p /var/www/pilareta-tribe/public/uploads/ugc/videos
chown -R ec2-user:ec2-user /var/www/pilareta-tribe/public/uploads

# Create backup directory
mkdir -p /var/backups/pilareta-tribe
chown ec2-user:ec2-user /var/backups/pilareta-tribe

# ============================================
# Setup Complete
# ============================================
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Next steps:"
echo -e "  1. Clone the repository:"
echo -e "     ${YELLOW}cd /var/www/pilareta-tribe${NC}"
echo -e "     ${YELLOW}git clone https://github.com/shoppilareta/pilareta-tribe.git .${NC}"
echo ""
echo -e "  2. Install dependencies:"
echo -e "     ${YELLOW}pnpm install${NC}"
echo ""
echo -e "  3. Create environment file:"
echo -e "     ${YELLOW}cp .env.example .env.local${NC}"
echo -e "     ${YELLOW}nano .env.local  # Fill in all values${NC}"
echo ""
echo -e "  4. Setup database:"
echo -e "     ${YELLOW}pnpm prisma db push${NC}"
echo -e "     ${YELLOW}pnpm db:seed${NC}"
echo ""
echo -e "  5. Build and start:"
echo -e "     ${YELLOW}pnpm build${NC}"
echo -e "     ${YELLOW}pm2 start ecosystem.config.js${NC}"
echo -e "     ${YELLOW}pm2 save${NC}"
echo -e "     ${YELLOW}pm2 startup systemd -u ec2-user --hp /home/ec2-user${NC}"
echo ""
echo -e "  6. Configure Nginx:"
echo -e "     ${YELLOW}sudo cp server/nginx.conf /etc/nginx/conf.d/tribe.conf${NC}"
echo -e "     ${YELLOW}sudo nginx -t && sudo systemctl reload nginx${NC}"
echo ""
echo -e "  7. Setup SSL (optional):"
echo -e "     ${YELLOW}sudo dnf install -y certbot python3-certbot-nginx${NC}"
echo -e "     ${YELLOW}sudo certbot --nginx -d tribe.pilareta.com${NC}"
echo ""
echo -e "Database password: ${YELLOW}(saved during setup)${NC}"
echo -e "Remember to save this password in your .env.local file!"
