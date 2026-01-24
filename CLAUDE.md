# Claude Code Instructions

This file contains instructions for Claude Code when working on this project.

---

## Project Overview

**Pilareta Tribe** is a Pilates community platform built with:
- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS v4
- **Authentication**: Shopify OAuth (New Customer Accounts)
- **Deployment**: AWS EC2 with Nginx, PM2

---

## Key Directories

```
src/
├── app/              # Next.js pages and API routes
├── components/       # React components
├── lib/              # Utilities, database client, external services
└── middleware.ts     # Auth middleware

prisma/
├── schema.prisma     # Database schema
└── seed.ts          # Database seeding

server/
├── deploy.sh        # Deployment script
├── backup-db.sh     # Database backup script
├── ecosystem.config.js  # PM2 configuration
├── nginx.conf       # Nginx configuration
└── setup-ec2.sh     # Initial EC2 setup
```

---

## Infrastructure Documentation

**IMPORTANT: Keep Documentation Updated**

When making changes to any of the following, **always update** `INFRASTRUCTURE.md`:

- Environment variables (adding, removing, or changing)
- External service integrations (Shopify, Google Maps, etc.)
- Database schema (new models, fields, indexes)
- Server configurations (Nginx, PM2, SSL)
- System dependencies (Node.js version, new packages)
- Deployment procedures
- File storage or upload configurations

This ensures the EC2 instance can be reproduced from scratch if needed.

---

## Deployment

### Standard Deployment
```bash
ssh -i pilareta-tribe-key.pem ec2-user@13.205.55.164
/var/www/pilareta-tribe/deploy.sh
```

### Manual Deployment
```bash
cd /var/www/pilareta-tribe
git pull
pnpm install
pnpm build
pm2 restart ecosystem.config.js --update-env
```

---

## Database

### Connection
```
Host: localhost
Port: 5432
Database: pilareta_tribe
User: tribe
```

### Commands
```bash
pnpm prisma db push      # Push schema changes
pnpm db:seed             # Seed database
pnpm prisma studio       # Open Prisma Studio
```

---

## Environment Variables

Required variables are documented in:
- `.env.example` - Template with all variables
- `INFRASTRUCTURE.md` - Full documentation

Never commit actual credentials to git.

---

## External Services

### Shopify
- Store: pilaretatribe.myshopify.com
- Mode: New Customer Accounts (OAuth)
- Callback: /api/auth/callback

### Google Maps
- Used for: Studio locator, geocoding
- APIs: Places, Geocoding, Maps JavaScript
- Rate limits are cached to reduce costs

---

## Code Style

- Use TypeScript strict mode
- Follow Next.js App Router conventions
- Use Prisma for all database operations
- Keep components in `src/components/`
- Keep utilities in `src/lib/`

---

## Testing Locally

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run linter
```

---

## Common Tasks

### Add a new API route
Create file at `src/app/api/[route]/route.ts`

### Add a database model
1. Update `prisma/schema.prisma`
2. Run `pnpm prisma db push`
3. Update `INFRASTRUCTURE.md` if significant

### Add environment variable
1. Add to `.env.local` on server
2. Add to `.env.example` (with placeholder)
3. Update `INFRASTRUCTURE.md`
4. Update `server/ecosystem.config.js` if needed
