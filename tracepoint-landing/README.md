# Tracepoint Landing Page

Landing page for Tracepoint Logistics ecosystem.

## Structure

```
www.tracepointops.com
  ├─→ TOP (top.tracepointops.com) - Twenty CRM
  └─→ TOPS (tops.tracepointops.com) - Existing app
```

## Deploy

```bash
firebase deploy --only hosting
```

## Local Testing

```bash
firebase serve
```

Visit: http://localhost:5000

## Configuration

- Firebase Project: `tracepoint-d4c9d`
- Public directory: `public/`
- Domain: `www.tracepointops.com`
