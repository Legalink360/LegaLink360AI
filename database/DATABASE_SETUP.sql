-- ============================================================================
-- COMPLETE DATABASE RESET AND SETUP
-- This creates a clean user_profiles table with correct structure and RLS
-- ============================================================================

-- Step 1: Drop existing tables
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Step 2: Create fresh user_profiles table with correct schema
CREATE TABLE user_profiles (
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

-- Step 3: Create indexes for better performance
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_created_at ON user_profiles(created_at);

-- Step 4: Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop any existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Allow public signup insert" ON user_profiles;
DROP POLICY IF EXISTS "Allow insert on signup" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Step 6: Create RLS policies with correct auth_id column
-- Policy 1: Authenticated users can READ their own profile
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_id);

-- Policy 2: Authenticated users can UPDATE their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_id)
  WITH CHECK (auth.uid() = auth_id);

-- Policy 3: Authenticated users can INSERT their own profile
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = auth_id);

-- Step 7: Verify the table and policies exist
SELECT 'User Profiles Table Created' as status;
SELECT COUNT(*) as policy_count FROM pg_policies WHERE tablename = 'user_profiles';

-- Step 8: Show all policies
SELECT policyname, roles, qual 
FROM pg_policies 
WHERE tablename = 'user_profiles' 
ORDER BY policyname;

-- Step 9: Verify table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;
