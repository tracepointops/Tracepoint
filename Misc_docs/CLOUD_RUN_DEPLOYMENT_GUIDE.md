# Twenty CRM - Google Cloud Run Deployment Guide

## ✅ Successfully Deployed to Production!

This guide documents the **exact steps** required to deploy Twenty CRM to Google Cloud Run with Cloud SQL and Upstash Redis.

---

## Prerequisites

- Google Cloud Project with billing enabled
- Domain name (tracepointops.com)
- GitHub repository
- Firebase project (for frontend hosting)
- Upstash Redis account

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Production Setup                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Firebase Hosting                                           │
│  └─> Frontend (React)                                       │
│      URL: top.tracepointops.com                            │
│                                                              │
│  Google Cloud Run                                           │
│  └─> Backend (NestJS/Twenty Server)                        │
│      URL: top-backend-347335323025.us-east1.run.app        │
│      Region: us-east1                                       │
│      Resources: 2 CPU, 2Gi RAM                             │
│                                                              │
│  Google Cloud SQL                                           │
│  └─> PostgreSQL 15                                         │
│      Instance: tracepoint-top-db                           │
│      Tier: db-f1-micro                                     │
│                                                              │
│  Upstash Redis                                              │
│  └─> Managed Redis                                         │
│      Free tier                                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Part 1: Infrastructure Setup

### 1.1 Create Cloud SQL Database

```bash
# Create PostgreSQL instance
gcloud sql instances create tracepoint-top-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-east1 \
  --root-password=Basegrain23percent19844850605091984641316

# Create database
gcloud sql databases create postgres \
  --instance=tracepoint-top-db
```

### 1.2 Setup Upstash Redis

1. Go to https://upstash.com/
2. Create free account
3. Create Redis database
4. Copy the Redis URL (format: `rediss://default:xxx@xxx.upstash.io:6379`)

### 1.3 Generate APP_SECRET

```bash
# Generate a secure random secret
openssl rand -base64 32
# Save this output as APP_SECRET
```

---

## Part 2: Backend Docker Configuration

### 2.1 Create Custom Entrypoint Script

**File: `packages/twenty-server/entrypoint.sh`**

```bash
#!/bin/sh
set -e

cd /app/packages/twenty-server

echo "🔍 Checking if database needs initialization..."

# Check if core schema exists
SCHEMA_EXISTS=$(node -e "
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.PG_DATABASE_URL });
client.connect().then(() => {
  return client.query(\"SELECT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'core')\");
}).then(result => {
  console.log(result.rows[0].exists ? 'true' : 'false');
  client.end();
}).catch(err => {
  console.log('false');
  client.end();
});
")

if [ "$SCHEMA_EXISTS" = "false" ]; then
  echo "📦 Database is empty - running setup from TypeScript source..."
  npx tsx ./scripts/setup-db.ts
  echo "🌱 Running database migrations..."
  yarn database:migrate:prod
  echo "🌱 Seeding dev workspaces..."
  yarn command:prod workspace:seed:dev
else
  echo "✅ Database already initialized"
  # Run upgrade command in case there are pending migrations
  yarn command:prod upgrade || echo "⚠️  Upgrade failed but continuing..."
fi

echo "🚀 Starting Twenty server..."
exec node /app/packages/twenty-server/dist/src/main.js
```

**Make it executable:**
```bash
chmod +x packages/twenty-server/entrypoint.sh
```

### 2.2 Create Production Dockerfile

**File: `packages/twenty-server/Dockerfile.production`**

```dockerfile
FROM node:20-slim

# Install build dependencies (single layer)
RUN apt-get update && apt-get install -y \
    python3 make g++ gcc git ca-certificates \
    libvips-dev libvips42 pkg-config build-essential \
    && rm -rf /var/lib/apt/lists/*

# Enable Corepack
RUN corepack enable && corepack prepare yarn@4.9.2 --activate

WORKDIR /app

# Copy package files (cached layer)
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
COPY packages/twenty-server/package.json ./packages/twenty-server/
COPY packages/twenty-emails/package.json ./packages/twenty-emails/
COPY packages/twenty-shared/package.json ./packages/twenty-shared/
COPY packages/twenty-server/patches ./packages/twenty-server/patches

# Install dependencies
RUN yarn install && yarn cache clean

# Copy source
COPY packages/twenty-server ./packages/twenty-server/
COPY packages/twenty-emails ./packages/twenty-emails/
COPY packages/twenty-shared ./packages/twenty-shared/
COPY tsconfig.base.json ./
COPY nx.json ./

# Build shared package
WORKDIR /app/packages/twenty-shared
RUN npx vite build

# Build emails package
WORKDIR /app/packages/twenty-emails
RUN npx vite build

# Build server
WORKDIR /app/packages/twenty-server
RUN npx rimraf dist && npx nest build --path ./tsconfig.build.json

# Clean up build artifacts to save memory (keep scripts and database source for setup)
RUN rm -rf /app/.yarn/cache \
    /app/packages/twenty-server/src/engine \
    /app/packages/twenty-server/src/modules \
    /app/packages/twenty-server/src/filters \
    /app/packages/twenty-server/src/utils \
    /app/packages/twenty-server/src/main.ts \
    /app/packages/twenty-server/src/instrument.ts \
    /app/packages/twenty-server/src/app.module.ts \
    /app/packages/twenty-shared/src

WORKDIR /app

# Copy entrypoint script
COPY packages/twenty-server/entrypoint.sh /app/packages/twenty-server/
RUN chmod +x /app/packages/twenty-server/entrypoint.sh

EXPOSE 3000

# Use entrypoint script that handles database setup
ENTRYPOINT ["/app/packages/twenty-server/entrypoint.sh"]
```

### 2.3 Create Cloud Build Configuration

**File: `cloudbuild.yaml` (in repository root)**

```yaml
steps:
  # Build and push the Docker image using Kaniko
  - name: 'gcr.io/kaniko-project/executor:latest'
    args:
      - '--dockerfile=packages/twenty-server/Dockerfile.production'
      - '--context=dir:///workspace'
      - '--destination=gcr.io/$PROJECT_ID/top-backend:latest'
      - '--cache=true'
      - '--cache-ttl=24h'

  # Deploy to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'top-backend'
      - '--image'
      - 'gcr.io/$PROJECT_ID/top-backend:latest'
      - '--region'
      - 'us-east1'
      - '--platform'
      - 'managed'
      - '--allow-unauthenticated'
      - '--port=3000'
      - '--add-cloudsql-instances=tracepoint-d4c9d:us-east1:tracepoint-top-db'
      - '--set-env-vars=DATABASE_MIGRATION=run,SERVER_URL=https://top.tracepointops.com,FRONTEND_URL=https://top.tracepointops.com,IS_MULTIWORKSPACE_ENABLED=false,DEFAULT_SUBDOMAIN=,APP_SECRET=YOUR_APP_SECRET_HERE,REDIS_URL=YOUR_REDIS_URL_HERE,PG_DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@/postgres?host=/cloudsql/tracepoint-d4c9d:us-east1:tracepoint-top-db,REMOVE_BG_API_KEY=YOUR_API_KEY_HERE'
      - '--timeout=600'
      - '--memory=2Gi'
      - '--cpu=2'
      - '--max-instances=10'
      - '--min-instances=0'

images:
  - 'gcr.io/$PROJECT_ID/top-backend:latest'

timeout: 3600s
```

**⚠️ IMPORTANT:** Replace these values:
- `YOUR_APP_SECRET_HERE` - Generated from `openssl rand -base64 32`
- `YOUR_REDIS_URL_HERE` - Upstash Redis URL
- `YOUR_PASSWORD` - Cloud SQL password
- `YOUR_API_KEY_HERE` - Remove.bg API key (optional)

---

## Part 3: Frontend Configuration

### 3.1 Update Frontend Environment

**File: `packages/twenty-front/.env.production`**

```bash
VITE_API_URL=https://top.tracepointops.com
VITE_SERVER_URL=https://top.tracepointops.com
```

### 3.2 Build Frontend

```bash
cd packages/twenty-front
yarn build
```

### 3.3 Deploy to Firebase

```bash
firebase deploy --only hosting
```

---

## Part 4: Deployment

### 4.1 Build and Deploy Backend

```bash
# From repository root
gcloud builds submit --config=cloudbuild.yaml .
```

**Expected duration:** 7-10 minutes with cache

### 4.2 Verify Deployment

```bash
# Check Cloud Run service status
gcloud run services describe top-backend --region=us-east1

# Check logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=top-backend" --limit=50 --format="value(textPayload)"
```

### 4.3 Verify Database Initialization

```bash
# Connect to Cloud SQL
gcloud sql connect tracepoint-top-db --user=postgres

# Check workspaces
SELECT id, "displayName", subdomain, "activationStatus" FROM core.workspace;
```

**Expected output:**
```
id                                   | displayName  | subdomain | activationStatus
-------------------------------------+--------------+-----------+-----------------
20202020-1c25-4d02-bf25-6aeccf7ea419 | Apple        | apple     | ACTIVE
3b8e6458-5fc1-4e63-8563-008ccddaa6db | YCombinator  | yc        | ACTIVE
```

---

## Part 5: DNS Configuration

### 5.1 Point Domain to Firebase

In your DNS provider (e.g., Namecheap, GoDaddy):

```
Type: A
Host: top
Value: [Firebase IP from Firebase Console]

Type: TXT
Host: top
Value: [Firebase verification from Firebase Console]
```

### 5.2 Configure Firebase Hosting

**File: `firebase.json`**

```json
{
  "hosting": {
    "public": "packages/twenty-front/build",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "/graphql",
        "run": {
          "serviceId": "top-backend",
          "region": "us-east1"
        }
      },
      {
        "source": "/metadata",
        "run": {
          "serviceId": "top-backend",
          "region": "us-east1"
        }
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

---

## Environment Variables Reference

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SERVER_URL` | Backend public URL | `https://top.tracepointops.com` |
| `FRONTEND_URL` | Frontend public URL | `https://top.tracepointops.com` |
| `PG_DATABASE_URL` | PostgreSQL connection | `postgresql://postgres:pass@/postgres?host=/cloudsql/...` |
| `REDIS_URL` | Redis connection | `rediss://default:xxx@xxx.upstash.io:6379` |
| `APP_SECRET` | Encryption secret | Output from `openssl rand -base64 32` |
| `IS_MULTIWORKSPACE_ENABLED` | Multi-workspace mode | `false` (for single workspace) |
| `DEFAULT_SUBDOMAIN` | Default subdomain | Empty string for custom domain |
| `DATABASE_MIGRATION` | Run migrations on startup | `run` |

### Optional Environment Variables

| Variable | Description |
|----------|-------------|
| `REMOVE_BG_API_KEY` | Background removal API key |
| `LOGGER_LEVEL` | Logging level (debug, info, warn, error) |
| `STORAGE_TYPE` | File storage type (local, s3) |

---

## Post-Deployment Checklist

- [ ] Backend deployed to Cloud Run
- [ ] Frontend deployed to Firebase
- [ ] Database initialized with workspaces
- [ ] DNS configured and propagated
- [ ] Can access https://top.tracepointops.com
- [ ] Can sign up / create account
- [ ] Backend logs show no errors
- [ ] Database has Apple and YCombinator workspaces

---

## Common Commands

### View Logs
```bash
# Backend logs (last 50 entries)
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=top-backend" --limit=50

# Backend logs (real-time)
gcloud logging tail "resource.type=cloud_run_revision AND resource.labels.service_name=top-backend"
```

### Redeploy Backend
```bash
gcloud builds submit --config=cloudbuild.yaml .
```

### Redeploy Frontend
```bash
cd packages/twenty-front
yarn build
firebase deploy --only hosting
```

### Database Access
```bash
# Connect via Cloud SQL Proxy
gcloud sql connect tracepoint-top-db --user=postgres

# Or use connection string
psql "postgresql://postgres:YOUR_PASSWORD@/postgres?host=/cloudsql/tracepoint-d4c9d:us-east1:tracepoint-top-db"
```

### Update Environment Variables
```bash
gcloud run services update top-backend \
  --region=us-east1 \
  --update-env-vars="KEY=value"
```

---

## Key Technical Details

### Why Custom Entrypoint?

Twenty CRM was designed for Docker Compose where initialization happens via orchestration. Cloud Run doesn't support multi-container deployments, so we need to:

1. Check if database is empty on startup
2. Run setup scripts if needed
3. Seed initial workspaces
4. Then start the server

This is handled in `entrypoint.sh`.

### Why Keep Source Files?

The entrypoint uses `npx tsx ./scripts/setup-db.ts` which requires TypeScript source files. NestJS only compiles the `src/` directory, not `scripts/`, so we preserve:
- `scripts/` folder (for setup-db.ts)
- `src/database/` folder (for TypeORM metadata)

### Why Seed Dev Workspaces?

Twenty requires at least one workspace to exist for TypeORM to initialize properly. The dev workspaces (Apple & YCombinator) provide this initial state.

---

## Cost Estimate (Monthly)

| Service | Configuration | Cost |
|---------|--------------|------|
| Cloud Run | 2 CPU, 2Gi RAM, low traffic | $10-30 |
| Cloud SQL | db-f1-micro | $10-20 |
| Upstash Redis | Free tier | $0 |
| Firebase Hosting | Free tier | $0 |
| **Total** | | **$20-50/mo** |

---

## Success Criteria

✅ **Deployment Successful When:**

1. `https://top.tracepointops.com` loads without errors
2. Backend logs show: "🚀 Starting Twenty server..."
3. Database contains Apple and YCombinator workspaces
4. Can create new user accounts
5. No "No metadata for WorkspaceEntity" errors

---

## Troubleshooting Quick Reference

See `DEPLOYMENT_TROUBLESHOOTING.md` for detailed troubleshooting steps.

**Most Common Issues:**
- Entrypoint script not executable → `chmod +x entrypoint.sh`
- Missing environment variables → Check Cloud Run service config
- Database connection failed → Verify Cloud SQL instance name
- Build cache issues → Clear with `--no-cache` flag

---

## Next Steps

1. **Set up monitoring** - Configure Cloud Monitoring alerts
2. **Configure backups** - Enable automated Cloud SQL backups
3. **Add custom authentication** - Configure OAuth providers
4. **Scale resources** - Adjust CPU/memory based on usage
5. **Set up CI/CD** - Automate deployments on git push

---

**Deployment Guide Version:** 1.0
**Last Updated:** November 16, 2025
**Status:** ✅ Production Ready
