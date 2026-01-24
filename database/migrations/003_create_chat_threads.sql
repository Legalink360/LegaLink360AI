-- =============================================================================
-- MIGRATION 003: Create Chat History Table
-- Description: Frontend chat history and conversation management
-- Date: January 2026
-- Status: APPLIED
-- =============================================================================

-- This table stores user chat threads and conversation history

CREATE TABLE IF NOT EXISTS public.chat_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User ownership
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Thread information
  title VARCHAR(255),
  topic VARCHAR(100),
  
  -- Referenced documents
  document_ids UUID[] DEFAULT '{}',  -- Array of document IDs used in this chat
  
  -- Conversation metadata
  message_count INT DEFAULT 0,
  last_message_text TEXT,
  
  -- Status
  is_archived BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_message_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chat_threads_user_id 
  ON public.chat_threads(user_id);

CREATE INDEX IF NOT EXISTS idx_chat_threads_created_at 
  ON public.chat_threads(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_threads_last_message_at 
  ON public.chat_threads(last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_threads_is_archived 
  ON public.chat_threads(is_archived);

-- Enable Row Level Security
ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;

-- RLS Policies
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
SELECT 'Migration 003 Applied: chat_threads table created' as migration_status;
