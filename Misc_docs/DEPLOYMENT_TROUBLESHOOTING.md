# Cloud Run Deployment Troubleshooting Log

## Current Issue (Build #23)
**Date:** 2025-11-15
**Build ID:** 4b33dc09-d37d-4b36-8904-7ad3034c7398
**Status:** FAILED

### Exact Error
```
SyntaxError: Unexpected token 'export'
    at compileSourceTextModule (node:internal/modules/esm/utils:346:16)
    at ModuleLoader.importSyncForRequire (node:internal/modules/esm/loader:382:18)
    at loadESMFromCJS (node:internal/modules/cjs/loader:1363:24)
```

### Root Cause
- Changed `twenty-emails/package.json` to export from `src/index.ts` (TypeScript/ESM)
- NestJS server uses CommonJS `require()` which cannot load ESM `.ts` files directly
- Need to either:
  1. Build twenty-emails properly (fix vite build), OR
  2. Use a transpiler/loader at runtime

### Solution
Build twenty-emails package with proper configuration to handle @react-email/components dependency.

---

## Previous Issues Resolved

### Issue 1: Region Mismatch ✅
- **Problem:** Cloud SQL in us-east1, deployment to us-central1
- **Fix:** Updated cloudbuild.yaml region to us-east1

### Issue 2: Database Connection String ✅
- **Problem:** PG_DATABASE_URL had wrong region in socket path
- **Fix:** Updated secret with us-east1 socket path

### Issue 3: URL-Encoded Password ✅
- **Problem:** Special characters in password caused URIError
- **Fix:** URL-encoded the password in PG_DATABASE_URL secret

### Issue 4: Missing twenty-shared Build ✅
- **Problem:** nx build failed silently, dist folder missing
- **Fix:** Changed to `npx vite build` directly

### Issue 5: Port Configuration ✅
- **Problem:** Cloud Run expected 8080, app uses 3000
- **Fix:** Added `--port=3000` to deployment

### Issue 6: twenty-emails ESM/CommonJS Conflict
- **Problem:** Cannot load ESM .ts files from CommonJS require
- **Root Cause:** Changed exports to src/index.ts which is TypeScript/ESM
- **Fix Attempt #1 (Build #24):** ❌ FAILED
  - Added only `@react-email/components` as external
  - Vite still tried to bundle it and failed resolution
- **Fix Attempt #2 (Build #25):** 🔄 IN PROGRESS
  - Added ALL @react-email/* packages individually as external
  - Added regex pattern `/@react-email\/.*/` to match any @react-email package
  - Should allow vite to build without bundling these dependencies
- **Status:** Testing Build #25
