/**
 * Session Cache
 * 
 * Provides offline support and faster startup by caching:
 * - Session tokens (access + refresh)
 * - User profile data

 * 
 * Strategy:
 * 1. On login: Save tokens and user data
 * 2. On app startup: Load from cache to show UI immediately
 * 3. Validate cache with server (in background)
 * 4. On logout: Clear all cache
 * 5. On network error: Use cache as fallback
 */

import { SESSION_CONFIG } from './sessionConfig';

export interface CachedSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: {
    id: string;
    email: string;
    name?: string;
  };
  savedAt: number;
}

export interface CachedUserProfile {
  id: string;
  email: string;
  name?: string;
  profile?: Record<string, unknown>;
  savedAt: number;
}

export interface CachedThreads {
  threads: Array<{
    id: string;
    name: string;
    createdAt: string;
  }>;
  savedAt: number;
}

const STORAGE_KEYS = {
  SESSION: 'legalink360:session',
  USER_PROFILE: 'legalink360:user_profile',
  THREADS: 'legalink360:threads',
  LAST_ACTIVITY: 'legalink360:last_activity',
};

/**
 * Session Cache Manager
 * 
 * Handles all session caching operations with TTL validation
 */
export const sessionCache = {
  // ============================================================================
  // SESSION TOKEN MANAGEMENT
  // ============================================================================

  /**
   * Save session tokens to cache
   */
  saveSession(session: CachedSession): void {
    if (!SESSION_CONFIG.persistence.ENABLED) return;

    try {
      const data = {
        ...session,
        savedAt: Date.now(),
      };
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(data));
      console.log('✅ Session cached');
    } catch (error) {
      console.error('❌ Failed to cache session:', error);
    }
  },

  /**
   * Get cached session tokens
   * Returns null if expired or cache is stale
   */
  getSession(): CachedSession | null {
    if (!SESSION_CONFIG.persistence.ENABLED) return null;

    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (!data) return null;

      const session: CachedSession = JSON.parse(data);
      
      // Check if cache is stale
      const now = Date.now();
      const age = now - session.savedAt;
      if (age > SESSION_CONFIG.persistence.CACHE_TTL) {
        console.log('⏳ Session cache expired');
        return null;
      }

      // Check if token is expired
      if (now > session.expiresAt) {
        console.log('🔴 Token expired');
        return null;
      }

      console.log('✅ Using cached session');
      return session;
    } catch (error) {
      console.error('❌ Failed to get cached session:', error);
      return null;
    }
  },

  /**
   * Clear session cache
   */
  clearSession(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
      console.log('🗑️ Session cache cleared');
    } catch (error) {
      console.error('❌ Failed to clear session:', error);
    }
  },

  /**
   * Check if session exists in cache
   */
  hasSession(): boolean {
    const session = this.getSession();
    return session !== null;
  },

  // ============================================================================
  // USER PROFILE CACHING
  // ============================================================================

  /**
   * Cache user profile data
   */
  saveUserProfile(profile: CachedUserProfile): void {
    if (!SESSION_CONFIG.persistence.CACHE_USER_DATA) return;

    try {
      const data = {
        ...profile,
        savedAt: Date.now(),
      };
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(data));
      console.log('✅ User profile cached');
    } catch (error) {
      console.error('❌ Failed to cache user profile:', error);
    }
  },

  /**
   * Get cached user profile
   */
  getUserProfile(): CachedUserProfile | null {
    if (!SESSION_CONFIG.persistence.CACHE_USER_DATA) return null;

    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (!data) return null;

      const profile: CachedUserProfile = JSON.parse(data);
      
      // Check if cache is stale
      const age = Date.now() - profile.savedAt;
      if (age > SESSION_CONFIG.persistence.CACHE_TTL) {
        return null;
      }

      console.log('✅ Using cached user profile');
      return profile;
    } catch (error) {
      console.error('❌ Failed to get cached user profile:', error);
      return null;
    }
  },

  /**
   * Clear user profile cache
   */
  clearUserProfile(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    } catch (error) {
      console.error('❌ Failed to clear user profile:', error);
    }
  },

  // ============================================================================
  // THREAD CACHING
  // ============================================================================

  /**
   * Cache chat threads list
   */
  saveThreads(threads: CachedThreads['threads']): void {
    if (!SESSION_CONFIG.persistence.CACHE_THREADS) return;

    try {
      const data: CachedThreads = {
        threads,
        savedAt: Date.now(),
      };
      localStorage.setItem(STORAGE_KEYS.THREADS, JSON.stringify(data));
      console.log('✅ Threads cached');
    } catch (error) {
      console.error('❌ Failed to cache threads:', error);
    }
  },

  /**
   * Get cached threads
   */
  getThreads(): CachedThreads['threads'] | null {
    if (!SESSION_CONFIG.persistence.CACHE_THREADS) return null;

    try {
      const data = localStorage.getItem(STORAGE_KEYS.THREADS);
      if (!data) return null;

      const cache: CachedThreads = JSON.parse(data);
      
      // Check if cache is stale
      const age = Date.now() - cache.savedAt;
      if (age > SESSION_CONFIG.persistence.CACHE_TTL) {
        return null;
      }

      console.log('✅ Using cached threads');
      return cache.threads;
    } catch (error) {
      console.error('❌ Failed to get cached threads:', error);
      return null;
    }
  },

  /**
   * Clear threads cache
   */
  clearThreads(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.THREADS);
    } catch (error) {
      console.error('❌ Failed to clear threads:', error);
    }
  },

  // ============================================================================
  // ACTIVITY TRACKING (for activity-based refresh)
  // ============================================================================

  /**
   * Record user activity (for activity-based token refresh)
   */
  recordActivity(): void {
    if (!SESSION_CONFIG.refresh.ACTIVITY_BASED) return;

    try {
      localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
    } catch (error) {
      console.error('❌ Failed to record activity:', error);
    }
  },

  /**
   * Get time since last activity
   */
  getTimeSinceLastActivity(): number {
    try {
      const lastActivity = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY);
      if (!lastActivity) return 0;
      return Date.now() - parseInt(lastActivity);
    } catch (error) {
      console.error('❌ Failed to get last activity:', error);
      return 0;
    }
  },

  /**
   * Check if should refresh based on activity
   */
  shouldRefreshBasedOnActivity(): boolean {
    if (!SESSION_CONFIG.refresh.ACTIVITY_BASED) return false;

    const timeSinceActivity = this.getTimeSinceLastActivity();
    const needsRefresh = timeSinceActivity < SESSION_CONFIG.refresh.BUFFER_TIME;

    return needsRefresh;
  },

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  /**
   * Clear all cache (on logout)
   */
  clearAll(): void {
    console.log('🗑️ Clearing all session cache');
    this.clearSession();
    this.clearUserProfile();
    this.clearThreads();
    
    try {
      localStorage.removeItem(STORAGE_KEYS.LAST_ACTIVITY);
    } catch (error) {
      console.error('❌ Failed to clear activity:', error);
    }
  },

  /**
   * Get cache statistics (for debugging)
   */
  getStats(): {
    hasSession: boolean;
    hasProfile: boolean;
    hasThreads: boolean;
    lastActivity: number;
  } {
    return {
      hasSession: this.hasSession(),
      hasProfile: this.getUserProfile() !== null,
      hasThreads: this.getThreads() !== null,
      lastActivity: this.getTimeSinceLastActivity(),
    };
  },
};

export default sessionCache;
