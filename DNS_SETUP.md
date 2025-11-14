# DNS Configuration for tracepointops.com

## DNS Records to Add

### 1. For Twenty CRM (TOP)
```
Type: CNAME
Name: top
Value: top-tracepointops.web.app
TTL: 3600
```

### 2. For Landing Page (WWW)
```
Type: CNAME
Name: www
Value: tracepoint-d4c9d.web.app
TTL: 3600
```

### 3. For Root Domain (Optional - Redirect to www)
```
Type: A
Name: @ (or leave blank)
Value: 151.101.1.195
TTL: 3600

Type: A
Name: @ (or leave blank)
Value: 151.101.65.195
TTL: 3600
```

## Where to Add These Records

### If domain is in Google Domains:
1. Go to https://domains.google.com
2. Click on `tracepointops.com`
3. Click "DNS" in the left menu
4. Scroll to "Custom records"
5. Add each CNAME record above

### If domain DNS is elsewhere:
1. Log into your domain registrar
2. Find DNS or Domain Management
3. Add the CNAME records above

## After Adding DNS Records

1. Go back to Firebase Console
2. Click "Verify" for each domain
3. Wait 5-60 minutes for DNS propagation
4. Firebase will automatically provision SSL certificates

## Your Current URLs

- **Twenty CRM temporary:** https://top-tracepointops.web.app
- **Landing Page temporary:** https://tracepoint-d4c9d.web.app
- **Backend API:** https://top-backend-347335323025.us-central1.run.app

## After DNS Setup

- **Twenty CRM:** https://top.tracepointops.com
- **Landing Page:** https://www.tracepointops.com
- **Your other app:** https://tops.tracepointops.com (already configured)
