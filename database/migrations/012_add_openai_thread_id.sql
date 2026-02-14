-- =============================================================================
-- MIGRATION 012: Add OpenAI Thread ID to Chat Threads
-- Description: Store OpenAI thread IDs alongside local thread UUIDs
-- Date: February 14, 2026
-- Purpose: Fix chat selection bug by using OpenAI-managed thread IDs
-- =============================================================================

-- Add openai_thread_id column to chat_threads table
ALTER TABLE IF EXISTS public.chat_threads
ADD COLUMN IF NOT EXISTS openai_thread_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS openai_session_id VARCHAR(255);

-- Create unique index on openai_thread_id to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_chat_threads_openai_thread_id 
  ON public.chat_threads(openai_thread_id) 
  WHERE openai_thread_id IS NOT NULL;

-- Create index for user lookup by OpenAI thread ID
CREATE INDEX IF NOT EXISTS idx_chat_threads_user_openai 
  ON public.chat_threads(user_id, openai_thread_id)
  WHERE openai_thread_id IS NOT NULL;

-- Add comment to document the purpose
COMMENT ON COLUMN public.chat_threads.openai_thread_id IS 'OpenAI thread ID for use with ChatKit library';
COMMENT ON COLUMN public.chat_threads.openai_session_id IS 'OpenAI session ID from ChatKit initialization';
