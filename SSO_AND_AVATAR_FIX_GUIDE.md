# SSO Identity Provider & Avatar Icon Fix Guide

## Issue 1: What does "SSO Identity Provider" mean?

### **SSO (Single Sign-On) Identity Provider Overview:**

**SSO Identity Provider** in Tracepoint CRM allows users to log in using external authentication services instead of creating separate passwords.

### **Supported Types:**
1. **OIDC (OpenID Connect)** - Used by Google, Microsoft Azure AD
2. **SAML** - Enterprise SSO protocol for large corporations

### **What It Controls:**
- **Name**: Display name of the SSO provider (e.g., "Google OAuth", "Microsoft Azure")
- **Status**: Active, Inactive, or Error
- **Issuer**: The authentication provider's identifier URL
- **Client ID & Secret**: Credentials for OAuth authentication
- **SSO URL**: The login endpoint users are redirected to
- **Certificate/Fingerprint**: For SAML-based authentication

### **Where It's Used:**
Located in: `Settings → Security → SSO Configuration`

**Database Table**: `workspaceSSOIdentityProvider`

**Key Fields:**
```typescript
{
  id: uuid,
  name: string,                    // "Google SSO" or "Azure AD"
  type: 'OIDC' | 'SAML',          // Authentication protocol
  status: 'Active' | 'Inactive' | 'Error',
  issuer: string,                  // Provider's issuer URL
  clientID: string,                // OAuth Client ID
  clientSecret: string,            // OAuth Client Secret (encrypted)
  workspaceId: uuid                // Your workspace
}
```

### **How to Configure:**

1. **Go to Settings** → **Security** → **SSO**
2. Click **"Add SSO Identity Provider"**
3. Choose type:
   - **Google OAuth** (OIDC)
   - **Microsoft Azure AD** (OIDC or SAML)
   - **Custom SAML Provider**
4. Enter credentials from your identity provider
5. **Save** and set to **Active**

### **Benefits:**
- ✅ No password management for users
- ✅ Centralized authentication
- ✅ Improved security (MFA enforced at provider level)
- ✅ Faster onboarding (users use existing company accounts)

---

## Issue 2: User Avatar Icon Stuck on Purple "W"

### **Problem:**
You uploaded the Swanson logo as your user icon, but the UI still shows a purple background with white "W" (default avatar fallback).

### **Root Cause:**
The avatar is cached in multiple places:
1. **Browser cache** (service worker + HTTP cache)
2. **Recoil state** (`currentWorkspaceMember`)
3. **Apollo GraphQL cache**
4. **Signed URL expiration** (if using S3/cloud storage)

---

## **Fix Steps:**

### **Method 1: Force Browser Refresh (Quick Fix)**

1. **Hard Refresh:**
   - **Chrome/Edge**: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
   - **Firefox**: `Ctrl + F5` or `Cmd + Shift + R`

2. **Clear Cache:**
   - Open DevTools (`F12`)
   - Right-click the refresh button
   - Select **"Empty Cache and Hard Reload"**

3. **Clear Application Data:**
   - DevTools → **Application** tab
   - **Storage** → **Clear site data**
   - Close and reopen browser

---

### **Method 2: Check Avatar Upload Status (Verify Backend)**

1. **Verify file uploaded successfully:**
   ```bash
   cd /home/lytle/twenty-dev
   # Check if avatar file exists in storage
   ls -lh packages/twenty-server/storage/profile-pictures/
   ```

2. **Check database:**
   ```sql
   -- Connect to your Postgres database
   SELECT id, "avatarUrl", "userId", "userEmail"
   FROM workspace_member
   WHERE "userEmail" = 'your_email@swanson.com';
   ```

3. **Expected `avatarUrl` format:**
   ```
   profile-pictures/<workspace-id>/<filename>.png
   ```

   If it's empty or null, the upload failed.

---

### **Method 3: Re-upload Avatar (Force Update)**

**Frontend Code Location:**
`packages/twenty-front/src/modules/settings/profile/components/ProfilePictureUploader.tsx`

**Steps:**
1. Go to **Settings** → **Profile** → **Profile Picture**
2. **Remove** current avatar (click X button)
3. Wait 2 seconds
4. **Upload** Swanson logo again
5. Hard refresh browser

**Expected Behavior:**
- Old avatar deleted from server
- New file uploaded to `storage/profile-pictures/`
- `avatarUrl` updated in `workspace_member` table
- Apollo cache invalidated
- UI re-renders with new avatar

---

###**Method 4: Force Cache Invalidation (Developer Fix)**

**If avatar still doesn't update, add cache-busting:**

**File:** `packages/twenty-front/src/modules/settings/profile/components/ProfilePictureUploader.tsx`

Find this section (around line 68):

```typescript
setCurrentWorkspaceMember({
  ...currentWorkspaceMember,
  avatarUrl: buildSignedPath(signedFile),
});
```

**Replace with:**

```typescript
// Force cache invalidation by adding timestamp
const avatarUrlWithCacheBust = `${buildSignedPath(signedFile)}?t=${Date.now()}`;

setCurrentWorkspaceMember({
  ...currentWorkspaceMember,
  avatarUrl: avatarUrlWithCacheBust,
});

// Also invalidate Apollo cache
apolloClient.cache.evict({ fieldName: 'currentWorkspaceMember' });
apolloClient.cache.gc();
```

---

### **Method 5: Check Signed URL Expiration**

**If using cloud storage (S3/Google Cloud):**

**File:** `packages/twenty-server/src/engine/core-modules/file/services/file.service.ts`

Signed URLs expire after a set time. Check:

```typescript
signFileUrl({ url, workspaceId }) {
  // Default expiration might be too short
  // Should be at least 1 hour = 3600 seconds
}
```

**Solution:** Increase signed URL expiration time or regenerate URLs on page load.

---

### **Method 6: Force Avatar Reload on Login**

**File:** `packages/twenty-front/src/modules/users/hooks/useLoadCurrentUser.ts`

Add cache invalidation when loading user data (around line 64):

```typescript
if (isDefined(user.workspaceMember)) {
  workspaceMember = {
    ...user.workspaceMember,
    colorScheme: user.workspaceMember?.colorScheme as ColorScheme,
    locale: user.workspaceMember?.locale ?? SOURCE_LOCALE,
    // FORCE AVATAR REFRESH by appending timestamp
    avatarUrl: user.workspaceMember?.avatarUrl
      ? `${user.workspaceMember.avatarUrl}?t=${Date.now()}`
      : user.workspaceMember?.avatarUrl
  };

  setCurrentWorkspaceMember(workspaceMember);
}
```

---

## **Quick Debugging Checklist:**

**1. Check if file uploaded:**
```bash
ls -lh packages/twenty-server/storage/profile-pictures/
```

**2. Check database value:**
```sql
SELECT "avatarUrl" FROM workspace_member WHERE "userEmail" = 'wayne@swanson.com';
```

**3. Check browser console for errors:**
- Open DevTools (`F12`)
- Look for failed image loads (404, 403, CORS errors)

**4. Check if avatar URL is signed:**
- URL should look like: `/files/<path>?token=<jwt-token>`
- If no token, signed URL generation failed

**5. Test in incognito/private window:**
- Eliminates cache issues
- If works here, it's a cache problem

---

## **Permanent Fix (Recommended):**

**Add automatic cache-busting to ALL avatar components:**

**File:** `packages/twenty-front/src/modules/ui/display/avatar/components/Avatar.tsx`

Modify avatar rendering:

```typescript
const avatarUrlWithCacheBust = avatarUrl
  ? `${avatarUrl}${avatarUrl.includes('?') ? '&' : '?'}cb=${Date.now()}`
  : avatarUrl;

<img src={avatarUrlWithCacheBust} ... />
```

This ensures avatars NEVER get stuck in cache.

---

## **Common Mistakes:**

❌ **Don't do this:**
- Upload avatar but forget to click "Save"
- Upload .svg files (not supported, use .png or .jpg)
- Upload files > 5MB (backend rejects)
- Change avatar without removing old one first

✅ **Do this:**
- Always remove old avatar before uploading new one
- Use .png or .jpg files under 2MB
- Wait for upload confirmation before refreshing
- Hard refresh browser after upload

---

## **If Nothing Works:**

**Nuclear Option - Reset Everything:**

```bash
# 1. Clear all caches
rm -rf packages/twenty-front/.nx/cache
rm -rf node_modules/.cache

# 2. Restart server
cd packages/twenty-server
yarn start

# 3. Restart frontend
cd packages/twenty-front
yarn start

# 4. Clear browser data completely
# Chrome: Settings → Privacy → Clear browsing data → All time
```

---

## **Expected Behavior After Fix:**

1. ✅ Avatar shows Swanson logo immediately after upload
2. ✅ No purple "W" fallback
3. ✅ Logo persists after page refresh
4. ✅ Logo shows in all locations (header, profile, workspace selector)

---

## **Files to Check/Modify:**

**Frontend:**
- `packages/twenty-front/src/modules/settings/profile/components/ProfilePictureUploader.tsx`
- `packages/twenty-front/src/modules/users/hooks/useLoadCurrentUser.ts`
- `packages/twenty-front/src/modules/ui/display/avatar/components/Avatar.tsx`

**Backend:**
- `packages/twenty-server/src/engine/core-modules/file/services/file.service.ts`
- `packages/twenty-server/src/engine/core-modules/user-workspace/user-workspace.service.ts`

**Database:**
- Table: `workspace_member`
- Column: `avatarUrl`

---

Let me know which method works or if you need help debugging further!
