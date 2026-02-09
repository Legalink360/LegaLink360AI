/**
 * useAuth Hook
 * 
 * Custom React hook to manage authentication state
 * Provides access to current user, loading state, and auth functions
 * 
 * IMPROVEMENTS:
 * - Better timeout handling (5 second max)
 * - Improved cleanup and listener management
 * - Better error recovery
 * - Force user state clear on sign out
 */

'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { AuthUser, getCurrentUser, onAuthStateChange, refreshUserProfile, loadUserProfile, setupAutoTokenRefresh } from '@/lib/auth';
import { SESSION_CONFIG } from '@/lib/sessionConfig';
import { sessionCache } from '@/lib/sessionCache';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  clearUser: () => void;  // New: Force clear user
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const clearUser = useCallback(() => {
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const updatedUser = await refreshUserProfile();
      setUser(updatedUser);
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout | null = null;
    let unsubscribe: (() => void) | null = null;
    let refreshIntervalId: NodeJS.Timeout | null = null;

    const initAuth = async () => {
      try {
        // Set a maximum timeout (using config value: 60 seconds instead of 15s)
        timeoutId = setTimeout(() => {
          if (isMounted && loading) {
            console.warn(`⚠️ Auth initialization timeout (${SESSION_CONFIG.timeouts.INIT_AUTH / 1000}s) - forcing loading to false`);
            setLoading(false);
          }
        }, SESSION_CONFIG.timeouts.INIT_AUTH);

        // Step 1: Try to get current user
        let currentUser = await getCurrentUser();
        
        // Step 2: If we get null but there's a session, wait and retry
        if (!currentUser) {
          await new Promise(resolve => setTimeout(resolve, 100));
          currentUser = await getCurrentUser();
        }
        
        if (isMounted) {
          setUser(currentUser);
          
          // Step 3: Load profile in background if user exists (non-blocking)
          if (currentUser) {
            loadUserProfile(currentUser.id)
              .then(profile => {
                if (isMounted && profile) {
                  setUser(prev => prev ? { ...prev, ...profile } : null);
                }
              })
              .catch(err => {
                console.error('Profile load error (non-blocking):', err);
              });
            
            // IMPROVEMENT: Set up automatic silent token refresh (every 6 days)
            refreshIntervalId = setupAutoTokenRefresh();
            console.log('✅ Auto-refresh enabled - tokens will refresh silently');
          }
          
          // Step 4: Set loading to false
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (isMounted) {
          setUser(null);
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }
          setLoading(false);
        }
      }
    };

    // Initialize auth immediately
    initAuth();

    // Listen for session refresh failures (don't logout, just show warning)
    const handleSessionRefreshFailed = (event: Event) => {
      const customEvent = event as CustomEvent;
      // Only show warning for real failures, not aborts
      const errorMsg = customEvent.detail?.error;
      if (!errorMsg?.includes('aborted')) {
        console.warn('⚠️ Session refresh failed:', errorMsg);
        
        // Show warning to user but DON'T logout
        if (SESSION_CONFIG.onTimeout.SHOW_WARNING) {
          window.dispatchEvent(
            new CustomEvent('notification:warning', {
              detail: {
                message: SESSION_CONFIG.messages.REFRESH_FAILED,
                duration: 3000,
              },
            })
          );
        }
      }
    };

    window.addEventListener('session:refresh-failed', handleSessionRefreshFailed);

    // Set up auth state listener with background profile loading
    unsubscribe = onAuthStateChange(
      (updatedUser: AuthUser | null) => {
        if (isMounted) {
          setUser(updatedUser);
          setLoading(false);
        }
      },
      (profile) => {
        // Called when profile finishes loading in background
        if (isMounted) {
          setUser(prev => prev ? { ...prev, ...profile } : null);
        }
      }
    );

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (refreshIntervalId) {
        clearInterval(refreshIntervalId);
      }
      if (unsubscribe) {
        unsubscribe();
      }
      // Cleanup event listeners
      window.removeEventListener('session:refresh-failed', handleSessionRefreshFailed);
    };
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    refreshUser,
    clearUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
