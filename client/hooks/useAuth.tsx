/**
 * useAuth Hook
 * 
 * Custom React hook to manage authentication state
 * Provides access to current user, loading state, and auth functions
 * 
 * ISSUE 1.1 FIX: Auth user returned immediately, profile loads in background
 * ISSUE 1.3 FIX: Proper profile sync after updates
 */

'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { AuthUser, getCurrentUser, onAuthStateChange, refreshUserProfile, loadUserProfile } from '@/lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

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

    const initAuth = async () => {
      try {
        // Step 1: Try to get current user (with retry on first attempt)
        let currentUser = await getCurrentUser();
        
        // Step 2: If we get null but there's a session, wait and retry
        // This fixes race condition on page refresh
        if (!currentUser) {
          await new Promise(resolve => setTimeout(resolve, 100));
          currentUser = await getCurrentUser();
        }
        
        if (isMounted) {
          setUser(currentUser);
          
          // Step 3: Load profile in background if user exists
          if (currentUser) {
            const profile = await loadUserProfile(currentUser.id);
            if (isMounted && profile) {
              setUser(prev => prev ? { ...prev, ...profile } : null);
            }
          }
          
          // Step 4: Set loading to false only when we have a definitive answer
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    initAuth();

    // Set up auth state listener with background profile loading
    const unsubscribe = onAuthStateChange(
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
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    refreshUser,
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
