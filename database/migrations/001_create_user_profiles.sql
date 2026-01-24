-- =============================================================================
-- MIGRATION 001: Create User Profiles Table
-- Description: Frontend authentication - user profile management
-- Date: January 2026
-- Status: APPLIED
-- =============================================================================

-- Migration: Create user_profiles table with proper structure and RLS
-- This table stores user profile information linked to Supabase auth.users

-- Step 1: Create the user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  -- Primary key - references Supabase auth.users table
  auth_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- User profile fields
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  
  -- Additional fields
  job_title VARCHAR(100),
  company VARCHAR(100),
  phone VARCHAR(20),
  email_verified BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Step 2: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email 
  ON public.user_profiles(email);

CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at 
  ON public.user_profiles(created_at);

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

-- Policy 3: Authenticated users can INSERT their own profile
CREATE POLICY "Users can insert own profile"
  ON public.user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = auth_id);

-- Verification query
SELECT 'Migration 001 Applied: user_profiles table created' as migration_status;
