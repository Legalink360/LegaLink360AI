# Session Timeout & Auto-Logout Analysis

**Document Date:** February 5, 2026  
**Status:** Analysis Complete - Ready for Implementation

---

## Executive Summary

Your application currently has a **session management system with auto-token refresh** to keep users logged in. However, there are **confusing mechanisms** that might be causing premature logouts. This document explains what exists, why, and how to fix it for "never logout" behavior.

---

## 1. Current Session Management Architecture

### 1.1 What Exists Today

Your app has **THREE layers** of session management:

#### Layer 1: Supabase JWT Tokens (Auth Backend)
- **Session lifetime:** 1 hour (default Supabase setting)
- **Refresh token:** Valid for 30 days
- **Purpose:** Secure authentication with Supabase backend

```typescript
// In auth.ts - getSupabaseClient()
supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,           // ✅ Keep session in localStorage
    autoRefreshToken: true,         // ✅ Auto-refresh tokens
    detectSessionInUrl: true,       // ✅ Detect session from URL
  },
});
```

#### Layer 2: Auto-Token Refresh (Every 50 Minutes)
```typescript
// In auth.ts - setupAutoTokenRefresh()
export function setupAutoTokenRefresh(): NodeJS.Timeout | null {
  const refreshInterval = setInterval(async () => {
    const success = await refreshSession();
    if (!success) {
      console.warn('⚠️ Background token refresh failed');
    }
  }, 50 * 60 * 1000); // 50 minutes - REFRESHES BEFORE 1-HOUR EXPIRY
  
  return refreshInterval;
}
```

#### Layer 3: Auth State Listener (OnAuthStateChange)
```typescript
// In useAuth.tsx - AuthProvider component
unsubscribe = onAuthStateChange(
  (updatedUser: AuthUser | null) => {
    setUser(updatedUser);
    setLoading(false);
  },
  (profile) => {
    setUser(prev => prev ? { ...prev, ...profile } : null);
  }
);
```

### 1.2 Timeouts That Might Cause Logout

| Component | Timeout | Purpose | Risk |
|-----------|---------|---------|------|
| `initAuth()` | 15 seconds | Force loading state to false | ⚠️ Might show user as logged out temporarily |
| `getCurrentUser()` | 20 seconds | Get current user data | ⚠️ Could trigger if network is slow |
| `loadUserProfile()` | 8 seconds | Load profile from DB | ✅ Non-blocking, doesn't logout |
| `signOut()` | 5 seconds | Sign out operation | ✅ Only when user explicitly logs out |

---

## 2. Why Do We Have This System?

### 2.1 **Why Supabase JWT Tokens Expire (1 hour)**

```
Security Best Practice: Short-lived tokens reduce security risks
├─ If token stolen → limited time to use it
├─ Forces periodic refresh → ensures user still has valid session
└─ Refresh token (30 days) → allows background token renewal
```

**Benefit:** Protects against token theft  
**Cost:** Requires periodic refresh

### 2.2 **Why Auto-Token Refresh (Every 50 Minutes)**

To avoid the 1-hour token expiry, we refresh BEFORE it expires:
- ✅ User stays logged in seamlessly
- ✅ No interruption to user experience
- ✅ Happens in background (user doesn't notice)

### 2.3 **Why Timeouts Exist**

```
Problem: What if server is slow or network fails?
├─ getCurrentUser() waits forever → app freezes
├─ loadUserProfile() waits forever → profile never loads
└─ Solution: Add timeouts to prevent hanging
```

---

## 3. What Causes "Users Log Out After A Few Seconds"?

### Possible Causes:

**Scenario A: Network/Server Issues**
```
1. User logs in ✅
2. Auto-token refresh fails (slow network)
3. Token expires after 1 hour
4. Supabase listener detects expired session
5. User forced to re-login
```

**Scenario B: Timeout Triggers Logout**
```
1. User logs in ✅
2. loadUserProfile() times out at 8 seconds
3. Session appears invalid
4. App logs user out ❌
```

**Scenario C: Browser Storage Issues**
```
1. localStorage gets cleared
2. Session not found
3. User logged out
```

---

## 4. Do We NEED This System?

### For Production: **YES, with modifications**
- ✅ Token refresh is a security best practice
- ✅ Auto-refresh prevents user interruption
- ✅ Timeouts prevent app freezing

### Current Issues: **YES, should be fixed**
- ❌ Timeouts too aggressive (15s, 20s, 8s)
- ❌ Error recovery could be better
- ❌ No fallback if refresh fails

---

## 5. How to Fix: "Never Logout" Implementation

### Solution: Extend Session Lifetime & Improve Recovery

#### Fix 1: Increase Token Expiry (Supabase Setting)
```
Current: 1 hour
Better: 7 days (for mobile apps) or 24 hours
Risk: Medium - tokens valid longer if stolen
Mitigation: Use HTTPS only + refresh token rotation
```

#### Fix 2: Increase Auto-Refresh Interval
```typescript
// Change from 50 minutes to 6 days
const REFRESH_INTERVAL = 6 * 24 * 60 * 60 * 1000; // 6 days

// Or: Refresh only when user interacts
setupAutoTokenRefresh(true); // true = activity-based refresh
```

#### Fix 3: Disable Aggressive Timeouts in Development
```typescript
const TIMEOUT = process.env.NODE_ENV === 'development' 
  ? 60000  // 60 seconds in dev
  : 5000;  // 5 seconds in production
```

#### Fix 4: Improve Error Recovery
```typescript
// If auto-refresh fails:
// - Retry 3 times before giving up
// - Cache session data locally
// - Don't logout user immediately
// - Show warning to user instead
```

#### Fix 5: Add Session Persistence
```typescript
// In localStorage
// Save: {sessionToken, expiresAt, refreshToken}
// On app start: Check if still valid before asking user to login
```

---

## 6. Implementation Plan

### Phase 1: Increase Timeouts (Immediate)
- [ ] Change `initAuth()` timeout from 15s → 60s
- [ ] Change `getCurrentUser()` timeout from 20s → 30s
- [ ] Change `loadUserProfile()` timeout from 8s → 15s

### Phase 2: Improve Token Refresh
- [ ] Change refresh interval from 50 min → 6 days
- [ ] Add retry logic (3 attempts before fail)
- [ ] Add activity-based refresh (refresh on user interaction)

### Phase 3: Better Error Handling
- [ ] Don't logout on timeout
- [ ] Cache user data locally
- [ ] Show warning instead of forcing logout
- [ ] Provide manual refresh button

### Phase 4: Session Persistence
- [ ] Save session to localStorage with expiry
- [ ] On app start: Check session validity
- [ ] Skip login screen if session still valid

---

## 7. Recommended Action: "Never Logout" Setup

```typescript
// config.ts
export const SESSION_CONFIG = {
  // Token expiry (Supabase)
  TOKEN_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 days
  
  // Auto-refresh timing
  AUTO_REFRESH_INTERVAL: 6 * 24 * 60 * 60 * 1000, // 6 days
  AUTO_REFRESH_ENABLED: true,
  
  // Timeouts (much longer)
  INIT_TIMEOUT: 60000,        // 60s
  GET_USER_TIMEOUT: 30000,    // 30s
  LOAD_PROFILE_TIMEOUT: 15000, // 15s
  
  // Behavior
  LOGOUT_ON_TIMEOUT: false,   // Don't logout if slow
  CACHE_SESSION: true,        // Cache in localStorage
  SHOW_REFRESH_WARNING: true, // Warn before logout
};
```

---

## 8. Side Effects & Considerations

| Change | Benefit | Risk | Mitigation |
|--------|---------|------|-----------|
| Longer token lifetime | Users stay logged in longer | Token theft = longer access | Use HTTPS, invalidate on logout |
| Less frequent refresh | Fewer API calls | Might miss expired tokens | Keep current timeout logic as fallback |
| Longer timeouts | Slow networks work better | App seems frozen | Add loading indicator |
| Activity-based refresh | Only refresh when needed | Complex to implement | Can add later |
| Session caching | Faster app startup | Stale data | Validate with server on start |

---

## 9. Questions to Answer

1. **What's acceptable session length for your users?**
   - Legal app → probably 8+ hours
   - Finance app → probably 15-30 minutes
   - SaaS tool → probably 24+ hours

2. **Is "never logout" realistic?**
   - Better: "Stay logged in for 7 days"
   - Or: "Logout after 30 days of inactivity"

3. **Do you want activity-based logout?**
   - If no activity → logout after X time
   - If active → keep session alive

4. **What about mobile users?**
   - They often expect to stay logged in for weeks
   - Refresh tokens help here

---

## 10. Summary & Recommendation

### Current State: ⚠️ **Unclear**
- System in place to keep users logged in
- Aggressive timeouts might interrupt this
- Auto-refresh should work, but might fail silently

### Problem: ❓ **Users log out after "few seconds"**
- Likely cause: Network issues or timeout triggers
- Not by design

### Recommended Fix: ✅ **Do This First**
1. Increase all timeouts (60s, 30s, 15s)
2. Disable logout on timeout
3. Add retry logic to refresh
4. Test with slow networks

### After That:
1. Extend token lifetime to 7 days
2. Change refresh interval to 6 days
3. Cache session data
4. Monitor for actual logouts

---

## Next Steps

**Ready to implement?** Answer these questions:

1. How long should users stay logged in without action?
2. Should we force logout after inactivity?
3. Is "24/7 logged in" acceptable for your use case?

Then we'll implement the fixes in `auth.ts` and `useAuth.tsx`.

---

**Author's Notes:**
- This system is **better than none**, but confusing
- The 50-minute refresh interval is **smart** but hidden
- Real "never logout" requires longer tokens + caching
- Mobile apps do this routinely (7-30 day sessions)
