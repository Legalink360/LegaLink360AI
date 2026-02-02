-- =============================================================================
-- MIGRATION 003: Create Chat Threads Table
-- Description: Frontend chat history and conversation management
-- Date: February 2026 (Fresh Database)
-- Purpose: Store user chat threads and conversation history for the AI chat interface
-- =============================================================================

-- Create chat_threads table
CREATE TABLE IF NOT EXISTS public.chat_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User ownership
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Thread information
  title VARCHAR(255),
  topic VARCHAR(100),  -- 'contract_review', 'case_analysis', 'legal_research', etc.
  
  -- Referenced documents
  document_ids UUID[] DEFAULT '{}',  -- Array of document IDs used in this chat
  
  -- Conversation metadata
  message_count INT DEFAULT 0,
  last_message_text TEXT,
  
  -- Status and organization
  is_archived BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_message_at TIMESTAMP WITH TIME ZONE,
  archived_at TIMESTAMP WITH TIME ZONE
);

-- Step 2: Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_chat_threads_user_id 
  ON public.chat_threads(user_id);

CREATE INDEX IF NOT EXISTS idx_chat_threads_created_at 
  ON public.chat_threads(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_threads_last_message_at 
  ON public.chat_threads(last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_threads_is_archived 
  ON public.chat_threads(is_archived);

CREATE INDEX IF NOT EXISTS idx_chat_threads_user_created
  ON public.chat_threads(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_threads_is_pinned
  ON public.chat_threads(is_pinned);

-- Step 3: Enable Row Level Security
ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies
-- Policy 1: Users can view only their own chat threads
CREATE POLICY "Users can view own threads"
  ON public.chat_threads
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy 2: Users can insert their own chat threads
CREATE POLICY "Users can insert own threads"
  ON public.chat_threads
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy 3: Users can update their own chat threads
CREATE POLICY "Users can update own threads"
  ON public.chat_threads
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy 4: Users can delete their own chat threads
CREATE POLICY "Users can delete own threads"
  ON public.chat_threads
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Verification query
SELECT 'Migration 003 Applied: chat_threads table created with RLS' as migration_status;
