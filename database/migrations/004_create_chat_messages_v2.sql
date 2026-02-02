-- =============================================================================
-- MIGRATION 004: Create Chat Messages Table
-- Description: Frontend chat messages within threads
-- Date: February 2026 (Fresh Database)
-- Purpose: Store individual messages within chat threads for conversation history
-- =============================================================================

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Conversation reference
  thread_id UUID NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Message content
  role VARCHAR(20) NOT NULL,  -- 'user' or 'assistant'
  content TEXT NOT NULL,
  
  -- For markdown/formatted content
  formatted_content TEXT,
  
  -- Citation and reference tracking
  referenced_documents UUID[] DEFAULT '{}',  -- Document IDs referenced in answer
  pinecone_vector_ids VARCHAR(255)[] DEFAULT '{}',  -- Vector IDs retrieved for this query
  
  -- Response metadata (for assistant messages)
  response_time_ms INT,
  model_used VARCHAR(100),  -- 'gpt-4', 'gpt-4-turbo', etc.
  tokens_used INT,
  tokens_input INT,
  tokens_output INT,
  
  -- Quality feedback
  is_helpful BOOLEAN,
  user_feedback TEXT,
  
  -- Status
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Step 2: Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_chat_messages_thread_id 
  ON public.chat_messages(thread_id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id 
  ON public.chat_messages(user_id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at 
  ON public.chat_messages(created_at);

CREATE INDEX IF NOT EXISTS idx_chat_messages_role 
  ON public.chat_messages(role);

CREATE INDEX IF NOT EXISTS idx_chat_messages_thread_created
  ON public.chat_messages(thread_id, created_at);

CREATE INDEX IF NOT EXISTS idx_chat_messages_is_helpful
  ON public.chat_messages(is_helpful) WHERE is_helpful IS NOT NULL;

-- Step 3: Enable Row Level Security
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies
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
SELECT 'Migration 004 Applied: chat_messages table created with RLS' as migration_status;
