# Quick Start: Deploy to tracepointops.com

## ✅ What's Already Done

1. ✅ Email templates customized for Swanson Industries
2. ✅ Logo component updated to use environment variable
3. ✅ Production environment file created (`.env.production`)
4. ✅ Email configuration using tracepointops@gmail.com

## 🚀 Next Steps to Deploy

### Step 1: Complete .env.production Setup
Edit: `/home/lytle/twenty-dev/packages/twenty-server/.env.production`

**Required Changes:**
```bash
# 1. Set your production database URL
PG_DATABASE_URL=postgres://username:password@your-db-host:5432/twenty_production

# 2. Set your production Redis URL
REDIS_URL=redis://your-redis-host:6379

# 3. Generate and set APP_SECRET
APP_SECRET=$(openssl rand -base64 32)

# 4. Update Google OAuth credentials (see below)
```

### Step 2: Create Production Google OAuth Credentials

1. Go to: https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URIs:
   - `https://www.tracepointops.com/auth/google/redirect`
   - `https://www.tracepointops.com/auth/google-apis/get-access-token`
4. Copy Client ID & Secret to `.env.production`

### Step 3: Choose Deployment Method

**Option A: VPS/Server (DigitalOcean, AWS EC2, etc.)**
- See: `DEPLOYMENT_GUIDE_TRACEPOINTOPS.md` → "Option 1: Traditional VPS/Server"
- Requires: Nginx, PM2, SSL certificate

**Option B: Docker**
- See: `DEPLOYMENT_GUIDE_TRACEPOINTOPS.md` → "Option 2: Docker Deployment"
- Easier to manage, includes database

**Option C: Use Subdomain (crm.tracepointops.com)**
- Keeps your existing app on www.tracepointops.com
- Run Twenty CRM on crm.tracepointops.com
- Update all URLs in `.env.production` to use subdomain

### Step 4: Build for Production

```bash
cd /home/lytle/twenty-dev

# Set production environment
export NODE_ENV=production

# Build all packages
yarn install
yarn nx build twenty-front
yarn nx build twenty-server
yarn nx build twenty-emails
```

### Step 5: Deploy Files

**Copy these to your production server:**
```
packages/twenty-front/dist/       → Web root
packages/twenty-server/dist/      → Application server
packages/twenty-server/.env.production
packages/twenty-front/public/images/logos/logoicon.png
```

### Step 6: Start Application

**If using PM2:**
```bash
pm2 start packages/twenty-server/dist/main.js --name twenty-server
pm2 save
```

**If using Docker:**
```bash
docker-compose -f docker-compose.production.yml up -d
```

### Step 7: Configure DNS

**A Records:**
```
Type: A
Name: @ (or www)
Value: YOUR_SERVER_IP
TTL: 3600
```

### Step 8: Setup SSL

```bash
sudo certbot --nginx -d www.tracepointops.com -d tracepointops.com
```

### Step 9: Test!

Visit: https://www.tracepointops.com
- ✅ Login with Google
- ✅ Send test invitation
- ✅ Check email has Swanson branding

---

## 📋 Configuration Files Summary

| File | Purpose | Status |
|------|---------|--------|
| `.env.production` | Production environment variables | ✅ Created - needs DB/Redis URLs |
| `Logo.tsx` | Email logo (environment-aware) | ✅ Updated |
| `send-invite-link.email.tsx` | Invitation email template | ✅ Customized |
| `DEPLOYMENT_GUIDE_TRACEPOINTOPS.md` | Full deployment guide | ✅ Created |

---

## 🔧 Environment Variables Reference

### Development (localhost)
```env
SERVER_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3001
```

### Production (www.tracepointops.com)
```env
SERVER_URL=https://www.tracepointops.com
FRONTEND_URL=https://www.tracepointops.com
```

### Production (subdomain: crm.tracepointops.com)
```env
SERVER_URL=https://crm.tracepointops.com
FRONTEND_URL=https://crm.tracepointops.com
```

The logo will automatically use the correct URL based on `SERVER_URL`!

---

## 🆘 Need Help?

1. **Full Guide:** See `DEPLOYMENT_GUIDE_TRACEPOINTOPS.md`
2. **Twenty Docs:** https://twenty.com/developers
3. **Issues:** https://github.com/twentyhq/twenty/issues

---

## 📝 What Happens in Each Environment

### Development (http://localhost:3000)
- Logo loads from: `http://localhost:3000/images/logos/logoicon.png`
- Email subject: "Join your Swanson Team"
- OAuth redirects to localhost

### Production (https://www.tracepointops.com)
- Logo loads from: `https://www.tracepointops.com/images/logos/logoicon.png`
- Email subject: "Join your Swanson Team"
- OAuth redirects to tracepointops.com
- HTTPS enforced
- Production database & Redis
