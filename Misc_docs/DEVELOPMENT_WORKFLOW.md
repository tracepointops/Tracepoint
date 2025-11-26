# Development Workflow Guide

## Quick Reference

### Current Live Setup (DO NOT CHANGE)
- **Frontend:** https://top.tracepointops.com → **Cloud Run Backend**
- **Backend:** Cloud Run (us-east1)
- **Database:** Cloud SQL PostgreSQL
- **Redis:** Upstash Redis

---

## Development Scripts

### 🏠 Local Development (Fast Iteration)

**Start local backend:**
```bash
./start-local-backend.sh
```
- Runs backend on http://localhost:3000
- Uses local PostgreSQL and Redis
- Hot reload enabled (changes apply instantly!)

**Start local frontend:**
```bash
./start-local-frontend.sh
```
- Runs frontend on http://localhost:3001
- Points to local backend
- Hot reload enabled

---

### ☁️ Cloud Deployment

**Deploy frontend to cloud backend:**
```bash
./deploy-frontend-cloud.sh
```
- Points https://top.tracepointops.com to Cloud Run backend
- Takes ~1-2 minutes
- Use this for presentations/demos

**Deploy frontend to local backend:**
```bash
./deploy-frontend-local.sh
```
- Points https://top.tracepointops.com to localhost:3000
- Requires local backend running
- Use for testing with live domain

**Deploy backend to cloud:**
```bash
./deploy-backend-cloud.sh
```
- Builds and deploys to Cloud Run
- Takes ~7-10 minutes
- Only needed for backend code changes

---

## Workflow Examples

### Scenario 1: Quick Frontend Changes (UI, colors, layout)

```bash
# Option A: Test locally (FASTEST)
./start-local-backend.sh       # Terminal 1
./start-local-frontend.sh      # Terminal 2
# Edit code → See changes instantly!

# Option B: Deploy to live site
./deploy-frontend-cloud.sh
# Takes 1-2 minutes
```

**Time:** Instant (local) or 1-2 min (cloud)
**Cost:** $0 (local) or $0 (Firebase free tier)

---

### Scenario 2: Backend Changes (API, database, logic)

```bash
# Step 1: Develop locally
./start-local-backend.sh
# Edit code → Server auto-restarts!

# Step 2: Test locally
./start-local-frontend.sh
# Test everything

# Step 3: Deploy to cloud when ready
./deploy-backend-cloud.sh
# Takes 7-10 minutes
```

**Time:** Instant dev + 7-10 min deploy
**Cost:** $0 (local dev) + Cloud Build costs

---

### Scenario 3: Presentation/Demo Setup

**Before presentation:**
```bash
# Make sure frontend points to cloud backend
./deploy-frontend-cloud.sh
```

**During presentation:**
- Frontend: https://top.tracepointops.com
- Backend: Cloud Run (always available)
- No local servers needed!

---

### Scenario 4: Testing with Live Domain + Local Backend

```bash
# Terminal 1: Start local backend
./start-local-backend.sh

# Terminal 2: Deploy frontend to use local backend
./deploy-frontend-local.sh
```

**Now:**
- Visit https://top.tracepointops.com
- It uses your LOCAL backend
- Make backend changes → Restart local server → Test on live domain!

**When done:**
```bash
# Switch back to cloud backend
./deploy-frontend-cloud.sh
```

---

## What Takes How Long?

| Task | Time | Cost |
|------|------|------|
| **Frontend local dev** | Instant | $0 |
| **Backend local dev** | Instant | $0 |
| **Deploy frontend** | 1-2 min | $0 |
| **Deploy backend** | 7-10 min | ~$0.50/build |
| **Local → Cloud switch** | 1-2 min | $0 |

---

## Prerequisites for Local Development

### Required Services

**PostgreSQL:**
```bash
# Check if installed
psql --version

# Start service
sudo service postgresql start

# Create database (first time only)
psql -U postgres -c "CREATE DATABASE twenty_local;"
```

**Redis:**
```bash
# Check if installed
redis-cli --version

# Start service
sudo service redis-server start

# Test
redis-cli ping
# Should return: PONG
```

### First-Time Setup

```bash
# Install dependencies
yarn install

# Setup database
cd packages/twenty-server
yarn database:init
```

---

## Environment Variables

### Backend (.env files)

**Local development:**
```bash
packages/twenty-server/.env
```
Points to localhost PostgreSQL and Redis

**Cloud production:**
Environment variables set in Cloud Run service

### Frontend (.env files)

**Cloud backend:**
```bash
packages/twenty-front/.env.local
VITE_API_URL=https://top.tracepointops.com
```

**Local backend:**
```bash
packages/twenty-front/.env.local
VITE_API_URL=http://localhost:3000
```

Scripts handle this automatically!

---

## Troubleshooting

### "PostgreSQL is not running"
```bash
sudo service postgresql start
```

### "Redis is not running"
```bash
sudo service redis-server start
```

### "Database doesn't exist"
```bash
psql -U postgres -c "CREATE DATABASE twenty_local;"
cd packages/twenty-server
yarn database:init
```

### "Port 3000 already in use"
```bash
# Find process
lsof -i :3000
# Kill it
kill -9 <PID>
```

### "Frontend points to wrong backend"
```bash
# Switch to cloud backend
./deploy-frontend-cloud.sh

# OR switch to local backend
./deploy-frontend-local.sh
```

---

## Best Practices

### Daily Development
1. Work locally (instant changes)
2. Test locally
3. Deploy to cloud when ready

### Before Demos/Presentations
1. Deploy latest code to cloud
2. Run `./deploy-frontend-cloud.sh`
3. Test live site
4. Good to go!

### Code Changes
- **Frontend only** → 1-2 min deploy
- **Backend only** → 7-10 min deploy
- **Both** → 10-12 min total (can run in parallel)

### Cost Optimization
- Develop locally (free)
- Deploy only when needed
- Cloud Run scales to zero (no traffic = no cost)

---

## Current Status

✅ **Live Production:**
- Frontend: Firebase Hosting
- Backend: Cloud Run
- Database: Cloud SQL
- All pointing to cloud infrastructure

✅ **Local Development:**
- Ready to use
- Scripts created
- Just need local PostgreSQL + Redis

🎯 **Next Steps:**
1. Install PostgreSQL locally (if needed)
2. Install Redis locally (if needed)
3. Try `./start-local-backend.sh`
4. Try `./start-local-frontend.sh`

---

**Created:** November 16, 2025
**Status:** Ready for development!
