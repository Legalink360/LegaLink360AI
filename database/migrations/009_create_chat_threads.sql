-- Migration: Create chat_threads table for persistent chat history
-- Date: 2026-02-03
-- Description: Creates the main table for storing user chat threads/conversations

-- ============================================================================
-- DROP EXISTING TABLE IF EXISTS (for clean migration)
-- ============================================================================
DROP TABLE IF EXISTS public.chat_threads CASCADE;

-- ============================================================================
-- CREATE CHAT_THREADS TABLE
-- ============================================================================
CREATE TABLE public.chat_threads (
  -- Primary and Foreign Keys
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Thread Metadata
  title TEXT NOT NULL DEFAULT 'New Chat',
  topic TEXT,
  document_ids TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Message Tracking
  message_count INTEGER NOT NULL DEFAULT 0,
  last_message_text TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE,

  -- State
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  archived_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_message_count CHECK (message_count >= 0),
  CONSTRAINT valid_title_length CHECK (char_length(title) > 0 AND char_length(title) <= 500),
  CONSTRAINT valid_last_message_length CHECK (last_message_text IS NULL OR char_length(last_message_text) <= 1000)
);

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for common query: Get all non-archived threads for user, sorted by recent
CREATE INDEX idx_chat_threads_user_recent 
  ON public.chat_threads(user_id, is_archived, last_message_at DESC NULLS LAST);

-- Index for finding pinned threads
CREATE INDEX idx_chat_threads_user_pinned 
  ON public.chat_threads(user_id, is_pinned DESC);

-- Index for archive cleanup queries
CREATE INDEX idx_chat_threads_archived_at 
  ON public.chat_threads(archived_at) 
  WHERE is_archived = TRUE;

-- Index for searching by created_at
CREATE INDEX idx_chat_threads_created_at 
  ON public.chat_threads(user_id, created_at DESC);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CREATE RLS POLICIES
-- ============================================================================

-- Policy: Users can view their own threads
CREATE POLICY "Users can view their own threads"
  ON public.chat_threads
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert (create) their own threads
CREATE POLICY "Users can create their own threads"
  ON public.chat_threads
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own threads
CREATE POLICY "Users can update their own threads"
  ON public.chat_threads
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own threads
CREATE POLICY "Users can delete their own threads"
  ON public.chat_threads
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON TABLE public.chat_threads IS 'Stores user chat threads/conversations with metadata';
COMMENT ON COLUMN public.chat_threads.id IS 'Unique identifier for the thread';
COMMENT ON COLUMN public.chat_threads.user_id IS 'User who owns this thread';
COMMENT ON COLUMN public.chat_threads.title IS 'Display name of the thread';
COMMENT ON COLUMN public.chat_threads.topic IS 'Category or topic of the conversation (e.g., criminal-law, contract-law)';
COMMENT ON COLUMN public.chat_threads.document_ids IS 'Array of document IDs referenced in this thread';
COMMENT ON COLUMN public.chat_threads.message_count IS 'Total number of messages in this thread';
COMMENT ON COLUMN public.chat_threads.last_message_text IS 'Preview of the last message (first 100 chars)';
COMMENT ON COLUMN public.chat_threads.last_message_at IS 'Timestamp of the last message';
COMMENT ON COLUMN public.chat_threads.is_archived IS 'Whether thread is archived (soft delete)';
COMMENT ON COLUMN public.chat_threads.is_pinned IS 'Whether thread is pinned to the top';
COMMENT ON COLUMN public.chat_threads.archived_at IS 'Timestamp when thread was archived';
COMMENT ON COLUMN public.chat_threads.created_at IS 'When thread was created';
COMMENT ON COLUMN public.chat_threads.updated_at IS 'Last update timestamp';

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================
-- Allow authenticated users to perform operations on their own data
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_threads TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
