/**
 * Session Configuration
 * 
 * Centralized configuration for the 7-day session strategy
 * Eliminates aggressive timeouts and logout on network issues
 * 
 * Features:
 * - Extended timeouts (60s, 30s, 15s)
 * - No logout on timeout
 * - Retry logic (3 attempts)
 * - Activity-based token refresh
 * - Session caching for offline support
 */

export const SESSION_CONFIG = {
  // ============================================================================
  // TIMEOUT CONFIGURATION (Increased from 15s, 20s, 8s)
  // ============================================================================
  timeouts: {
    // Maximum time to wait for auth initialization
    INIT_AUTH: 60 * 1000,           // 60 seconds (was 15s)
    
    // Maximum time to fetch current user
    GET_CURRENT_USER: 30 * 1000,    // 30 seconds (was 20s)
    
    // Maximum time to load user profile
    LOAD_USER_PROFILE: 15 * 1000,   // 15 seconds (was 8s)
    
    // Maximum time for sign out operation
    SIGN_OUT: 10 * 1000,            // 10 seconds
  },

  // ============================================================================
  // TIMEOUT BEHAVIOR (KEY CHANGES - Never logout on timeout)
  // ============================================================================
  onTimeout: {
    // CRITICAL: Do NOT logout when timeout occurs
    // Just retry the operation instead
    LOGOUT: false,                  // ← Changed from true
    
    // Show warning to user about connectivity
    SHOW_WARNING: true,
    
    // Automatically retry failed operations
    RETRY: true,
    
    // How many times to retry before giving up
    MAX_RETRIES: 3,
    
    // Delay between retry attempts
    RETRY_DELAY: 2000,              // 2 seconds
  },

  // ============================================================================
  // TOKEN REFRESH CONFIGURATION (Activity-based instead of interval)
  // ============================================================================
  refresh: {
    // Enable automatic token refresh
    ENABLED: true,
    
    // Refresh interval when activity-based refresh is OFF
    // (Set to 6 days instead of 50 minutes)
    INTERVAL: 6 * 24 * 60 * 60 * 1000, // 6 days
    
    // Use activity-based refresh (refresh only when user interacts)
    ACTIVITY_BASED: true,
    
    // Only refresh if within this time before token expiry
    // (1 day before 7-day token expires)
    BUFFER_TIME: 24 * 60 * 60 * 1000,   // 1 day
    
    // Debounce time for activity-based refresh
    // (Wait this long after activity before attempting refresh)
    DEBOUNCE_TIME: 500,                 // 500ms
  },

  // ============================================================================
  // SESSION PERSISTENCE (Cache session data locally)
  // ============================================================================
  persistence: {
    // Store session in localStorage
    ENABLED: true,
    
    // Cache user profile data for faster startup
    CACHE_USER_DATA: true,
    
    // Cache chat threads for faster app load
    CACHE_THREADS: true,
    
    // Validate cached session with server on startup
    VALIDATE_ON_STARTUP: true,
    
    // How long to consider cache "fresh" (30 minutes)
    CACHE_TTL: 30 * 60 * 1000,
  },

  // ============================================================================
  // SESSION LIFETIME
  // ============================================================================
  session: {
    // JWT Token expiry (7 days)
    // This must be set in Supabase: Auth Settings → JWT Expiry
    TOKEN_EXPIRY_SECONDS: 7 * 24 * 60 * 60, // 604800 seconds
    
    // Refresh token expiry (30 days)
    // Set in Supabase: Auth Settings → Refresh Token Expiry
    REFRESH_TOKEN_EXPIRY_SECONDS: 30 * 24 * 60 * 60,
    
    // Logout inactive users after X days
    // Set to null to disable (keep users logged in forever)
    INACTIVITY_LOGOUT_DAYS: null,   // null = disabled (keep logged in)
  },

  // ============================================================================
  // ERROR HANDLING & MESSAGES
  // ============================================================================
  messages: {
    TIMEOUT: 'Connection slow - app will keep trying',
    REFRESH_FAILED: 'Connection issue - will retry automatically',
    OFFLINE: 'You appear to be offline - using cached data',
    SESSION_EXPIRED: 'Your session expired. Please login again.',
  },
};

// ============================================================================
// VALIDATION: Ensure Supabase is configured correctly
// ============================================================================
export function validateSessionConfig(): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if environment variables are set
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL not set');
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY not set');
  }

  // Warnings
  if (SESSION_CONFIG.onTimeout.LOGOUT === true) {
    warnings.push('⚠️ LOGOUT_ON_TIMEOUT is enabled - users will be logged out on network issues');
  }

  if (SESSION_CONFIG.refresh.ACTIVITY_BASED === false) {
    warnings.push('⚠️ Activity-based refresh is disabled - using interval-based refresh');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// Log configuration on app start
if (typeof window !== 'undefined') {
  const validation = validateSessionConfig();
  
  if (!validation.valid) {
    console.error('❌ Session configuration errors:', validation.errors);
  }
  
  if (validation.warnings.length > 0) {
    console.warn('⚠️ Session configuration warnings:', validation.warnings);
  }
  
  if (validation.valid && validation.warnings.length === 0) {
    console.log('✅ Session configuration valid');
    console.log('📋 Configuration:', {
      tokenTimeout: `${SESSION_CONFIG.timeouts.GET_CURRENT_USER / 1000}s`,
      activityBased: SESSION_CONFIG.refresh.ACTIVITY_BASED ? 'Yes' : 'No',
      caching: SESSION_CONFIG.persistence.ENABLED ? 'Enabled' : 'Disabled',
      maxRetries: SESSION_CONFIG.onTimeout.MAX_RETRIES,
    });
  }
}

export default SESSION_CONFIG;
