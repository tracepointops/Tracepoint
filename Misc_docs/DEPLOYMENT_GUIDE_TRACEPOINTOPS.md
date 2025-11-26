# Deployment Guide: Twenty CRM on tracepointops.com

## Overview
Deploy Swanson Industries CRM to production at `https://www.tracepointops.com`

---

## Pre-Deployment Checklist

### 1. **Database Setup**
- [ ] Provision PostgreSQL database (v14+)
- [ ] Note connection string: `postgres://user:pass@host:5432/dbname`
- [ ] Run migrations: `yarn database:migrate:prod`
- [ ] Backup strategy configured

### 2. **Redis Setup**
- [ ] Provision Redis instance (v6+)
- [ ] Note connection string: `redis://host:6379`
- [ ] Test connectivity

### 3. **Google OAuth Credentials**
**Create NEW credentials for production:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new OAuth 2.0 Client ID
3. Authorized redirect URIs:
   - `https://www.tracepointops.com/auth/google/redirect`
   - `https://www.tracepointops.com/auth/google-apis/get-access-token`
4. Save Client ID and Client Secret

### 4. **Storage Configuration**

**Option A: AWS S3 (Recommended)**
```env
STORAGE_TYPE=s3
STORAGE_S3_REGION=us-east-1
STORAGE_S3_NAME=swanson-crm-uploads
STORAGE_S3_ENDPOINT=https://s3.amazonaws.com
```

**Option B: Local Storage**
```env
STORAGE_TYPE=local
STORAGE_LOCAL_PATH=/var/www/twenty-storage
```

### 5. **Generate Secrets**
```bash
# Generate APP_SECRET (keep this secure!)
openssl rand -base64 32
```

---

## Environment Configuration

### Update `.env.production`

```env
NODE_ENV=production
SERVER_URL=https://www.tracepointops.com
FRONTEND_URL=https://www.tracepointops.com

# Database
PG_DATABASE_URL=postgres://user:password@your-db-host:5432/twenty_prod

# Redis
REDIS_URL=redis://your-redis-host:6379

# Security
APP_SECRET=<YOUR_GENERATED_SECRET>
SIGN_IN_PREFILLED=false

# Google OAuth (NEW PRODUCTION CREDENTIALS)
AUTH_GOOGLE_CLIENT_ID=<YOUR_PROD_CLIENT_ID>
AUTH_GOOGLE_CLIENT_SECRET=<YOUR_PROD_CLIENT_SECRET>
AUTH_GOOGLE_CALLBACK_URL=https://www.tracepointops.com/auth/google/redirect
AUTH_GOOGLE_APIS_CALLBACK_URL=https://www.tracepointops.com/auth/google-apis/get-access-token

# Email (using your Gmail)
EMAIL_FROM_ADDRESS=tracepointops@gmail.com
EMAIL_FROM_NAME=Swanson Industries
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=tracepointops@gmail.com
EMAIL_SMTP_PASSWORD=qrne hipr qmoe swsz
```

---

## Build Process

### 1. **Build Frontend**
```bash
cd /home/lytle/twenty-dev
yarn install
yarn nx build twenty-front
```

### 2. **Build Server**
```bash
yarn nx build twenty-server
```

### 3. **Build Emails**
```bash
yarn nx build twenty-emails
```

---

## Deployment Options

### Option 1: Traditional VPS/Server

**Requirements:**
- Ubuntu 20.04+ or similar
- Node.js 20+
- PostgreSQL 14+
- Redis 6+
- Nginx

**Steps:**

1. **Install Dependencies**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs nginx postgresql redis-server
sudo npm install -g yarn pm2
```

2. **Clone & Build**
```bash
cd /var/www
git clone <your-repo> twenty-crm
cd twenty-crm
yarn install
yarn build
```

3. **Setup PM2**
```bash
# Start server
pm2 start packages/twenty-server/dist/main.js --name twenty-server

# Save PM2 config
pm2 save
pm2 startup
```

4. **Configure Nginx**
```nginx
server {
    listen 80;
    server_name www.tracepointops.com tracepointops.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name www.tracepointops.com tracepointops.com;

    ssl_certificate /etc/letsencrypt/live/tracepointops.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tracepointops.com/privkey.pem;

    # Frontend static files
    location / {
        root /var/www/twenty-crm/packages/twenty-front/dist;
        try_files $uri $uri/ /index.html;
    }

    # API and backend
    location /graphql {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /rest {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    location /auth {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    location /webhooks {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    location /images {
        root /var/www/twenty-crm/packages/twenty-front/public;
    }
}
```

5. **SSL Certificate (Let's Encrypt)**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d www.tracepointops.com -d tracepointops.com
```

---

### Option 2: Docker Deployment

**1. Create Production Dockerfile**

File: `Dockerfile.production`
```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/packages/twenty-server/dist ./packages/twenty-server/dist
COPY --from=builder /app/packages/twenty-front/dist ./packages/twenty-front/dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["node", "packages/twenty-server/dist/main.js"]
```

**2. Docker Compose**

File: `docker-compose.production.yml`
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: twenty_prod
      POSTGRES_USER: twenty
      POSTGRES_PASSWORD: <SECURE_PASSWORD>
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always

  redis:
    image: redis:7-alpine
    restart: always

  twenty:
    build:
      context: .
      dockerfile: Dockerfile.production
    ports:
      - "3000:3000"
    env_file:
      - packages/twenty-server/.env.production
    depends_on:
      - postgres
      - redis
    restart: always

volumes:
  postgres_data:
```

---

### Option 3: Subdomain Deployment

If you want to keep your existing app and run Twenty on a subdomain:

**URL:** `https://crm.tracepointops.com`

Update all URLs in `.env.production`:
```env
SERVER_URL=https://crm.tracepointops.com
FRONTEND_URL=https://crm.tracepointops.com
AUTH_GOOGLE_CALLBACK_URL=https://crm.tracepointops.com/auth/google/redirect
# etc...
```

---

## Post-Deployment

### 1. **Verify Services**
```bash
# Check server status
pm2 status
pm2 logs twenty-server

# Test database connection
psql $PG_DATABASE_URL

# Test Redis
redis-cli -h <your-redis-host> ping
```

### 2. **Test Application**
- [ ] Visit https://www.tracepointops.com
- [ ] Sign in with Google OAuth
- [ ] Send a test invitation email
- [ ] Upload a file
- [ ] Create a record

### 3. **Monitoring**
```bash
# Setup monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# Monitor logs
pm2 logs twenty-server --lines 100
```

### 4. **Backups**
```bash
# Database backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $PG_DATABASE_URL > /backups/twenty_$DATE.sql
```

---

## DNS Configuration

### For www.tracepointops.com

**A Records:**
```
Type: A
Name: @
Value: <YOUR_SERVER_IP>
TTL: 3600

Type: A
Name: www
Value: <YOUR_SERVER_IP>
TTL: 3600
```

### For subdomain (crm.tracepointops.com)

**A Record:**
```
Type: A
Name: crm
Value: <YOUR_SERVER_IP>
TTL: 3600
```

---

## Troubleshooting

### Email Logo Not Showing
- Ensure `/images/logos/logoicon.png` is accessible at production URL
- Test: `curl https://www.tracepointops.com/images/logos/logoicon.png`

### Google OAuth Errors
- Verify redirect URIs match exactly in Google Cloud Console
- Check HTTPS is enabled
- Ensure cookies are working (same-site settings)

### Database Connection Issues
- Check firewall rules
- Verify SSL/TLS settings if required
- Test connection string manually

### File Upload Failures
- Check storage permissions (if using local)
- Verify S3 credentials (if using S3)
- Check CORS settings

---

## Security Checklist

- [ ] HTTPS enabled with valid SSL certificate
- [ ] Strong APP_SECRET generated
- [ ] Database credentials secured
- [ ] SIGN_IN_PREFILLED=false
- [ ] Rate limiting enabled
- [ ] Firewall configured (only 80, 443, SSH open)
- [ ] Regular security updates scheduled
- [ ] Backup strategy in place

---

## Maintenance

### Update Deployment
```bash
cd /var/www/twenty-crm
git pull
yarn install
yarn build
pm2 restart twenty-server
```

### Database Migrations
```bash
cd packages/twenty-server
yarn database:migrate:prod
```

---

## Support

- **Documentation:** https://twenty.com/developers
- **GitHub Issues:** https://github.com/twentyhq/twenty/issues
- **Swanson Contact:** tracepointops@gmail.com
