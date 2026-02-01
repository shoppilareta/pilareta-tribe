# Claude Code Instructions

This file contains instructions for Claude Code when working on this project.

---

## Project Overview

**Pilareta Tribe** is a Pilates community platform with a **monorepo** containing:
- **Web App**: Next.js 16 (App Router), PostgreSQL/Prisma, Tailwind CSS v4
- **Mobile App**: React Native (Expo SDK 52), Expo Router, Zustand stores
- **Shared Types**: `shared/types/` used by both web and mobile
- **Authentication**: Shopify OAuth (New Customer Accounts) on both platforms
- **Deployment**: AWS EC2 (web), EAS Build (mobile)

---

## Key Directories

```
src/                          # Web app (Next.js)
├── app/                      # Pages and API routes
├── components/               # React components
├── lib/                      # Utilities, database client, external services
└── middleware.ts             # Auth middleware

mobile/                       # Mobile app (React Native / Expo)
├── app/                      # Expo Router pages (file-based routing)
│   ├── (tabs)/               # Tab navigator screens
│   │   ├── community/        # UGC feed, post creation
│   │   ├── learn/            # Pilates programs and sessions
│   │   ├── shop/             # Shopify product catalog, cart
│   │   └── studios/          # Studio locator
│   ├── onboarding/           # First-launch onboarding flow
│   └── _layout.tsx           # Root layout with auth and diagnostic wrappers
├── src/
│   ├── api/                  # API client functions (fetch from web backend)
│   ├── components/           # Reusable UI components
│   ├── stores/               # Zustand state stores (auth, cart, etc.)
│   ├── theme/                # Colors, typography, spacing tokens
│   └── utils/                # Shared utilities (colorCode, etc.)
├── app.json                  # Expo config
├── eas.json                  # EAS Build profiles
└── package.json              # Mobile dependencies

shared/                       # Shared between web and mobile
└── types/
    └── models.ts             # ShopifyProduct, etc.

prisma/
├── schema.prisma             # Database schema
└── seed.ts                   # Database seeding

server/
├── deploy.sh                 # Deployment script
├── backup-db.sh              # Database backup script
├── ecosystem.config.js       # PM2 configuration
├── nginx.conf                # Nginx configuration
└── setup-ec2.sh              # Initial EC2 setup
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

### Web - Standard Deployment
```bash
ssh -i pilareta-tribe-key.pem ec2-user@13.205.55.164
/var/www/pilareta-tribe/deploy.sh
```

### Web - Manual Deployment
```bash
cd /var/www/pilareta-tribe
git pull
pnpm install
pnpm build
pm2 restart server/ecosystem.config.js --update-env
```

### Mobile - EAS Build
```bash
cd mobile
npx eas build --profile preview --platform android   # Android APK for testing
npx eas build --profile production --platform android # Production AAB
```

**Expo Account**: shoppilareta (Expo project: pilareta-tribe)

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
- Follow Next.js App Router conventions (web) and Expo Router conventions (mobile)
- Use Prisma for all database operations (web backend)
- Keep web components in `src/components/`, utilities in `src/lib/`
- Keep mobile components in `mobile/src/components/`, utilities in `mobile/src/utils/`
- Shared types go in `shared/types/` - used by both web and mobile
- Color utility (`getColorCode`) uses fuzzy substring matching with 60+ named colors
- Price formatting: web uses `Intl.NumberFormat('en-IN')`, mobile uses custom `₹` prefix for INR

---

## Testing Locally

### Web
```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run linter
```

### Mobile
```bash
cd mobile
npx expo start    # Start Metro bundler (Expo Go or dev client)
npx expo start --android   # Start with Android
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

---

## Mobile App - Key Learnings

### Build System (EAS Build)
- Uses EAS Build (`eas.json`) with `preview` (APK) and `production` (AAB) profiles
- Builds run on Expo's cloud infrastructure, not locally
- Check build status: `npx eas build:list`

### Known Issues & Workarounds

**expo-modules-core regression (v2.2.0+)**:
- Versions after 2.1.4 cause build failures on Android
- Fixed via pnpm override in root `package.json`:
  ```json
  "pnpm": { "overrides": { "expo-modules-core": "2.1.4" } }
  ```

**react-native-maps auto-linking**:
- `react-native-maps` gets auto-linked even if not directly used (transitive dependency)
- Causes build failures when Google Maps API key isn't configured
- Fixed by excluding from auto-linking in `mobile/package.json`:
  ```json
  "expo": { "autolinking": { "exclude": ["react-native-maps"] } }
  ```

**Diagnostic tryLoad pattern**:
- Some native modules can crash at import time on certain devices
- Root `_layout.tsx` uses `tryLoad()` wrappers for crash-safe module loading
- Modules that fail to load are gracefully degraded

### Shared Types
- `shared/types/models.ts` defines `ShopifyProduct` used by both platforms
- When adding fields to the Shopify API response, update: GraphQL query (`src/lib/shopify/queries.ts`), web types (`src/lib/shopify/types.ts`), shared types (`shared/types/models.ts`), and transform function
- Mobile API client fetches from web backend endpoints (e.g., `/api/shopify/products`)

### Mobile Auth
- Uses the same Shopify OAuth flow but through a WebView
- Mobile-specific callback at `/api/auth/mobile/callback`
- Tokens stored in `expo-secure-store`, managed by `authStore.ts`
- Session includes `refreshToken` and `platform` fields in Prisma schema
