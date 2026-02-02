-- =============================================================================
-- MIGRATION 001: Create User Profiles Table
-- Description: Frontend authentication - user profile management
-- Date: February 2026 (Fresh Database)
-- Purpose: Store user profile information linked to Supabase auth.users
-- =============================================================================

-- Step 1: Create the user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  -- Primary key - references Supabase auth.users table
  auth_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- User profile fields
  email VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  
  -- Professional information
  job_title VARCHAR(100),
  company VARCHAR(100),
  phone VARCHAR(20),
  
  -- Account status
  email_verified BOOLEAN DEFAULT FALSE,
  account_status VARCHAR(50) DEFAULT 'active',  -- 'active', 'suspended', 'deleted'
  
  -- Preferences
  preferred_language VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(50),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_login_at TIMESTAMP WITH TIME ZONE
);

-- Step 2: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email 
  ON public.user_profiles(email);

CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at 
  ON public.user_profiles(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_profiles_account_status
  ON public.user_profiles(account_status);

-- Step 3: Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies
-- Policy 1: Authenticated users can READ their own profile
CREATE POLICY "Users can read own profile"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_id);

-- Policy 2: Authenticated users can UPDATE their own profile
CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_id)
  WITH CHECK (auth.uid() = auth_id);

-- Policy 3: New users can INSERT their profile on signup
CREATE POLICY "Users can insert own profile"
  ON public.user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = auth_id);

-- Policy 4: Users can DELETE their own profile
CREATE POLICY "Users can delete own profile"
  ON public.user_profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = auth_id);

-- Verification query
SELECT 'Migration 001 Applied: user_profiles table created with RLS' as migration_status;
