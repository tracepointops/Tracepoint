# Quick Fix for Purple "W" Avatar Issue

## **Root Cause Found!**

The Avatar component maintains a Recoil state called `invalidAvatarUrlsState` that caches failed avatar URLs. Once your avatar URL fails to load (404, timeout, etc.), it's permanently added to this cache and shows the purple "W" placeholder forever - even after you upload a new image.

## **Immediate Fix (Try This First):**

### **Option 1: Clear Browser Storage**

1. Open DevTools (`F12`)
2. **Application** tab
3. **Storage** section (left sidebar)
4. Click **"Clear site data"**
5. Refresh page (`Ctrl+R` or `Cmd+R`)

This clears the Recoil cache.

---

### **Option 2: Force Re-fetch Avatar (Recommended)**

**Add cache-busting to the avatar URL upload:**

**File:** `/home/lytle/twenty-dev/packages/twenty-front/src/modules/settings/profile/components/ProfilePictureUploader.tsx`

**Replace lines 68-71:**

```typescript
setCurrentWorkspaceMember({
  ...currentWorkspaceMember,
  avatarUrl: buildSignedPath(signedFile),
});
```

**With this:**

```typescript
// Add cache-busting timestamp to force browser reload
const avatarUrlWithCacheBust = `${buildSignedPath(signedFile)}?v=${Date.now()}`;

setCurrentWorkspaceMember({
  ...currentWorkspaceMember,
  avatarUrl: avatarUrlWithCacheBust,
});

// Clear the invalid avatar cache in case URL was previously marked as failed
if (typeof window !== 'undefined') {
  localStorage.removeItem('recoil-persist');
}
```

---

### **Option 3: Reset Invalid Avatar Cache (Permanent Fix)**

**File:** `/home/lytle/twenty-dev/packages/twenty-ui/src/display/avatar/components/Avatar.tsx`

**Add cache invalidation when avatar updates successfully:**

Find line 121 (the `handleImageError` function) and modify:

```typescript
const handleImageError = () => {
  if (isNonEmptyString(avatarImageURI)) {
    setInvalidAvatarUrls((prev) => [...prev, avatarImageURI]);
  }
};
```

**Replace with:**

```typescript
const handleImageError = () => {
  if (isNonEmptyString(avatarImageURI)) {
    // Only add to invalid list if it's not a cache-busted URL
    // (URLs with ?v= or ?t= are fresh uploads)
    if (!avatarImageURI.includes('?v=') && !avatarImageURI.includes('?t=')) {
      setInvalidAvatarUrls((prev) => [...prev, avatarImageURI]);
    }
  }
};

// Add this new useEffect to clear invalid cache when avatar changes
useEffect(() => {
  // When avatar URL changes, remove old URL from invalid list
  if (isNonEmptyString(avatarImageURI)) {
    setInvalidAvatarUrls((prev) =>
      prev.filter(url => !url.includes(avatarUrl ?? ''))
    );
  }
}, [avatarUrl, avatarImageURI, setInvalidAvatarUrls]);
```

**Don't forget to import useEffect at the top:**

```typescript
import { useContext, useEffect } from 'react';
```

---

## **Testing the Fix:**

1. **Remove** your current avatar in Settings → Profile
2. Wait 2 seconds
3. **Upload** the Swanson logo again
4. The avatar should appear immediately (not purple W)
5. Refresh page - avatar should persist

---

## **If Still Not Working:**

### **Debug Steps:**

1. **Check browser console (`F12` → Console):**
   - Look for 404 errors on avatar URL
   - Look for CORS errors
   - Look for "Failed to load image" errors

2. **Check Network tab:**
   - Upload avatar
   - Watch for the upload request
   - Check if response contains `path` and `token`

3. **Check the actual avatar URL:**
   - Right-click avatar → Inspect
   - Look at the `<img src="...">` value
   - Should look like: `/files/profile-pictures/xxx/yyy.png?token=...&v=123456789`

4. **Verify file exists on server:**
   ```bash
   cd /home/lytle/twenty-dev
   ls -lh packages/twenty-server/storage/profile-pictures/
   ```

---

## **Why This Happens:**

1. **First upload** - URL might fail due to:
   - Signed URL not generated yet
   - File processing delay
   - Network timeout

2. **Avatar component caches the failure** in `invalidAvatarUrlsState`

3. **All future renders** - Even with new URL, old URL pattern matches and shows placeholder

4. **Cache persists** across page refreshes via Recoil persistence

---

## **The Complete Fix (Apply All Changes):**

**File 1:** `ProfilePictureUploader.tsx` (lines 68-71)
```typescript
const avatarUrlWithCacheBust = `${buildSignedPath(signedFile)}?v=${Date.now()}`;
setCurrentWorkspaceMember({
  ...currentWorkspaceMember,
  avatarUrl: avatarUrlWithCacheBust,
});
```

**File 2:** `Avatar.tsx` (add after imports)
```typescript
import { useContext, useEffect } from 'react';
```

**File 3:** `Avatar.tsx` (modify handleImageError and add useEffect)
```typescript
// Around line 121
const handleImageError = () => {
  if (isNonEmptyString(avatarImageURI)) {
    if (!avatarImageURI.includes('?v=') && !avatarImageURI.includes('?t=')) {
      setInvalidAvatarUrls((prev) => [...prev, avatarImageURI]);
    }
  }
};

// Add this right after handleImageError
useEffect(() => {
  if (isNonEmptyString(avatarImageURI)) {
    setInvalidAvatarUrls((prev) =>
      prev.filter(url => !url.startsWith(avatarImageURI.split('?')[0]))
    );
  }
}, [avatarUrl, avatarImageURI, setInvalidAvatarUrls]);
```

---

## **After Making Changes:**

```bash
# Restart frontend dev server
cd /home/lytle/twenty-dev/packages/twenty-front
# Stop current server (Ctrl+C)
yarn start
```

Then:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+Shift+R)
3. Upload avatar again

---

Let me know if you want me to make these changes for you!
