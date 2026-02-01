# Pilareta Tribe - Infrastructure Documentation

This document contains all information needed to reproduce the EC2 server setup from scratch.

---

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Environment Variables](#environment-variables)
3. [Database Setup](#database-setup)
4. [Nginx Configuration](#nginx-configuration)
5. [PM2 Process Management](#pm2-process-management)
6. [SSL/HTTPS Setup](#sslhttps-setup)
7. [File Storage](#file-storage)
8. [External Services](#external-services)
9. [Deployment](#deployment)
10. [Backup & Recovery](#backup--recovery)
11. [Monitoring & Maintenance](#monitoring--maintenance)

---

## System Requirements

### Operating System
- Amazon Linux 2023 or Ubuntu 22.04 LTS

### Software Dependencies
| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | 20 LTS | JavaScript runtime |
| pnpm | 8+ | Package manager |
| PostgreSQL | 15 | Database |
| Nginx | Latest | Reverse proxy |
| PM2 | Latest | Process manager |
| Git | Latest | Version control |

### Hardware (Minimum)
- **Instance Type**: t3.small or equivalent
- **vCPUs**: 2
- **RAM**: 2GB
- **Storage**: 20GB SSD

### Current Production Server
```
IP Address: 13.205.55.164
SSH User: ec2-user
SSH Key: pilareta-tribe-key.pem
App Directory: /var/www/pilareta-tribe
```

---

## Environment Variables

Create `.env.local` on the server (never commit to git):

```env
# ============================================
# APPLICATION CONFIGURATION
# ============================================
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://tribe.pilareta.com

# ============================================
# DATABASE (PostgreSQL)
# ============================================
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL=postgresql://tribe:YOUR_SECURE_PASSWORD@localhost:5432/pilareta_tribe

# ============================================
# SESSION MANAGEMENT
# ============================================
# Generate with: openssl rand -hex 32
SESSION_SECRET=your_32_character_random_string_here

# ============================================
# SHOPIFY INTEGRATION
# ============================================
SHOPIFY_STORE_DOMAIN=pilaretatribe.myshopify.com
SHOPIFY_CLIENT_ID=your_shopify_client_id
SHOPIFY_SHOP_ID=your_shopify_shop_id
SHOPIFY_ACCOUNTS_MODE=new
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_storefront_access_token

# ============================================
# GOOGLE MAPS API
# ============================================
# Restrict these keys in Google Cloud Console
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Security Notes
- Never commit `.env` or `.env.local` files to git
- Generate SESSION_SECRET with: `openssl rand -hex 32`
- Restrict Google Maps API keys by HTTP referrer in Google Cloud Console
- Use strong PostgreSQL passwords (min 16 characters, mixed case, numbers, symbols)

---

## Database Setup

### Installation (Amazon Linux 2023)
```bash
# Install PostgreSQL 15
sudo dnf install -y postgresql15-server postgresql15

# Initialize database
sudo postgresql-setup --initdb

# Start and enable service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Create Database and User
```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL shell:
CREATE USER tribe WITH PASSWORD 'YOUR_SECURE_PASSWORD';
CREATE DATABASE pilareta_tribe OWNER tribe;
GRANT ALL PRIVILEGES ON DATABASE pilareta_tribe TO tribe;
\q
```

### Configure Authentication
Edit `/var/lib/pgsql/data/pg_hba.conf`:
```
# Add this line for local connections
host    pilareta_tribe    tribe    127.0.0.1/32    md5
```

Restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

### Initialize Schema
```bash
cd /var/www/pilareta-tribe

# Push Prisma schema to database
pnpm prisma db push

# Seed with initial data (exercises, programs)
pnpm db:seed
```

### Database Schema Overview
The database contains 23+ Prisma models:

**User & Auth:**
- User, Session

**Community (UGC):**
- UgcPost, UgcLike, UgcComment, UgcSave, UgcTag, UgcPostTag

**Studios:**
- Studio, StudioClaim, StudioEditSuggestion, GeoCache, ApiUsageLog

**Learn Pilates:**
- Exercise, PilatesSession, PilatesSessionItem
- Program, ProgramWeek, ProgramSession
- SessionTemplate, SessionTemplateItem
- UserSessionCompletion, UserExerciseCompletion, UserProgramProgress

---

## Nginx Configuration

### Installation
```bash
sudo dnf install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### Configuration File
Create `/etc/nginx/conf.d/tribe.conf`:

```nginx
server {
    listen 80;
    server_name tribe.pilareta.com;

    # Redirect HTTP to HTTPS (uncomment after SSL setup)
    # return 301 https://$server_name$request_uri;

    # Upload size limit
    client_max_body_size 10M;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1000;

    # Proxy to Next.js app
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static assets caching
    location /_next/static {
        proxy_pass http://127.0.0.1:3000;
        add_header Cache-Control "public, immutable, max-age=31536000";
    }

    location /public {
        proxy_pass http://127.0.0.1:3000;
        add_header Cache-Control "public, max-age=86400";
    }
}
```

### Test and Reload
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## PM2 Process Management

### Installation
```bash
npm install -g pm2
```

### Ecosystem Configuration
Create `/var/www/pilareta-tribe/ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'pilareta-tribe',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/pilareta-tribe',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

### Start Application
```bash
cd /var/www/pilareta-tribe
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u ec2-user --hp /home/ec2-user
```

### PM2 Commands
```bash
pm2 status                    # Check status
pm2 logs pilareta-tribe       # View logs
pm2 restart pilareta-tribe    # Restart app
pm2 reload pilareta-tribe     # Zero-downtime reload
pm2 stop pilareta-tribe       # Stop app
pm2 monit                     # Monitor dashboard
```

---

## SSL/HTTPS Setup

### Install Certbot
```bash
sudo dnf install -y certbot python3-certbot-nginx
```

### Obtain Certificate
```bash
sudo certbot --nginx -d tribe.pilareta.com
```

### Auto-Renewal
Certbot automatically adds a renewal cron job. Test it:
```bash
sudo certbot renew --dry-run
```

### After SSL Setup
Update Nginx config to redirect HTTP to HTTPS (uncomment the redirect line).

---

## File Storage

### Upload Directory
```
Location: /var/www/pilareta-tribe/public/uploads/
Structure:
├── ugc/
│   ├── images/YYYY/MM/
│   └── videos/YYYY/MM/
```

### Create Directory
```bash
mkdir -p /var/www/pilareta-tribe/public/uploads/ugc/images
mkdir -p /var/www/pilareta-tribe/public/uploads/ugc/videos
chown -R ec2-user:ec2-user /var/www/pilareta-tribe/public/uploads
chmod -R 755 /var/www/pilareta-tribe/public/uploads
```

### File Limits
| Type | Max Size | Formats |
|------|----------|---------|
| Images | 5MB | JPG, PNG, GIF, WebP |
| Videos | 100MB | MP4, MOV, WebM |

### Rate Limits
- 5 uploads per hour per user
- 20 uploads per day per user

---

## External Services

### Shopify Integration
- **Purpose**: User authentication (OAuth) and product catalog
- **Mode**: New Customer Accounts (OpenID Connect)
- **Callback URL**: `https://tribe.pilareta.com/api/auth/callback`
- **API Version**: 2024-01

**Required Scopes:**
- `openid`
- `email`
- `customer-account-api:full`

### Google Maps API
- **Purpose**: Studio locator, geocoding, place details
- **APIs Used**:
  - Places API (Nearby Search, Place Details)
  - Geocoding API
  - Maps JavaScript API

**Rate Limits (cached to reduce costs):**
| API | Daily Limit | Cache Duration |
|-----|-------------|----------------|
| Nearby Search | 100 | 24 hours |
| Place Details | 200 | 7 days |
| Geocoding | 500 | 30 days |

---

## Deployment

### Standard Deployment
```bash
ssh -i pilareta-tribe-key.pem ec2-user@13.205.55.164

cd /var/www/pilareta-tribe
git pull
pnpm install
pnpm build
pm2 restart ecosystem.config.js --update-env
```

### Using Deploy Script
```bash
/var/www/pilareta-tribe/deploy.sh
```

### First-Time Setup
```bash
# 1. Clone repository
cd /var/www
git clone https://github.com/shoppilareta/pilareta-tribe.git
cd pilareta-tribe

# 2. Install dependencies
pnpm install

# 3. Create environment file
cp .env.example .env.local
nano .env.local  # Fill in all values

# 4. Setup database
pnpm prisma db push
pnpm db:seed

# 5. Build and start
pnpm build
pm2 start ecosystem.config.js
pm2 save
```

---

## Backup & Recovery

### Database Backup
```bash
# Manual backup
pg_dump -U tribe pilareta_tribe > backup_$(date +%Y%m%d).sql

# Using backup script
/var/www/pilareta-tribe/server/backup-db.sh
```

### Database Restore
```bash
psql -U tribe pilareta_tribe < backup_YYYYMMDD.sql
```

### Recommended Backup Schedule
- **Database**: Daily automated backup
- **Uploads**: Weekly sync to S3 or external storage
- **Retention**: 30 days

---

## Monitoring & Maintenance

### Log Locations
```
Application: pm2 logs pilareta-tribe
Nginx Access: /var/log/nginx/access.log
Nginx Error: /var/log/nginx/error.log
PostgreSQL: /var/lib/pgsql/data/log/
```

### Health Checks
```bash
# Check app status
pm2 status
curl -I https://tribe.pilareta.com

# Check database
psql -U tribe -d pilareta_tribe -c "SELECT 1"

# Check disk space
df -h

# Check memory
free -m
```

### Maintenance Tasks
| Task | Frequency | Command |
|------|-----------|---------|
| Update dependencies | Monthly | `pnpm update` |
| Vacuum database | Weekly | `VACUUM ANALYZE;` |
| Check SSL expiry | Monthly | `certbot certificates` |
| Review logs | Weekly | `pm2 logs --lines 1000` |
| Rotate logs | Monthly | `pm2 flush` |

---

## Quick Reference

### SSH Access
```bash
ssh -i pilareta-tribe-key.pem ec2-user@13.205.55.164
```

### Common Commands
```bash
# Restart application
pm2 restart pilareta-tribe

# View logs
pm2 logs pilareta-tribe

# Rebuild after code changes
pnpm build && pm2 restart pilareta-tribe

# Database migrations
pnpm prisma db push

# Check service status
systemctl status nginx postgresql
```

### Important Paths
```
App Directory:     /var/www/pilareta-tribe
Environment File:  /var/www/pilareta-tribe/.env.local
Nginx Config:      /etc/nginx/conf.d/tribe.conf
PM2 Config:        /var/www/pilareta-tribe/ecosystem.config.js
Uploads:           /var/www/pilareta-tribe/public/uploads
```

---

## Mobile App (EAS Build)

### Overview
The mobile app is built with React Native (Expo SDK 52) and distributed via EAS Build. It lives in the `mobile/` directory of the monorepo.

### Expo Account
```
Account: shoppilareta
Project: pilareta-tribe
Dashboard: https://expo.dev/accounts/shoppilareta/projects/pilareta-tribe
```

### EAS Build Profiles
Defined in `mobile/eas.json`:

| Profile | Platform | Output | Use Case |
|---------|----------|--------|----------|
| `preview` | Android | APK | Testing on physical devices |
| `production` | Android | AAB | Google Play Store submission |

### Build Commands
```bash
cd mobile

# Android APK for testing
npx eas build --profile preview --platform android

# Production AAB for Play Store
npx eas build --profile production --platform android

# Check build status
npx eas build:list

# Download latest build artifact
# Visit: https://expo.dev/accounts/shoppilareta/projects/pilareta-tribe/builds
```

### Mobile Environment
The mobile app fetches data from the web backend API. No separate `.env` file is needed for builds - the API base URL is configured in the app code pointing to `https://tribe.pilareta.com`.

### Known Build Issues

**expo-modules-core must be pinned to 2.1.4**:
Versions 2.2.0+ cause Android build failures. Pinned via pnpm override in root `package.json`:
```json
"pnpm": { "overrides": { "expo-modules-core": "2.1.4" } }
```

**react-native-maps auto-linking must be excluded**:
Transitive dependency that fails without Google Maps API key in native config. Excluded in `mobile/package.json`:
```json
"expo": { "autolinking": { "exclude": ["react-native-maps"] } }
```

### Mobile App Dependencies on Web Backend
The mobile app relies on these web API endpoints:
- `GET /api/shopify/products` - Product catalog
- `POST /api/shopify/cart` - Cart operations (create, add, update, remove)
- `GET /api/auth/mobile/callback` - OAuth callback for mobile auth
- `GET /api/studios/*` - Studio locator data
- `GET /api/learn/*` - Pilates programs and exercises

When deploying backend changes that affect these endpoints, rebuild the mobile app if the response shape changes.

### SSH Key Location
The SSH key for the production server is at:
```
/home/rishabhdara/Projects/pilareta-tribe-key.pem
```
(Not in `~/.ssh/` - stored alongside the project directory)

---

*Last Updated: February 2026*
