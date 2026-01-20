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

// Lazy-load Supabase client to avoid errors during build
let supabase: any = null;

function getSupabaseClient() {
  if (supabase) {
    return supabase;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  supabase = createClient(supabaseUrl, supabaseAnonKey);
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

    // Create user profile in custom table
    const { error: profileError } = await getSupabaseClient().from('user_profiles').insert({
      id: data.user.id,
      email: data.user.email,
      first_name: firstName,
      last_name: lastName,
      email_verified: false,
    });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Continue anyway - user can still use auth
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
    const { data, error } = await getSupabaseClient().auth.signInWithPassword({
      email,
      password,
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

    // Try to fetch user profile in the background (don't block login)
    // Profile will be loaded via onAuthStateChange hook
    Promise.resolve()
      .then(() => {
        return supabase
          .from('user_profiles')
          .select('*')
          .eq('id', data.user.id);
      })
      .then(({ data: profileData, error: profileError }) => {
        if (profileError) {
          console.warn('Background profile fetch error:', profileError);
        } else if (profileData && profileData.length > 0) {
          console.log('Background profile fetch successful');
        }
      })
      .catch((err) => {
        console.warn('Background profile fetch exception:', err);
      });

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
 */
export async function signOut(): Promise<AuthResponse> {
  try {
    const { error } = await getSupabaseClient().auth.signOut();

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: true,
      message: 'Logged out successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Logout failed',
    };
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const {
      data: { user },
      error,
    } = await getSupabaseClient().auth.getUser();

    if (error || !user) {
      return null;
    }

    // Try to fetch profile data by id, but don't block if it fails (RLS may restrict access)
    let profile: any = null;
    try {
      const { data: profileData, error: profileError } = await getSupabaseClient()
        .from('user_profiles')
        .select('*')
        .eq('id', user.id);

      if (profileError) {
        console.warn('Profile fetch warning (non-blocking):', profileError.message);
      } else if (profileData && profileData.length > 0) {
        profile = profileData[0];
      }
    } catch (profileErr) {
      console.warn('Profile fetch exception (non-blocking):', profileErr);
    }

    // Always return user data, with or without profile
    return {
      id: user.id,
      email: user.email || '',
      firstName: profile?.first_name,
      lastName: profile?.last_name,
      emailVerified: !!user.email_confirmed_at,
      createdAt: new Date(user.created_at || ''),
    };
  } catch {
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

    // Update profile with all fields
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
      .eq('id', user.id);

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
 */
export function onAuthStateChange(callback: (user: AuthUser | null) => void): (() => void) {
  const subscription = getSupabaseClient().auth.onAuthStateChange(async (_event: any, session: any) => {
    try {
      if (session?.user) {
        const user = await getCurrentUser();
        callback(user);
      } else {
        callback(null);
      }
    } catch (error) {
      console.error('Error in onAuthStateChange:', error);
      callback(null);
    }
  });

  return () => {
    subscription.data?.subscription?.unsubscribe();
  };
}

/**
 * Manually refresh user profile from the database
 */
export async function refreshUserProfile(): Promise<AuthUser | null> {
  try {
    const user = await getCurrentUser();
    return user;
  } catch (error) {
    console.error('Error refreshing user profile:', error);
    return null;
  }
}
