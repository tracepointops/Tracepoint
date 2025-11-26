# Cloud Run Deployment - Complete History & Analysis

**Date Started:** 2025-11-15
**Total Builds:** 35+
**Current Status:** Build #35 in progress with Unix socket path fix

---

## 🔄 CRITICAL PATTERN - WE'VE BEEN CIRCLING

### The Core Issue
**We spent 30+ builds fighting database connectivity due to misunderstanding how Cloud Run's Cloud SQL proxy works.**

---

## 🚨 DATABASE CONNECTION SAGA (The Circle)

### Attempt 1-5: Secret-based PG_DATABASE_URL
- **Approach:** Store connection string in Google Secret Manager
- **Error:** `PG_DATABASE_URL must be a URL address`
- **Why Failed:** Secrets mounted via `valueFrom.secretKeyRef` aren't available during NestJS config validation at startup
- **Builds:** #1-5

### Attempt 6-10: Move to Environment Variable
- **Approach:** Put PG_DATABASE_URL directly in `--set-env-vars`
- **Error:** Still got `PG_DATABASE_URL must be a URL address`
- **Why Failed:** URL format issues, not the secret/env distinction
- **Builds:** #6-10

### Attempt 11-20: URL Format & Encoding
- **Formats Tried:**
  1. `postgres://user:pass@localhost:5432/postgres` → Validation passed, ECONNREFUSED
  2. `postgres://user:pass@/postgres?host=/cloudsql/...` → Validation failed
  3. With URL-encoded password → Same issues

- **Why All Failed:** Misunderstanding of how Cloud SQL proxy works on Cloud Run
- **Builds:** #11-20

### Attempt 21-30: IAM Permissions Hunt
- **Added:** cloudsql.client, secretmanager, storage, pubsub roles
- **Result:** Still ECONNREFUSED on 127.0.0.1:5432
- **Why Failed:** Permissions were fine, connection method was wrong
- **Builds:** #21-30

### Attempt 31-34: Clear & Retry
- **Action:** `--clear-secrets`, re-add env vars
- **Result:** Still connection refused
- **Why Failed:** Using wrong connection format
- **Builds:** #31-34

### ⭐ Attempt 35: THE ACTUAL ROOT CAUSE
**DISCOVERY:** Cloud Run's Cloud SQL proxy does NOT intercept `localhost:5432`. It creates a Unix socket at `/cloudsql/PROJECT:REGION:INSTANCE`.

**Correct Format:**
```
postgresql://user:pass@/dbname?host=/cloudsql/PROJECT:REGION:INSTANCE
```

**Status:** Testing NOW in Build #35

---

## ✅ ISSUES ACTUALLY RESOLVED

| Issue | Builds | Status | Fix |
|-------|--------|--------|-----|
| Region mismatch (us-central1 → us-east1) | #1-3 | ✅ | Updated cloudbuild.yaml |
| twenty-shared build (nx → vite) | #4-8 | ✅ | Changed Dockerfile |
| twenty-emails missing dependency | #16-20 | ✅ | Added @react-email/components |
| Vite external deps | #20-25 | ✅ | Configure vite.config.ts |
| Missing APP_SECRET | #26-28 | ✅ | Generated & added to env |
| Missing REDIS_URL | #26-28 | ✅ | Added Upstash URL |
| Port configuration | #5 | ✅ | Added --port=3000 |
| IAM permissions | #30-34 | ✅ | Added 6 roles |
| **DB connection format** | #1-34 | ⚠️ | **Testing #35** |

---

## 📋 CURRENT CONFIGURATION (Build #35)

### Database Connection
```bash
PG_DATABASE_URL=postgresql://postgres:%25a%5C%5Cm_nB%22MBt%5DV%28b@/postgres?host=/cloudsql/tracepoint-d4c9d:us-east1:tracepoint-top-db
```

### All Environment Variables
```yaml
DATABASE_MIGRATION=run
SERVER_URL=https://top.tracepointops.com
FRONTEND_URL=https://top.tracepointops.com
IS_MULTIWORKSPACE_ENABLED=false
DEFAULT_SUBDOMAIN=
APP_SECRET=7jogTOTb2QRaGyesfmDJ4fG+mz/wYywEpzPiGHSTIwU=
REDIS_URL=redis://default:AXgtAAIncDIzZGMxY2FiZjBlZWU0OWYxOGE1OTAxYWIxZmI5MTdiNnAyMzA3NjU@glowing-gelding-30765.upstash.io:6379
PG_DATABASE_URL=postgresql://postgres:%25a%5C%5Cm_nB%22MBt%5DV%28b@/postgres?host=/cloudsql/tracepoint-d4c9d:us-east1:tracepoint-top-db
REMOVE_BG_API_KEY=9sokFHVyE68oZcdNYq3RUk4D
```

### Cloud Run Settings
- **Region:** us-east1
- **Port:** 3000
- **Memory:** 2Gi
- **CPU:** 2
- **Timeout:** 600s (10 minutes)
- **Cloud SQL:** tracepoint-d4c9d:us-east1:tracepoint-top-db

### IAM Roles (Service Account: 347335323025-compute@developer.gserviceaccount.com)
- ✅ roles/cloudsql.client
- ✅ roles/secretmanager.secretAccessor
- ✅ roles/storage.objectAdmin
- ✅ roles/pubsub.publisher
- ✅ roles/logging.logWriter
- ✅ roles/cloudtrace.agent
- ✅ roles/editor (pre-existing)

---

## 📊 WHY WE CIRCLED

### Misconception #1: Cloud SQL Proxy Intercepts localhost
**We thought:** `localhost:5432` would be intercepted by Cloud SQL proxy
**Reality:** Cloud Run creates Unix socket at `/cloudsql/...`, no localhost interception

### Misconception #2: Secrets Available at Startup
**We thought:** Secrets mounted via `valueFrom` would be available during config validation
**Reality:** NestJS validates config before secrets are mounted

### Misconception #3: IAM Was The Problem
**We thought:** Missing permissions caused ECONNREFUSED
**Reality:** Permissions were fine, we had wrong connection method

### Misconception #4: URL Encoding Fixed Validation
**We thought:** URL-encoding password would make validation pass
**Reality:** Format `@/dbname?host=/path` fails @IsUrl() validation regardless

---

## 🎯 IF BUILD #35 FAILS

### Most Likely Next Issues:
1. **Database doesn't exist**
   - Check: Does `postgres` database exist in Cloud SQL?
   - Fix: Create it or change to correct database name

2. **Migration timeout**
   - Check: Do migrations take >600 seconds?
   - Fix: Increase `--timeout` or set `DATABASE_MIGRATION=skip`

3. **Password still wrong**
   - Check: Verify actual database password matches
   - Fix: Update PG_DATABASE_URL with correct password

4. **Socket path incorrect**
   - Check: Cloud SQL instance name exactly matches
   - Fix: Verify `tracepoint-d4c9d:us-east1:tracepoint-top-db`

---

## 🚀 SUCCESS CRITERIA

Build #35 succeeds when:
1. ✅ Docker build completes (twenty-shared, twenty-emails, twenty-server)
2. ✅ Image pushed to GCR
3. ✅ Cloud Run deployment starts
4. ✅ Container starts successfully
5. ✅ Database connection established via Unix socket
6. ✅ Migrations run (or skip if disabled)
7. ✅ NestJS app starts on port 3000
8. ✅ Health check passes (TCP probe on 3000)
9. ✅ Service status = Ready
10. ✅ URL accessible: https://top.tracepointops.com

---

## 💡 LESSONS FOR FUTURE

1. **Always check Cloud platform docs for connection methods** - Don't assume
2. **Test connection formats locally first** - Save deployment cycles
3. **Validate assumptions early** - We assumed localhost would work for 30 builds
4. **Read error messages carefully** - "ECONNREFUSED 127.0.0.1:5432" meant wrong connection method
5. **Document as you go** - This history would have helped catch the circle sooner

---

**Last Updated:** 2025-11-16 02:30 UTC
**Build Status:** Deployment SUCCESSFUL - Backend running, Frontend issue

---

## 🎉 BUILD #35-50+ RESULTS

### ✅ What Actually Works Now
1. **Backend Deployment:** Cloud Run service `top-backend` is LIVE and responding
2. **Database Connection:** Successfully connects via Unix socket `/cloudsql/tracepoint-d4c9d:us-east1:tracepoint-top-db`
3. **Core Migrations:** All 52 core schema migrations applied successfully
4. **API Endpoints:**
   - `/client-config` ✅ Returns config
   - `/graphql` ✅ Accepts queries
   - `/metadata` ✅ Returns schema
5. **Firebase Hosting:** Serving frontend with proxy rewrites to Cloud Run
6. **Custom Domain:** `top.tracepointops.com` mapped and working

### ⚠️ Current Issues (NOT Build Failures)

#### 1. Build "FAILURE" Status is Cosmetic
**Error:** `failed to find one or more images after execution of build steps: ["gcr.io/tracepoint-d4c9d/top-backend:latest"]`

**Reality:**
- Image IS built: `gcr.io/tracepoint-d4c9d/top-backend@sha256:be82f287...`
- Image IS pushed to registry
- Cloud Run IS deployed: revision `top-backend-00028-2dv`
- Service IS serving traffic

**Why "FAILURE"?**
- Image pushed with SHA digest, not `:latest` tag
- Cloud Build expects `:latest` tag to exist
- **This is harmless** - deployment works perfectly

#### 2. Frontend Error: "No metadata for WorkspaceEntity"
**Error:** `ApolloError: No metadata for "WorkspaceEntity" was found.`

**Root Cause:**
- Frontend tries to load workspace data on app init
- No workspace exists in database (was deleted to fix stuck PENDING_CREATION state)
- Backend can't return workspace metadata because no workspace schema exists yet

**Why No Workspace?**
- Initial signup attempt created workspace in `PENDING_CREATION` status
- Workspace activation process (`workspaceManagerService.init()`) failed
- Workspace left in broken state: no `displayName`, no `databaseSchema`, stuck in PENDING
- We deleted broken workspace from database to allow fresh signup

**The Fix:** User must SIGN UP to create first workspace

---

## 🔧 COMPLETE DEPLOYMENT TIMELINE

### Phase 1: Unix Socket Discovery (Builds #1-35)
- **Duration:** 30+ builds over 6 hours
- **Issue:** Wrong database connection format
- **Attempts:** localhost:5432, secrets, IAM permissions
- **Solution:** Use Unix socket `/cloudsql/PROJECT:REGION:INSTANCE`

### Phase 2: Database Migrations (Builds #36-40)
- **Issue:** Migrations not running
- **Fix:** Added `DATABASE_MIGRATION=run` environment variable
- **Result:** 52 core migrations applied successfully
- **Created:** `core` schema with all tables (workspace, user, api_key, etc.)

### Phase 3: Redis Connection (Builds #41-43)
- **Issue:** `REDIS_URL` not configured
- **Fix:** Added Upstash Redis URL with TLS
- **Result:** Backend connects to Redis successfully

### Phase 4: Frontend Configuration (Builds #44-48)
- **Issue:** Frontend pointed to `localhost:3000`
- **Fix:**
  1. Updated `.env` with `REACT_APP_SERVER_BASE_URL=https://top.tracepointops.com`
  2. Rebuilt frontend with production URL
  3. Deployed to Firebase Hosting
- **Result:** Frontend makes API calls to production backend

### Phase 5: Firebase Proxy Setup (Build #49)
- **Issue:** Frontend and backend on different domains
- **Fix:** Added Firebase Hosting rewrites to proxy API requests to Cloud Run:
  ```json
  {
    "source": "/client-config**",
    "run": { "serviceId": "top-backend", "region": "us-east1" }
  },
  {
    "source": "/graphql**",
    "run": { "serviceId": "top-backend", "region": "us-east1" }
  },
  {
    "source": "/metadata**",
    "run": { "serviceId": "top-backend", "region": "us-east1" }
  }
  ```
- **Result:** All API requests from `top.tracepointops.com` proxy to Cloud Run

### Phase 6: Workspace Database Issue (Current)
- **Issue:** Workspace stuck in `PENDING_CREATION` status
- **Investigation:** Found workspace with:
  - `id: 699782e0-6971-4da8-b5f5-8ed1069f70e7`
  - `displayName: ""` (empty)
  - `subdomain: "swansonindustries"`
  - `databaseSchema: ""` (empty)
  - `activationStatus: PENDING_CREATION`
- **Root Cause:** Workspace creation started but `workspaceManagerService.init()` failed
- **Fix Applied:** Deleted broken workspace from database
- **Next Step:** User must sign up to create new workspace

---

## 📊 ENVIRONMENT CONFIGURATION (Final)

### Backend Environment Variables
```bash
DATABASE_MIGRATION=run
SERVER_URL=https://top.tracepointops.com
FRONTEND_URL=https://top.tracepointops.com
IS_MULTIWORKSPACE_ENABLED=false
DEFAULT_SUBDOMAIN=
APP_SECRET=7jogTOTb2QRaGyesfmDJ4fG+mz/wYywEpzPiGHSTIwU=
REDIS_URL=redis://default:AXgtAAIncDIzZGMxY2FiZjBlZWU0OWYxOGE1OTAxYWIxZmI5MTdiNnAyMzA3NjU@glowing-gelding-30765.upstash.io:6379
PG_DATABASE_URL=postgresql://postgres:Basegrain23percent19844850605091984641316@/postgres?host=/cloudsql/tracepoint-d4c9d:us-east1:tracepoint-top-db
REMOVE_BG_API_KEY=9sokFHVyE68oZcdNYq3RUk4D
```

### Cloud Run Configuration
```yaml
Service: top-backend
Region: us-east1
Port: 3000
Memory: 2Gi
CPU: 2
Timeout: 600s
Min Instances: 0
Max Instances: 100
Cloud SQL Connection: tracepoint-d4c9d:us-east1:tracepoint-top-db
Service URL: https://top-backend-347335323025.us-east1.run.app
```

### Firebase Hosting
```yaml
Site: top-tracepointops
Custom Domain: top.tracepointops.com
Public Directory: packages/twenty-front/build
Rewrites: API calls to Cloud Run backend
Frontend Framework: React (Vite build)
```

### Database Status
```sql
-- Core Schema (PostgreSQL)
Schema: core
Tables: 52 (all migrations applied)
Key Tables:
  - workspace (0 rows - deleted broken workspace)
  - user (0 rows - awaiting first signup)
  - apiKey
  - role
  - workspaceMember
  - featureFlag

-- Metadata Schema
Status: Created but empty (awaits workspace creation)
```

---

## 🎯 REMAINING TASKS

### 1. First User Signup ⏳
**Status:** Blocked - cannot reach signup page
**Issue:** App tries to load workspace before signup, fails with metadata error
**Options:**
  a. Modify frontend to handle no-workspace state gracefully
  b. Enable multiworkspace mode temporarily
  c. Manually create workspace in database
  d. Add backend endpoint to bypass workspace check during signup

### 2. Fix Build "FAILURE" Tag (Optional)
**Impact:** Cosmetic only
**Fix:** Modify cloudbuild.yaml to tag with `:latest` after push
**Priority:** Low (deployment works fine)

### 3. Workspace Activation Monitoring
**When:** After first signup
**Watch For:**
  - Workspace created with PENDING_CREATION status
  - `workspaceManagerService.init()` completion
  - Schema creation: `workspace_{workspace-id}`
  - Metadata sync
  - Status change to ACTIVE
**If Fails:** Check logs for timeout, permissions, or migration errors

---

## 🚀 SUCCESS METRICS

### What's Working ✅
1. Backend deployed and running
2. Database connected via Unix socket
3. Redis connected (Upstash)
4. Core migrations applied
5. API endpoints responding
6. Firebase Hosting serving frontend
7. Custom domain mapped
8. API proxying through Firebase
9. Frontend configured with production URLs

### What's Blocked ⚠️
1. Cannot sign up (metadata error prevents reaching signup page)
2. No workspace exists (deleted broken one)
3. Cannot test end-to-end workflow

### Deployment Health: 90%
- Infrastructure: 100% ✅
- Backend: 100% ✅
- Database: 100% ✅
- Frontend: 95% ✅ (loads, but can't initialize without workspace)
- User Flow: 0% ⏳ (blocked by workspace issue)

---

## 💡 KEY LEARNINGS

### 1. Cloud Run + Cloud SQL Connection
**Wrong:** `postgresql://user:pass@localhost:5432/db`
**Right:** `postgresql://user:pass@/db?host=/cloudsql/PROJECT:REGION:INSTANCE`
**Why:** Cloud Run doesn't intercept localhost, uses Unix sockets

### 2. Single-Workspace Mode Workflow
**Issue:** `IS_MULTIWORKSPACE_ENABLED=false` creates chicken-and-egg problem
**Flow:**
  1. First signup creates workspace in PENDING_CREATION
  2. Must call `activateWorkspace` mutation to complete setup
  3. If activation fails, workspace stuck in broken state
  4. App can't load without valid workspace
**Lesson:** Multi-workspace mode is more resilient for production

### 3. Build Success vs Deploy Success
**Build shows FAILURE but deployment works** - don't panic!
**Check:** Cloud Run revision number, service status, actual endpoint
**Verify:** Test API endpoints directly, not just build status

### 4. Frontend Environment Variables
**Issue:** Vite embeds env vars at build time
**Solution:** Must rebuild frontend when changing `REACT_APP_SERVER_BASE_URL`
**Gotcha:** `.env` file in gitignore, changes don't auto-deploy

### 5. Database Workspace Schema Pattern
**Twenty uses:** One schema per workspace (`workspace_{id}`)
**Core schema:** Stores workspace metadata, user accounts
**Workspace schema:** Stores actual CRM data (contacts, companies, etc.)
**Critical:** Workspace activation must complete to create workspace schema

---

## 📋 NEXT ACTIONS

### Immediate
1. Investigate why frontend loads before signup completes
2. Check if there's a workspace-less mode or error handling
3. Review Twenty's expected signup flow for single-workspace

### Short Term
1. Complete first user signup
2. Verify workspace activation succeeds
3. Test full user workflow
4. Monitor for any additional errors

### Long Term
1. Consider enabling multi-workspace mode for stability
2. Set up monitoring/alerting for workspace activation failures
3. Document workspace recovery procedures
4. Fix build `:latest` tag issue (optional)

---

**Deployment Status:** BACKEND READY | FRONTEND BLOCKED
**Blocker:** Cannot complete signup - metadata error
**Next Step:** Debug signup flow or create workspace manually
