-- =============================================================================
-- MIGRATION 009: Create User Preferences Table
-- Description: User settings and preferences storage
-- Date: February 2026 (Fresh Database)
-- Purpose: Store user preferences for notifications, UI, and feature flags
-- =============================================================================

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User reference
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- UI/Display preferences
  theme VARCHAR(50) DEFAULT 'light',  -- 'light', 'dark', 'auto'
  language VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(50) DEFAULT 'UTC',
  
  -- Notification preferences
  email_notifications_enabled BOOLEAN DEFAULT TRUE,
  email_digest_frequency VARCHAR(50) DEFAULT 'weekly',  -- 'daily', 'weekly', 'monthly', 'never'
  notifications_on_document_ready BOOLEAN DEFAULT TRUE,
  notifications_on_query_complete BOOLEAN DEFAULT TRUE,
  
  -- Feature preferences
  auto_save_drafts BOOLEAN DEFAULT TRUE,
  show_tutorial BOOLEAN DEFAULT TRUE,
  beta_features_enabled BOOLEAN DEFAULT FALSE,
  
  -- Privacy preferences
  allow_analytics BOOLEAN DEFAULT TRUE,
  allow_usage_tracking BOOLEAN DEFAULT TRUE,
  allow_error_reporting BOOLEAN DEFAULT TRUE,
  
  -- Search and filter preferences
  default_search_results_count INT DEFAULT 5,
  minimum_relevance_score DECIMAL(4, 3) DEFAULT 0.5,
  
  -- Preferences data as JSONB for flexibility
  custom_preferences JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Step 2: Create indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id 
  ON public.user_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_user_preferences_theme
  ON public.user_preferences(theme);

-- Step 3: Enable Row Level Security
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies
-- Policy 1: Users can view only their own preferences
CREATE POLICY "Users can view own preferences"
  ON public.user_preferences
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy 2: Users can update their own preferences
CREATE POLICY "Users can update own preferences"
  ON public.user_preferences
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy 3: Users can insert their own preferences
CREATE POLICY "Users can insert own preferences"
  ON public.user_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Verification query
SELECT 'Migration 009 Applied: user_preferences table created with RLS' as migration_status;
