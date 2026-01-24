-- =============================================================================
-- MIGRATION 004: Create Chat Messages Table
-- Description: Frontend chat messages within threads
-- Date: January 2026
-- Status: APPLIED
-- =============================================================================

-- This table stores individual messages within chat threads

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Conversation reference
  thread_id UUID NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Message content
  role VARCHAR(20),  -- 'user' or 'assistant'
  content TEXT NOT NULL,
  
  -- Citation references
  referenced_documents UUID[] DEFAULT '{}',  -- Document IDs referenced in answer
  pinecone_vector_ids TEXT[] DEFAULT '{}',  -- Vector IDs retrieved for this query
  
  -- Response metadata
  response_time_ms INT,
  model_used VARCHAR(100),
  tokens_used INT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_thread_id 
  ON public.chat_messages(thread_id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id 
  ON public.chat_messages(user_id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at 
  ON public.chat_messages(created_at);

CREATE INDEX IF NOT EXISTS idx_chat_messages_role 
  ON public.chat_messages(role);

-- Enable Row Level Security
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Policy 1: Users can view only messages from their own threads
CREATE POLICY "Users can view own messages"
  ON public.chat_messages
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy 2: Users can insert messages to their own threads
CREATE POLICY "Users can insert own messages"
  ON public.chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy 3: Users can update their own messages
CREATE POLICY "Users can update own messages"
  ON public.chat_messages
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy 4: Users can delete their own messages
CREATE POLICY "Users can delete own messages"
  ON public.chat_messages
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Verification query
SELECT 'Migration 004 Applied: chat_messages table created' as migration_status;
