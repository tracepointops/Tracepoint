# Twenty CRM - Complete GCP Deployment Guide
**Production Deployment on Google Cloud Platform**

## Table of Contents
1. [Infrastructure Overview](#infrastructure-overview)
2. [Database Setup](#database-setup)
3. [Redis Setup](#redis-setup)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Domain Configuration](#domain-configuration)
7. [First User Setup](#first-user-setup)
8. [Troubleshooting](#troubleshooting)

---

## Infrastructure Overview

### Services Used
- **Cloud SQL (PostgreSQL 15)**: Main database
- **Upstash Redis**: Cache and session storage
- **Cloud Run**: Backend API server
- **Firebase Hosting**: Frontend static files and API proxy
- **Cloud Build**: CI/CD pipeline

### Architecture
```
Internet → Firebase Hosting (top.tracepointops.com)
           ├── Static Files (React App)
           └── API Proxy (/graphql, /metadata, /client-config, /rest)
                    ↓
           Cloud Run Backend (top-backend)
                    ↓
           ┌────────┴────────┐
           ↓                 ↓
    Cloud SQL          Upstash Redis
    (PostgreSQL)       (TLS enabled)
```

---

## Database Setup

### Cloud SQL Instance
- **Instance ID**: `tracepoint-top-db`
- **Database Version**: PostgreSQL 15
- **Region**: `us-east1`
- **Tier**: `db-f1-micro` (can be upgraded)
- **Storage**: 10 GB SSD

### Connection Details
```bash
# Get instance IP
gcloud sql instances describe tracepoint-top-db \
  --format='value(ipAddresses[0].ipAddress)'

# Connection string format
postgresql://postgres:${PG_DATABASE_PASSWORD}@${INSTANCE_IP}:5432/postgres
```

### Required Schemas
Twenty requires these PostgreSQL schemas:
- `core` - Main application data
- `metadata` - Workspace-specific metadata
- `public` - PostgreSQL default

**Verify schemas:**
```sql
\dn
-- Should show: core, metadata, public
```

### Database Migrations
Migrations run automatically on backend startup when:
```env
DATABASE_MIGRATION=run
```

**Check migration status:**
```sql
SELECT * FROM core._typeorm_migrations ORDER BY id DESC;
```

### Initial Workspace Creation
Twenty creates workspace schemas dynamically per workspace:
- First signup creates the default workspace
- Workspace schema: `workspace_{workspace_id}`
- Contains all workspace-specific tables

---

## Redis Setup

### Upstash Configuration
- **Provider**: Upstash
- **TLS**: Required (enabled by default)
- **Connection**: TLS endpoint only

### Connection String
```env
REDIS_URL=rediss://:${REDIS_PASSWORD}@${REDIS_ENDPOINT}
```

**Important:** Use `rediss://` (with double 's') for TLS connection.

### Required Environment Variables
```env
REDIS_URL=rediss://default:your_password@endpoint.upstash.io:6379
CACHE_STORAGE_TYPE=redis
CACHE_STORAGE_TTL=3600
```

---

## Backend Deployment

### Cloud Run Service
- **Service Name**: `top-backend`
- **Region**: `us-east1`
- **Container Port**: 3000
- **Min Instances**: 0
- **Max Instances**: 10

### Build Configuration
Build uses `cloudbuild.yaml` with Kaniko:
```yaml
steps:
  - name: 'gcr.io/kaniko-project/executor:latest'
    args:
      - '--dockerfile=./packages/twenty-docker/twenty/Dockerfile'
      - '--destination=gcr.io/${PROJECT_ID}/top-backend:latest'
      - '--cache=true'
```

### Environment Variables (Cloud Run)
```env
# Core
APP_SECRET=<random-secret>
SERVER_URL=https://top.tracepointops.com
NODE_ENV=production

# Database
PG_DATABASE_URL=postgresql://postgres:${PASSWORD}@${IP}:5432/postgres
DATABASE_MIGRATION=run

# Redis
REDIS_URL=rediss://...
CACHE_STORAGE_TYPE=redis

# Configuration
IS_MULTIWORKSPACE_ENABLED=false
IS_CONFIG_VARIABLES_IN_DB_ENABLED=true

# Storage
STORAGE_TYPE=local
STORAGE_LOCAL_PATH=/app/.local-storage

# Authentication
AUTH_PASSWORD_ENABLED=true
AUTH_GOOGLE_ENABLED=false
AUTH_MICROSOFT_ENABLED=false
```

### Cloud SQL Proxy
Backend connects to Cloud SQL via:
1. **Cloud SQL Admin API** enabled
2. **Service account** with Cloud SQL Client role
3. **Connection name** set in environment

### Build Process
1. Git push triggers Cloud Build
2. Kaniko builds Docker image
3. Image pushed to Container Registry
4. Cloud Run deploys new revision
5. IAM policy set for public access

**Manual deployment:**
```bash
gcloud builds submit --config=cloudbuild.yaml .
```

**Check build status:**
```bash
gcloud builds list --limit=5
```

**Note:** Builds may show "FAILURE" status due to image tagging issue, but deployment actually succeeds. Verify by checking Cloud Run revisions.

---

## Frontend Deployment

### Firebase Hosting
- **Site**: `top-tracepointops`
- **Custom Domain**: `top.tracepointops.com`
- **Build Output**: `packages/twenty-front/build`

### Build Configuration
Frontend must be built with production server URL:
```bash
cd packages/twenty-front
REACT_APP_SERVER_BASE_URL=https://top.tracepointops.com yarn build
```

**Critical:** The `REACT_APP_SERVER_BASE_URL` must be set during build, not just in `.env`.

### Firebase Configuration (`firebase.json`)
```json
{
  "hosting": [
    {
      "target": "top",
      "public": "packages/twenty-front/build",
      "rewrites": [
        {
          "source": "/client-config**",
          "run": {
            "serviceId": "top-backend",
            "region": "us-east1"
          }
        },
        {
          "source": "/graphql**",
          "run": {
            "serviceId": "top-backend",
            "region": "us-east1"
          }
        },
        {
          "source": "/metadata**",
          "run": {
            "serviceId": "top-backend",
            "region": "us-east1"
          }
        },
        {
          "source": "/healthz**",
          "run": {
            "serviceId": "top-backend",
            "region": "us-east1"
          }
        },
        {
          "source": "/rest**",
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
  ]
}
```

### Deployment Process
```bash
# Build with correct server URL
cd packages/twenty-front
REACT_APP_SERVER_BASE_URL=https://top.tracepointops.com yarn build

# Deploy to Firebase
cd ../..
firebase deploy --only hosting
```

### API Proxying
Firebase Hosting proxies these paths to Cloud Run:
- `/client-config` - Initial app configuration
- `/graphql` - Main GraphQL API
- `/metadata` - Schema metadata
- `/rest` - REST API endpoints
- `/healthz` - Health checks

All other paths serve the React SPA (`index.html`).

---

## Domain Configuration

### DNS Setup
1. **Domain**: `tracepointops.com`
2. **Subdomain**: `top.tracepointops.com`
3. **DNS Record**: CNAME → Firebase Hosting

### Firebase Hosting Domain
1. Go to Firebase Console → Hosting
2. Add custom domain: `top.tracepointops.com`
3. Verify domain ownership
4. Add provided DNS records to domain registrar
5. Wait for SSL certificate provisioning

### Cloud Run Service URL
- **Default URL**: `https://top-backend-347335323025.us-east1.run.app`
- **Custom Domain**: Proxied through Firebase Hosting

---

## First User Setup

### Workspace Creation Flow
When `IS_MULTIWORKSPACE_ENABLED=false`:

1. **No workspace exists**: First signup creates default workspace
2. **Workspace exists**: No new signups allowed (single workspace mode)

### Signup Process
1. Navigate to `https://top.tracepointops.com`
2. Create account with email/password
3. System automatically:
   - Creates user
   - Creates workspace (if first user)
   - Creates workspace schema in database
   - Runs workspace-specific migrations
   - Sets workspace status to ACTIVE
   - Creates workspace member

### Workspace Activation
Workspaces go through these states:
- `PENDING_CREATION` - Initial state
- `ONGOING_CREATION` - Activation in progress
- `ACTIVE` - Ready to use

If workspace gets stuck in `PENDING_CREATION`:
```sql
-- Check workspace status
SELECT id, "displayName", "activationStatus", "databaseSchema"
FROM core.workspace;

-- Delete broken workspace (ONLY if stuck and no data)
DELETE FROM core.workspace WHERE "activationStatus" = 'PENDING_CREATION';
```

### Admin Access
Grant admin panel access:
```sql
UPDATE core."user"
SET "canAccessFullAdminPanel" = TRUE
WHERE email = 'your@email.com';
```

---

## Troubleshooting

### Build Failures
**Issue:** Cloud Build shows "FAILURE" but deployment works
**Cause:** Image tag mismatch error at end of build
**Solution:** Check Cloud Run revisions - if new revision exists, deployment succeeded

### Frontend Loading Forever
**Symptoms:** White screen, loading spinner, no errors
**Causes:**
1. `REACT_APP_SERVER_BASE_URL` not set during build
2. Missing `/client-config` proxy in Firebase
3. Backend not accessible

**Fix:**
```bash
# Rebuild with correct URL
cd packages/twenty-front
REACT_APP_SERVER_BASE_URL=https://top.tracepointops.com yarn build
cd ../..
firebase deploy --only hosting
```

### Database Connection Errors
**Issue:** Backend can't connect to Cloud SQL
**Check:**
1. Cloud SQL Admin API enabled
2. Service account has Cloud SQL Client role
3. Connection string correct in environment variables
4. Database allows connections from Cloud Run

### Redis Connection Errors
**Issue:** `ECONNREFUSED` or TLS errors
**Fix:**
- Use `rediss://` (not `redis://`)
- Verify Upstash endpoint is correct
- Check password is correct

### Workspace Metadata Errors
**Issue:** "No metadata for WorkspaceEntity was found"
**Causes:**
1. No workspace created yet (need to sign up)
2. Workspace stuck in PENDING_CREATION
3. Migrations didn't run

**Fix:**
```sql
-- Check if workspace exists
SELECT COUNT(*) FROM core.workspace;

-- If stuck, delete and recreate via signup
DELETE FROM core.workspace WHERE "activationStatus" = 'PENDING_CREATION';
```

### API Requests Pending
**Issue:** Frontend makes requests but they never complete
**Cause:** Missing API proxy routes in `firebase.json`
**Fix:** Ensure all API paths are proxied to Cloud Run

### Migration Errors
**Issue:** Migrations fail or don't run
**Check:**
```sql
-- View migration history
SELECT * FROM core._typeorm_migrations ORDER BY id DESC LIMIT 10;

-- Count migrations
SELECT COUNT(*) FROM core._typeorm_migrations;
-- Should have ~52 migrations
```

### Health Check Failures
**Test health endpoints:**
```bash
# Via Firebase proxy
curl https://top.tracepointops.com/healthz

# Direct Cloud Run
curl https://top-backend-347335323025.us-east1.run.app/healthz
```

### Logs
**Cloud Run logs:**
```bash
gcloud logging read \
  "resource.type=cloud_run_revision AND resource.labels.service_name=top-backend" \
  --limit=100 --format="table(timestamp,textPayload)"
```

**Cloud Build logs:**
```bash
gcloud builds log <BUILD_ID>
```

---

## Maintenance

### Backup Database
```bash
# Create backup
gcloud sql export sql tracepoint-top-db \
  gs://your-backup-bucket/backup-$(date +%Y%m%d).sql \
  --database=postgres

# Restore from backup
gcloud sql import sql tracepoint-top-db \
  gs://your-backup-bucket/backup-20250115.sql \
  --database=postgres
```

### Update Backend
```bash
# Trigger new build
git push origin main

# Or manual build
gcloud builds submit --config=cloudbuild.yaml .
```

### Update Frontend
```bash
cd packages/twenty-front
REACT_APP_SERVER_BASE_URL=https://top.tracepointops.com yarn build
cd ../..
firebase deploy --only hosting
```

### Monitor Resources
```bash
# Cloud Run metrics
gcloud run services describe top-backend --region=us-east1

# Database metrics
gcloud sql instances describe tracepoint-top-db
```

---

## Security Checklist

- [ ] Cloud SQL has private IP (or IP allowlist)
- [ ] Redis uses TLS (rediss://)
- [ ] APP_SECRET is strong random string
- [ ] PG_DATABASE_PASSWORD is strong
- [ ] Cloud Run IAM policy restricts access
- [ ] Firebase Hosting uses HTTPS
- [ ] Service account has minimal permissions
- [ ] Regular database backups configured

---

## URLs and Access

- **Frontend**: https://top.tracepointops.com
- **Backend (direct)**: https://top-backend-347335323025.us-east1.run.app
- **Firebase Console**: https://console.firebase.google.com/project/tracepoint-d4c9d
- **GCP Console**: https://console.cloud.google.com/

---

## Environment Variables Reference

See `cloudbuild.yaml` for complete list. Key variables:

| Variable | Value | Purpose |
|----------|-------|---------|
| `APP_SECRET` | Random string | JWT signing |
| `SERVER_URL` | https://top.tracepointops.com | Public URL |
| `PG_DATABASE_URL` | postgresql://... | Database connection |
| `REDIS_URL` | rediss://... | Redis connection |
| `DATABASE_MIGRATION` | run | Auto-run migrations |
| `IS_MULTIWORKSPACE_ENABLED` | false | Single workspace mode |
| `REACT_APP_SERVER_BASE_URL` | https://top.tracepointops.com | Frontend API URL |

---

**Last Updated**: November 15, 2025
**Deployment Status**: ✅ Production Ready
**Version**: Twenty v1.0+
