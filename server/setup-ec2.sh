#!/bin/bash
# EC2 Setup Script for Pilareta Tribe
# Run as: sudo bash setup-ec2.sh
# Tested on: Amazon Linux 2023

set -e

echo "=== Pilareta Tribe EC2 Setup ==="
echo "Starting setup at $(date)"

# Update system
echo ">>> Updating system packages..."
dnf update -y

# Install Node.js 20 LTS
echo ">>> Installing Node.js 20 LTS..."
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
dnf install -y nodejs

# Verify Node.js installation
node --version
npm --version

# Install pnpm globally
echo ">>> Installing pnpm..."
npm install -g pnpm

# Install pm2 globally
echo ">>> Installing pm2..."
npm install -g pm2

# Install nginx
echo ">>> Installing nginx..."
dnf install -y nginx
systemctl enable nginx
systemctl start nginx

# Install PostgreSQL 15
echo ">>> Installing PostgreSQL 15..."
dnf install -y postgresql15-server postgresql15

# Initialize PostgreSQL database
echo ">>> Initializing PostgreSQL..."
postgresql-setup --initdb

# Enable and start PostgreSQL
systemctl enable postgresql
systemctl start postgresql

# Create database and user
echo ">>> Setting up database..."
echo "Enter a secure password for the 'tribe' database user:"
read -s DB_PASSWORD

sudo -u postgres psql <<EOF
CREATE USER tribe WITH PASSWORD '${DB_PASSWORD}';
CREATE DATABASE pilareta_tribe OWNER tribe;
GRANT ALL PRIVILEGES ON DATABASE pilareta_tribe TO tribe;
\c pilareta_tribe
GRANT ALL ON SCHEMA public TO tribe;
EOF

# Update pg_hba.conf for password authentication
echo ">>> Configuring PostgreSQL authentication..."
PG_HBA="/var/lib/pgsql/data/pg_hba.conf"
sed -i 's/ident$/md5/' "$PG_HBA"
sed -i 's/peer$/md5/' "$PG_HBA"
systemctl restart postgresql

# Create application directory
echo ">>> Creating application directory..."
mkdir -p /var/www/pilareta-tribe
chown ec2-user:ec2-user /var/www/pilareta-tribe

# Setup pm2 to run on startup
echo ">>> Configuring pm2 startup..."
pm2 startup systemd -u ec2-user --hp /home/ec2-user
systemctl enable pm2-ec2-user

# Install git
echo ">>> Installing git..."
dnf install -y git

# Configure nginx
echo ">>> Configuring nginx..."
cat > /etc/nginx/conf.d/tribe.conf << 'NGINX_EOF'
server {
    listen 80;
    server_name tribe.pilareta.com;

    # Increase max body size for file uploads
    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static file caching
    location /_next/static {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, immutable, max-age=31536000";
    }
}
NGINX_EOF

# Test nginx config and reload
nginx -t
systemctl reload nginx

# Print summary
echo ""
echo "=== Setup Complete ==="
echo ""
echo "Database connection string:"
echo "postgresql://tribe:YOUR_PASSWORD@localhost:5432/pilareta_tribe"
echo ""
echo "Next steps:"
echo "1. Clone your repository to /var/www/pilareta-tribe"
echo "2. Create .env file with your configuration"
echo "3. Run: pnpm install && pnpm prisma migrate deploy && pnpm build"
echo "4. Run: pm2 start npm --name 'pilareta-tribe' -- start"
echo "5. Run: pm2 save"
echo ""
echo "For HTTPS, run: sudo dnf install -y certbot python3-certbot-nginx && sudo certbot --nginx -d tribe.pilareta.com"
