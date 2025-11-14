# Complete Firebase Deployment Guide: Tracepoint Ecosystem

## Overview

Deploy three apps on Firebase:
1. **Landing Page** (`www.tracepointops.com`) - Simple button selector
2. **TOP** (`top.tracepointops.com`) - Twenty CRM (renamed to TOP)
3. **TOPS** (`tops.tracepointops.com`) - Your existing app

---

## Part 1: Prerequisites

### 1.1 Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 1.2 Login to Firebase

```bash
firebase login
```

### 1.3 Required Services

For Twenty CRM (TOP), you'll need:
- **PostgreSQL Database** (Firebase doesn't provide this - use one of these):
  - Google Cloud SQL (PostgreSQL)
  - Supabase (free tier available)
  - ElephantSQL
  - AWS RDS
  - DigitalOcean Managed Database

- **Redis** (for caching):
  - Google Cloud Memorystore
  - Redis Cloud (free tier available)
  - Upstash (serverless Redis)

---

## Part 2: Create Landing Page

### 2.1 Create Landing Page Directory

```bash
cd /home/lytle/twenty-dev
mkdir tracepoint-landing
cd tracepoint-landing
```

### 2.2 Create Landing Page Files

**File: `index.html`**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tracepoint Operations</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }

        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            padding: 60px 40px;
            max-width: 600px;
            width: 100%;
            text-align: center;
        }

        .logo {
            width: 120px;
            height: 120px;
            margin: 0 auto 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 48px;
            font-weight: bold;
        }

        h1 {
            color: #2d3748;
            font-size: 2.5rem;
            margin-bottom: 10px;
            font-weight: 700;
        }

        .subtitle {
            color: #718096;
            font-size: 1.1rem;
            margin-bottom: 50px;
        }

        .button-container {
            display: flex;
            flex-direction: column;
            gap: 20px;
            margin-bottom: 30px;
        }

        .app-button {
            padding: 25px 40px;
            font-size: 1.3rem;
            font-weight: 600;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: block;
            position: relative;
            overflow: hidden;
        }

        .app-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.2);
            transition: left 0.5s ease;
        }

        .app-button:hover::before {
            left: 100%;
        }

        .top-button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .top-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }

        .tops-button {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            box-shadow: 0 4px 15px rgba(245, 87, 108, 0.4);
        }

        .tops-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(245, 87, 108, 0.6);
        }

        .app-description {
            font-size: 0.9rem;
            color: #a0aec0;
            margin-top: 8px;
            font-weight: 400;
        }

        .footer {
            margin-top: 40px;
            color: #a0aec0;
            font-size: 0.9rem;
        }

        @media (max-width: 768px) {
            .container {
                padding: 40px 20px;
            }

            h1 {
                font-size: 2rem;
            }

            .app-button {
                padding: 20px 30px;
                font-size: 1.1rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">TP</div>
        <h1>Tracepoint Operations</h1>
        <p class="subtitle">Choose your application</p>

        <div class="button-container">
            <a href="https://top.tracepointops.com" class="app-button top-button">
                <div>TOP</div>
                <div class="app-description">CRM & Operations Management</div>
            </a>

            <a href="https://tops.tracepointops.com" class="app-button tops-button">
                <div>TOPS</div>
                <div class="app-description">Tracepoint Operations System</div>
            </a>
        </div>

        <div class="footer">
            &copy; 2025 Tracepoint Operations | Swanson Industries
        </div>
    </div>
</body>
</html>
```

**File: `firebase.json`**
```json
{
  "hosting": {
    "public": "public",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

**File: `.firebaserc`**
```json
{
  "projects": {
    "default": "your-firebase-project-id"
  }
}
```

### 2.3 Setup Landing Page Structure

```bash
mkdir public
mv index.html public/
```

---

## Part 3: Setup Firebase Projects

### 3.1 Create Firebase Projects

Go to: https://console.firebase.google.com/

Create **THREE** Firebase projects:
1. **tracepoint-landing** - For www.tracepointops.com
2. **tracepoint-top** - For top.tracepointops.com (Twenty CRM)
3. **tracepoint-tops** - For tops.tracepointops.com (existing app)

### 3.2 Initialize Landing Page

```bash
cd /home/lytle/twenty-dev/tracepoint-landing
firebase init hosting

# Select:
# - Use existing project: tracepoint-landing
# - Public directory: public
# - Configure as single-page app: Yes
# - Setup automatic builds: No
```

---

## Part 4: Setup Database & Redis (Required for TOP)

### Option A: Use Supabase (Easiest - Free Tier Available)

**4.1 Create Supabase Project**
1. Go to https://supabase.com/
2. Create new project
3. Get connection string from Settings → Database
4. Format: `postgres://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

**4.2 Setup Redis with Upstash (Free Tier)**
1. Go to https://upstash.com/
2. Create Redis database
3. Get connection string: `redis://default:[PASSWORD]@[ENDPOINT]:6379`

### Option B: Use Google Cloud SQL + Memorystore

**4.1 Create Cloud SQL Instance**
```bash
gcloud sql instances create tracepoint-db \
    --database-version=POSTGRES_14 \
    --tier=db-f1-micro \
    --region=us-central1
```

**4.2 Create Database**
```bash
gcloud sql databases create twenty_production \
    --instance=tracepoint-db
```

**4.3 Get Connection String**
```bash
gcloud sql instances describe tracepoint-db
```

---

## Part 5: Prepare Twenty CRM (TOP) for Firebase

### 5.1 Update Environment Variables

**File: `/home/lytle/twenty-dev/packages/twenty-server/.env.production`**

```env
NODE_ENV=production

# URLs
SERVER_URL=https://top.tracepointops.com
FRONTEND_URL=https://top.tracepointops.com

# Database (from Supabase or Cloud SQL)
PG_DATABASE_URL=postgres://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Redis (from Upstash or Memorystore)
REDIS_URL=redis://default:[PASSWORD]@[ENDPOINT]:6379

# Security
APP_SECRET=GENERATE_WITH_openssl_rand_base64_32
SIGN_IN_PREFILLED=false

# Google OAuth (create NEW credentials for top.tracepointops.com)
AUTH_GOOGLE_ENABLED=true
AUTH_GOOGLE_CLIENT_ID=YOUR_PRODUCTION_CLIENT_ID
AUTH_GOOGLE_CLIENT_SECRET=YOUR_PRODUCTION_CLIENT_SECRET
AUTH_GOOGLE_CALLBACK_URL=https://top.tracepointops.com/auth/google/redirect
AUTH_GOOGLE_APIS_CALLBACK_URL=https://top.tracepointops.com/auth/google-apis/get-access-token

# Email
EMAIL_DRIVER=smtp
EMAIL_FROM_ADDRESS=tracepointops@gmail.com
EMAIL_FROM_NAME=Tracepoint Operations
EMAIL_SYSTEM_ADDRESS=tracepointops@gmail.com
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=tracepointops@gmail.com
EMAIL_SMTP_PASSWORD=qrne hipr qmoe swsz

# Storage (use Firebase Storage)
STORAGE_TYPE=gcs
STORAGE_GCS_BUCKET=tracepoint-top.appspot.com

# Features
IS_MULTIWORKSPACE_ENABLED=true
AUTH_PASSWORD_ENABLED=true
MESSAGING_PROVIDER_GMAIL_ENABLED=true
CALENDAR_PROVIDER_GOOGLE_ENABLED=true
```

### 5.2 Build Twenty for Production

```bash
cd /home/lytle/twenty-dev

# Install dependencies
yarn install

# Build frontend
yarn nx build twenty-front --configuration=production

# Build server
yarn nx build twenty-server --configuration=production

# Build emails
yarn nx build twenty-emails
```

### 5.3 **CRITICAL: Deploy Backend to Cloud Run (Firebase Hosting can't run Node.js server)**

Firebase Hosting only serves static files. The Twenty backend needs to run on **Google Cloud Run**.

**Create Dockerfile for Backend:**

**File: `/home/lytle/twenty-dev/packages/twenty-server/Dockerfile`**
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy built server
COPY dist ./dist
COPY package.json ./
COPY node_modules ./node_modules

# Copy .env.production
COPY .env.production ./.env

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

**Deploy to Cloud Run:**
```bash
cd /home/lytle/twenty-dev/packages/twenty-server

# Build and push Docker image
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/top-backend

# Deploy to Cloud Run
gcloud run deploy top-backend \
  --image gcr.io/YOUR_PROJECT_ID/top-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars SERVER_URL=https://top.tracepointops.com
```

**Get Cloud Run URL:**
```bash
gcloud run services describe top-backend --region us-central1 --format 'value(status.url)'
# Example output: https://top-backend-xxxxx-uc.a.run.app
```

### 5.4 Setup Frontend for Firebase Hosting

**File: `/home/lytle/twenty-dev/packages/twenty-front/firebase.json`**
```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "/graphql",
        "function": {
          "functionId": "api",
          "region": "us-central1",
          "pinTag": false
        }
      },
      {
        "source": "/rest/**",
        "run": {
          "serviceId": "top-backend",
          "region": "us-central1"
        }
      },
      {
        "source": "/auth/**",
        "run": {
          "serviceId": "top-backend",
          "region": "us-central1"
        }
      },
      {
        "source": "/webhooks/**",
        "run": {
          "serviceId": "top-backend",
          "region": "us-central1"
        }
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

**File: `/home/lytle/twenty-dev/packages/twenty-front/.firebaserc`**
```json
{
  "projects": {
    "default": "tracepoint-top"
  }
}
```

### 5.5 Update Frontend API Configuration

**File: `/home/lytle/twenty-dev/packages/twenty-front/.env.production`**
```env
VITE_SERVER_BASE_URL=https://top-backend-xxxxx-uc.a.run.app
VITE_FRONT_BASE_URL=https://top.tracepointops.com
```

**Rebuild frontend with new env:**
```bash
cd /home/lytle/twenty-dev
yarn nx build twenty-front --configuration=production
```

### 5.6 Initialize Firebase in Frontend

```bash
cd /home/lytle/twenty-dev/packages/twenty-front
firebase init hosting

# Select:
# - Use existing project: tracepoint-top
# - Public directory: dist
# - Configure as single-page app: Yes
# - Setup automatic builds: No
```

---

## Part 6: Setup Your Existing App (TOPS)

### 6.1 Initialize Firebase in TOPS Directory

```bash
cd /path/to/your/existing/app
firebase init hosting

# Select:
# - Use existing project: tracepoint-tops
# - Public directory: <your build directory>
# - Configure as single-page app: Yes
```

### 6.2 Update TOPS Configuration

If TOPS has environment variables, update URLs:
```env
APP_URL=https://tops.tracepointops.com
```

---

## Part 7: Configure Custom Domains in Firebase

### 7.1 Landing Page Domain Setup

1. Go to Firebase Console → tracepoint-landing → Hosting
2. Click "Add custom domain"
3. Enter: `tracepointops.com` and `www.tracepointops.com`
4. Follow DNS setup instructions

**DNS Records for Landing:**
```
Type: A
Name: @
Value: (Firebase will provide IPs)

Type: A
Name: www
Value: (Firebase will provide IPs)
```

### 7.2 TOP Domain Setup

1. Go to Firebase Console → tracepoint-top → Hosting
2. Click "Add custom domain"
3. Enter: `top.tracepointops.com`

**DNS Record for TOP:**
```
Type: A
Name: top
Value: (Firebase will provide IP)
```

### 7.3 TOPS Domain Setup

1. Go to Firebase Console → tracepoint-tops → Hosting
2. Click "Add custom domain"
3. Enter: `tops.tracepointops.com`

**DNS Record for TOPS:**
```
Type: A
Name: tops
Value: (Firebase will provide IP)
```

---

## Part 8: Deploy Everything

### 8.1 Deploy Landing Page

```bash
cd /home/lytle/twenty-dev/tracepoint-landing
firebase deploy --only hosting
```

### 8.2 Deploy TOP (Twenty CRM)

**Backend (already deployed to Cloud Run in Part 5.3)**

**Frontend:**
```bash
cd /home/lytle/twenty-dev/packages/twenty-front
firebase deploy --only hosting
```

### 8.3 Deploy TOPS

```bash
cd /path/to/your/existing/app
firebase deploy --only hosting
```

---

## Part 9: Final Configuration & Testing

### 9.1 Update Google OAuth Credentials

Create OAuth credentials for:
1. **top.tracepointops.com**
   - Authorized redirect URI: `https://top.tracepointops.com/auth/google/redirect`
   - Authorized JavaScript origins: `https://top.tracepointops.com`

### 9.2 Run Database Migrations

```bash
# Connect to your production database
export DATABASE_URL="your-production-postgres-url"

cd /home/lytle/twenty-dev/packages/twenty-server
yarn database:migrate:prod
```

### 9.3 Test Each App

**Landing Page:**
- Visit: `https://www.tracepointops.com`
- Verify: Both buttons visible
- Click "TOP" → Should go to `https://top.tracepointops.com`
- Click "TOPS" → Should go to `https://tops.tracepointops.com`

**TOP (Twenty CRM):**
- Visit: `https://top.tracepointops.com`
- Test login with Google
- Send test invitation email
- Verify email has Swanson branding and correct logo

**TOPS:**
- Visit: `https://tops.tracepointops.com`
- Verify your existing app works

---

## Part 10: Continuous Deployment

### 10.1 Create Deployment Scripts

**File: `/home/lytle/twenty-dev/deploy-top.sh`**
```bash
#!/bin/bash
set -e

echo "🚀 Deploying TOP to Firebase..."

# Build
echo "📦 Building frontend..."
yarn nx build twenty-front --configuration=production

echo "📦 Building server..."
yarn nx build twenty-server --configuration=production

# Deploy backend to Cloud Run
echo "🔧 Deploying backend to Cloud Run..."
cd packages/twenty-server
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/top-backend
gcloud run deploy top-backend \
  --image gcr.io/YOUR_PROJECT_ID/top-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# Deploy frontend to Firebase
echo "🔥 Deploying frontend to Firebase..."
cd ../twenty-front
firebase deploy --only hosting

echo "✅ Deployment complete!"
echo "🌐 Visit: https://top.tracepointops.com"
```

Make it executable:
```bash
chmod +x deploy-top.sh
```

### 10.2 Deploy Script Usage

```bash
cd /home/lytle/twenty-dev
./deploy-top.sh
```

---

## Part 11: Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│     www.tracepointops.com (Landing Page)        │
│              Firebase Hosting                   │
│                                                 │
│     ┌─────────────┐  ┌─────────────┐          │
│     │ TOP Button  │  │ TOPS Button │          │
│     └──────┬──────┘  └──────┬──────┘          │
└────────────┼─────────────────┼─────────────────┘
             │                 │
             │                 │
     ┌───────▼──────┐  ┌──────▼───────┐
     │     TOP      │  │     TOPS     │
     │   (Twenty)   │  │ (Existing)   │
     └───────┬──────┘  └──────────────┘
             │
      ┌──────┴──────┐
      │             │
┌─────▼────┐  ┌────▼─────┐
│ Frontend │  │ Backend  │
│ Firebase │  │ Cloud    │
│ Hosting  │  │ Run      │
└──────────┘  └────┬─────┘
                   │
           ┌───────┴────────┐
           │                │
      ┌────▼─────┐    ┌────▼────┐
      │PostgreSQL│    │  Redis  │
      │ Supabase │    │ Upstash │
      └──────────┘    └─────────┘
```

---

## Part 12: Cost Estimation

### Firebase Hosting (All 3 apps)
- **Free tier**: 10GB storage, 360MB/day transfer
- **Paid**: $0.026/GB storage, $0.15/GB transfer
- **Estimated**: $0-20/month

### Google Cloud Run (TOP Backend)
- **Free tier**: 2M requests/month, 360k GB-seconds/month
- **Paid**: $0.00002400/request, $0.00001650/GB-second
- **Estimated**: $5-50/month (depends on usage)

### Supabase (Database)
- **Free tier**: 500MB database, unlimited API requests
- **Paid**: $25/month for Pro (8GB database)

### Upstash (Redis)
- **Free tier**: 10k commands/day
- **Paid**: $0.2/100k commands

**Total Estimated Cost: $0-100/month** (depending on usage)

---

## Part 13: Troubleshooting

### Issue: "Cannot connect to database"
**Solution:**
```bash
# Test database connection
psql "postgres://user:pass@host:5432/db"

# Check Cloud SQL connection
gcloud sql operations list --instance=tracepoint-db
```

### Issue: "OAuth redirect mismatch"
**Solution:**
1. Go to Google Cloud Console → APIs & Services → Credentials
2. Edit OAuth client
3. Add EXACT redirect URIs:
   - `https://top.tracepointops.com/auth/google/redirect`
   - `https://top.tracepointops.com/auth/google-apis/get-access-token`

### Issue: "Email logo not loading"
**Solution:**
- Verify: `https://top.tracepointops.com/images/logos/logoicon.png`
- Check firebase.json includes static assets
- Logo should be in `packages/twenty-front/dist/images/logos/`

### Issue: "API calls failing (CORS)"
**Solution:**
Add to Cloud Run backend:
```bash
gcloud run services update top-backend \
  --set-env-vars CORS_ORIGIN=https://top.tracepointops.com
```

---

## Part 14: Next Steps

### After Deployment:
1. ✅ Test all three apps thoroughly
2. ✅ Setup monitoring in Firebase Console
3. ✅ Configure error tracking (Sentry)
4. ✅ Setup automated backups for database
5. ✅ Create staging environment (optional)
6. ✅ Document API keys in secure location

### Future: Merging TOPS into TOP
When ready to merge:
1. Keep landing page as-is
2. Remove TOPS button
3. Direct www.tracepointops.com → top.tracepointops.com
4. Migrate TOPS features into TOP
5. Sunset TOPS subdomain

---

## Quick Command Reference

```bash
# Deploy landing page
cd /home/lytle/twenty-dev/tracepoint-landing && firebase deploy

# Deploy TOP
cd /home/lytle/twenty-dev && ./deploy-top.sh

# View logs (Cloud Run)
gcloud run services logs read top-backend --region us-central1

# View logs (Firebase)
firebase hosting:logs

# Rollback deployment
firebase hosting:rollback
```

---

## Support & Resources

- **Firebase Docs**: https://firebase.google.com/docs/hosting
- **Cloud Run Docs**: https://cloud.google.com/run/docs
- **Supabase Docs**: https://supabase.com/docs
- **Twenty Docs**: https://twenty.com/developers

---

**You're all set! 🚀**

This setup gives you:
- ✅ Professional landing page with app selector
- ✅ Production-ready Twenty CRM (TOP) on Firebase
- ✅ Your existing app (TOPS) on Firebase
- ✅ All apps under tracepointops.com domain
- ✅ Easy deployment workflow
- ✅ Scalable infrastructure
