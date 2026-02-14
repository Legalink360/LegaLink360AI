/**
 * Supabase Authentication Setup
 * 
 * This file initializes Supabase Auth with:
 * - Email/password signup
 * - Email verification
 * - Login/logout
 * - Session persistence
 * - Password reset
 * - Profile management
 */

import { createClient } from '@supabase/supabase-js';
import { SESSION_CONFIG } from './sessionConfig';
import { sessionCache } from './sessionCache';

// Lazy-load Supabase client to avoid errors during build
let supabase: any = null;

export function getSupabaseClient() {
  if (supabase) {
    return supabase;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  // IMPROVED: Enable auto-refresh and persistent sessions for seamless experience
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,           // Keep session in localStorage
      autoRefreshToken: true,         // Auto-refresh tokens before expiry
      detectSessionInUrl: true,       // Detect session from URL on callback
    },
  });

  // Set up auto token refresh (50-minute interval)
  // Note: Activity-based refresh disabled - it was causing race conditions
  // Supabase auto-refresh + periodic 50-min refresh is sufficient
  if (typeof window !== 'undefined') {
    // setupActivityBasedRefresh();  // DISABLED - was causing conflicts
  }
  
  return supabase;
}

/**
 * Auth Service - Wrapper around Supabase Auth
 */

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  company?: string;
  phone?: string;
  emailVerified: boolean;
  createdAt: Date;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: AuthUser;
  error?: string;
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  firstName: string,
  lastName: string
): Promise<AuthResponse> {
  try {
    // Sign up with Supabase Auth
    const { data, error } = await getSupabaseClient().auth.signUp({
      email,
      password,
      options: {
        data: {
          firstName,
          lastName,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email`,
      },
    });

    if (error) {
      return {
        success: false,
        message: error.message,
        error: error.code,
      };
    }

    if (!data.user) {
      return {
        success: false,
        message: 'Failed to create user',
      };
    }

    return {
      success: true,
      message: 'Check your email to verify your account',
      user: {
        id: data.user.id,
        email: data.user.email || '',
        firstName,
        lastName,
        emailVerified: !!data.user.email_confirmed_at,
        createdAt: new Date(data.user.created_at || ''),
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Sign up failed',
    };
  }
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResponse> {
  try {
    // Add timeout for login (90 seconds - reasonable for auth)
    const loginPromise = getSupabaseClient().auth.signInWithPassword({
      email,
      password,
    });
    
    const timeoutPromise = new Promise<any>((resolve) => {
      setTimeout(() => {
        resolve({ error: { message: 'Login request timed out. Please try again.' }, data: null });
      }, 90000); // 90 seconds
    });
    
    const { data, error } = await Promise.race([loginPromise, timeoutPromise]);

    if (error) {
      return {
        success: false,
        message: error.message,
        error: error.code,
      };
    }

    if (!data.user) {
      return {
        success: false,
        message: 'Login failed',
      };
    }

    // Check if email is verified
    if (!data.user.email_confirmed_at) {
      return {
        success: false,
        message:
          'Please verify your email before logging in. Check your inbox for verification link.',
      };
    }

    // Return immediately - profile will be loaded via onAuthStateChange hook
    return {
      success: true,
      message: 'Login successful',
      user: {
        id: data.user.id,
        email: data.user.email || '',
        emailVerified: !!data.user.email_confirmed_at,
        createdAt: new Date(data.user.created_at || ''),
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Login failed',
    };
  }
}

/**
 * Sign out
 * IMPROVED: Added timeout protection and better error handling
 */
export async function signOut(): Promise<AuthResponse> {
  try {
    // Add timeout to prevent hanging
    const signOutPromise = getSupabaseClient().auth.signOut();
    
    const timeoutPromise = new Promise<{ error: Error }>((resolve) => {
      setTimeout(() => {
        resolve({ error: new Error('Sign out timeout - took too long') });
      }, 8000);
    });

    const { error } = await Promise.race([signOutPromise, timeoutPromise]) as any;

    if (error) {
      console.error('Sign out error:', error);
      return {
        success: false,
        message: error.message || 'Failed to sign out',
      };
    }

    // Clear any cached data
    if (typeof window !== 'undefined') {
      // Don't clear all localStorage - just clear session-specific items
      try {
        sessionStorage.clear();
      } catch (e) {
        console.warn('Could not clear sessionStorage:', e);
      }
    }

    return {
      success: true,
      message: 'Logged out successfully',
    };
  } catch (error) {
    console.error('Sign out exception:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Logout failed',
    };
  }
}

/**
 * Get current authenticated user
 * ISSUE 1.1 FIX: Removed blocking profile fetch - now returns auth user immediately
 * ISSUE #1 ANALYSIS FIX: Use session.user instead of getUser() to avoid race condition
 * Profile data is loaded asynchronously in background via loadUserProfile()
 * 7-DAY SESSION FIX: Added retry logic, increased timeout, and caching
 */
export async function getCurrentUser(retryCount = 0): Promise<AuthUser | null> {
  try {
    // Add reasonable timeout (45 seconds) but use cache instead of logging out on timeout
    const timeoutPromise = new Promise<{ data: { session: null } }>((resolve) => {
      setTimeout(() => {
        console.debug('ℹ️ getCurrentUser taking longer than 45s - will use cache if available');
        resolve({ data: { session: null } });
      }, 45000); // 45 seconds
    });

    const sessionPromise = getSupabaseClient().auth.getSession();
    const result = await Promise.race([sessionPromise, timeoutPromise]);
    
    const { data, error: sessionError } = result as any;
    
    if (!data || sessionError) {
      // Timeout or error occurred - try cache first (don't logout!)
      const cachedSession = sessionCache.getSession();
      if (cachedSession) {
        return {
          id: cachedSession.user.id,
          email: cachedSession.user.email,
          emailVerified: true,
          createdAt: new Date(),
        };
      }
      
      if (sessionError) {
        console.error('Session error:', sessionError);
      }
      return null;
    }

    const { session } = data;

    if (!session) {
      // No session - try cache
      const cachedSession = sessionCache.getSession();
      if (cachedSession) {
        return {
          id: cachedSession.user.id,
          email: cachedSession.user.email,
          emailVerified: true,
          createdAt: new Date(),
        };
      }
      return null;
    }

    // Use session.user instead of calling getUser() again (avoids race condition)
    const user = session.user;
    if (!user) {
      return null;
    }

    // Cache the user data for offline support
    sessionCache.saveUserProfile({
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.first_name,
      savedAt: Date.now(),
    });

    // Return auth user immediately (without profile to avoid blocking login)
    return {
      id: user.id,
      email: user.email || '',
      emailVerified: !!user.email_confirmed_at,
      createdAt: new Date(user.created_at || ''),
    };
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    
    // Try cache on any exception
    const cachedSession = sessionCache.getSession();
    if (cachedSession) {
      return {
        id: cachedSession.user.id,
        email: cachedSession.user.email,
        emailVerified: true,
        createdAt: new Date(),
      };
    }
    
    return null;
  }
}

/**
 * Refresh session token
 * AUTOLOGOUT FIX: Prevent logout due to expired session
 * Automatically refreshes the session if it's expired or about to expire*/
export async function refreshSession(): Promise<boolean> {
  try {
    const { data, error } = await getSupabaseClient().auth.refreshSession();
    
    if (error) {
      // Check if it's an abort error (safe to ignore - request was cancelled optimally)
      if (error.message?.includes('aborted') || error.name === 'AbortError') {
        console.debug('ℹ️ Token refresh aborted (safe) - will retry on next interval');
        return true; // Treat abort as success - it's not a real failure
      }
      
      console.warn('⚠️ Failed to refresh session:', error?.message);
      
      // Dispatch event only on real errors, not aborts
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('session:refresh-failed', {
            detail: { error: error.message },
          })
        );
      }
      return false;
    }
    
    if (!data.session) {
      console.warn('⚠️ No session returned from refresh');
      return false;
    }
    
    // Cache the session after successful refresh
    if (data.session) {
      sessionCache.saveSession({
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token || '',
        expiresAt: data.session.expires_at ? data.session.expires_at * 1000 : Date.now() + (7 * 24 * 60 * 60 * 1000),
        user: {
          id: data.session.user?.id || '',
          email: data.session.user?.email || '',
          name: data.session.user?.user_metadata?.first_name,
        },
        savedAt: Date.now(),
      });
    }
    
    return true;
  } catch (error) {
    // Check if it's an abort error (safe - request was optimally cancelled by Supabase)
    if (error instanceof Error && error.name === 'AbortError') {
      console.debug('ℹ️ Token refresh request aborted (safe) - will retry later');
      return true; // Don't treat as failure
    }
    
    console.error('Error refreshing session:', error);
    return false;
  }
}

/**
 * Set up automatic silent token refresh
 * IMPROVEMENT: Silently refreshes tokens every 50 minutes (before 7-day expiry)
 * This ensures users stay logged in without interruption
 * FIXED: Prevents multiple intervals and handles abort errors gracefully
 */
let globalRefreshIntervalId: NodeJS.Timeout | null = null;

export function setupAutoTokenRefresh(): NodeJS.Timeout | null {
  if (typeof window === 'undefined') return null; // Only in browser
  
  // Clear any existing interval first to prevent duplicates
  if (globalRefreshIntervalId) {
    clearInterval(globalRefreshIntervalId);
    globalRefreshIntervalId = null;
  }
  
  // Refresh token every 50 minutes (before the 7-day session expiry)
  globalRefreshIntervalId = setInterval(async () => {
    try {
      const success = await refreshSession();
      if (!success) {
        console.warn('⚠️ Background token refresh failed - will retry on next interval');
      }
    } catch (error) {
      console.error('Error in auto-refresh:', error);
    }
  }, 50 * 60 * 1000); // 50 minutes
  
  return globalRefreshIntervalId;
}

/**
 * Set up activity-based token refresh
 * Refreshes tokens when user is active and approaching token expiry
 * This provides a better UX than interval-based refresh
 */
export function setupActivityBasedRefresh(): void {
  if (typeof window === 'undefined') return; // Only in browser
  if (!SESSION_CONFIG.refresh.ACTIVITY_BASED) return; // Only if enabled

  // Track user activity
  const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
  
  const recordActivity = () => {
    sessionCache.recordActivity();
  };

  // Add activity listeners
  activityEvents.forEach((event) => {
    window.addEventListener(event, recordActivity, { passive: true });
  });

  // Check if should refresh based on activity
  const activityRefreshInterval = setInterval(async () => {
    if (sessionCache.shouldRefreshBasedOnActivity()) {
      const success = await refreshSession();
      if (success) {
        console.log('✅ Activity-based token refresh succeeded');
      }
    }
  }, SESSION_CONFIG.refresh.DEBOUNCE_TIME);

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    activityEvents.forEach((event) => {
      window.removeEventListener(event, recordActivity);
    });
    clearInterval(activityRefreshInterval);
  });
}

/**
 * Load user profile data asynchronously (background)
 * ISSUE 1.1 FIX: Separated from getCurrentUser to prevent blocking login
 * ISSUE 1.2 FIX: Improved error handling with retry logic for RLS issues
 * ISSUE FIX: Added timeout and better RLS error handling
 */
export async function loadUserProfile(userId: string): Promise<Partial<AuthUser> | null> {
  try {
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => {
        console.warn('⚠️ loadUserProfile timeout');
        resolve(null);
      }, 8000);
    });

    // Step 1: Check session
    const sessionPromise = getSupabaseClient().auth.getSession();
    const {
      data: { session },
      error: sessionError,
    } = await Promise.race([sessionPromise, timeoutPromise]) as any;

    if (sessionError || !session) {
      console.error('❌ No active session when trying to load profile');
      return null;
    }

    // Step 2: Get current user from auth (with timeout)
    const getUserPromise = getSupabaseClient().auth.getUser();
    const {
      data: { user: authUser },
      error: authError,
    } = await Promise.race([getUserPromise, timeoutPromise]) as any;

    if (authError || !authUser) {
      console.error('❌ No auth user');
      return null;
    }

    // Step 3: Try to fetch profile (with timeout)
    const profileQueryPromise = getSupabaseClient()
      .from('user_profiles')
      .select('first_name, last_name, auth_id, email, job_title, company, phone')
      .eq('auth_id', userId);

    const { data: profiles, error: profileError } = await Promise.race([
      profileQueryPromise,
      timeoutPromise.then(() => ({ data: null, error: { message: 'Timeout' } }))
    ]) as any;

    if (profileError) {
      // Check if it's an RLS error
      if (profileError.message?.includes('row-level security') || profileError.code === '42501') {
        console.warn('⚠️ RLS policy may be blocking profile access. This might be expected if profile doesn\'t exist yet.');
      } else {
        console.error('❌ Profile query error:', profileError);
      }
      return null;
    }

    // Profile doesn't exist - create it automatically on first login
    if (!profiles || profiles.length === 0) {
      try {
        const { error: insertError } = await getSupabaseClient()
          .from('user_profiles')
          .insert({
            auth_id: userId,
            email: session.user?.email || '',
            first_name: '',
            last_name: '',
            email_verified: !!session.user?.email_confirmed_at,
          });

        if (insertError) {
          // Check if it's an RLS error
          if (insertError.message?.includes('row-level security') || insertError.code === '42501') {
            console.warn('⚠️ RLS policy blocking profile creation. User may need to complete profile setup manually.');
          } else {
            console.error('Failed to create profile:', insertError);
          }
        }
      } catch (insertErr) {
        console.error('Error creating profile:', insertErr);
      }
      return null;
    }

    const profile = profiles[0];
    
    return {
      firstName: profile.first_name,
      lastName: profile.last_name,
      jobTitle: profile.job_title,
      company: profile.company,
      phone: profile.phone,
    };
  } catch (error) {
    console.error('❌ Error loading user profile:', error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Update user profile with name
 */
export async function updateUserProfile(
  firstName: string,
  lastName: string,
  jobTitle?: string,
  company?: string,
  phone?: string
): Promise<AuthResponse> {
  try {
    const {
      data: { user },
    } = await getSupabaseClient().auth.getUser();

    if (!user) {
      return {
        success: false,
        message: 'Not authenticated',
      };
    }

    // Update profile with all fields (use auth_id, not id)
    const { error } = await getSupabaseClient()
      .from('user_profiles')
      .update({
        first_name: firstName,
        last_name: lastName,
        ...(jobTitle && { job_title: jobTitle }),
        ...(company && { company: company }),
        ...(phone && { phone: phone }),
        updated_at: new Date().toISOString(),
      })
      .eq('auth_id', user.id);

    if (error) {
      console.error('Profile update error:', error);
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: true,
      message: 'Profile updated successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Profile update failed',
    };
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string): Promise<AuthResponse> {
  try {
    const { error } = await getSupabaseClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    });

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: true,
      message: 'Password reset email sent. Check your inbox.',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to send reset email',
    };
  }
}

/**
 * Update password (after reset)
 */
export async function updatePassword(newPassword: string): Promise<AuthResponse> {
  try {
    const { error } = await getSupabaseClient().auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: true,
      message: 'Password updated successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update password',
    };
  }
}

/**
 * Resend verification email
 */
export async function resendVerificationEmail(email: string): Promise<AuthResponse> {
  try {
    const { error } = await getSupabaseClient().auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email`,
      },
    });

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: true,
      message: 'Verification email sent. Check your inbox.',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to resend email',
    };
  }
}

/**
 * Listen to auth state changes
 * ISSUE 1.1 FIX: Profile loading moved to background (non-blocking)
 * ISSUE 1.3 FIX: Added mechanism to notify profile updates
 */
export function onAuthStateChange(
  callback: (user: AuthUser | null) => void,
  onProfileLoaded?: (profile: Partial<AuthUser>) => void
): (() => void) {
  const { data } = getSupabaseClient().auth.onAuthStateChange(async (_event: any, session: any) => {
    try {
      if (session?.user) {
        // Step 1: Return auth user immediately (Issue 1.1 fix)
        const user = await getCurrentUser();
        callback(user);

        // Step 2: Load profile in background without blocking (Issue 1.3 fix)
        if (user && onProfileLoaded) {
          const profile = await loadUserProfile(user.id);
          if (profile) {
            onProfileLoaded(profile);
          }
        }
      } else {
        callback(null);
      }
    } catch (error) {
      console.error('Error in onAuthStateChange:', error);
      callback(null);
    }
  });

  return () => {
    // Properly unsubscribe from auth listener
    data?.subscription?.unsubscribe?.();
  };
}

/**
 * Manually refresh user profile from the database
 * ISSUE 1.3 FIX: Now properly refreshes both auth state and profile data
 */
export async function refreshUserProfile(): Promise<AuthUser | null> {
  try {
    // Get fresh auth user
    const user = await getCurrentUser();
    if (!user) {
      return null;
    }

    // Get fresh profile data
    const profile = await loadUserProfile(user.id);
    
    // Merge auth user with profile data
    return {
      ...user,
      firstName: profile?.firstName,
      lastName: profile?.lastName,
      jobTitle: profile?.jobTitle,
      company: profile?.company,
      phone: profile?.phone,
    };
  } catch (error) {
    console.error('Error refreshing user profile:', error);
    return null;
  }
}
