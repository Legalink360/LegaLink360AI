-- Migration: Create chat_messages table for storing individual messages
-- Date: 2026-02-03
-- Description: Stores individual messages within chat threads for full history

-- ============================================================================
-- DROP EXISTING TABLE IF EXISTS (for clean migration)
-- ============================================================================
DROP TABLE IF EXISTS public.chat_messages CASCADE;

-- ============================================================================
-- CREATE CHAT_MESSAGES TABLE
-- ============================================================================
CREATE TABLE public.chat_messages (
  -- Primary and Foreign Keys
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Message Content
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,

  -- Message Metadata
  tokens_used INTEGER,
  model_used TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_content_length CHECK (char_length(content) > 0),
  CONSTRAINT valid_tokens CHECK (tokens_used IS NULL OR tokens_used > 0)
);

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for fetching messages in a thread
CREATE INDEX idx_chat_messages_thread_id 
  ON public.chat_messages(thread_id, created_at ASC);

-- Index for user queries
CREATE INDEX idx_chat_messages_user_id 
  ON public.chat_messages(user_id, created_at DESC);

-- Index for finding messages by role
CREATE INDEX idx_chat_messages_role 
  ON public.chat_messages(thread_id, role);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CREATE RLS POLICIES
-- ============================================================================

-- Policy: Users can view messages from their own threads
CREATE POLICY "Users can view their own messages"
  ON public.chat_messages
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert messages to their threads
CREATE POLICY "Users can add messages to their threads"
  ON public.chat_messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.chat_threads 
      WHERE id = thread_id AND user_id = auth.uid()
    )
  );

-- Policy: Users can update their own messages
CREATE POLICY "Users can update their own messages"
  ON public.chat_messages
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own messages
CREATE POLICY "Users can delete their own messages"
  ON public.chat_messages
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- CREATE TRIGGER TO UPDATE THREAD UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_thread_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.chat_threads
  SET 
    message_count = message_count + 1,
    last_message_text = SUBSTRING(NEW.content, 1, 100),
    last_message_at = NEW.created_at,
    updated_at = NOW()
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_thread_on_message
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_thread_on_message();

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON TABLE public.chat_messages IS 'Stores individual messages within chat threads';
COMMENT ON COLUMN public.chat_messages.id IS 'Unique identifier for the message';
COMMENT ON COLUMN public.chat_messages.thread_id IS 'Reference to the parent chat thread';
COMMENT ON COLUMN public.chat_messages.user_id IS 'User who owns the thread';
COMMENT ON COLUMN public.chat_messages.role IS 'Message sender role: user, assistant, or system';
COMMENT ON COLUMN public.chat_messages.content IS 'Message text content';
COMMENT ON COLUMN public.chat_messages.tokens_used IS 'Number of tokens used (for billing/analytics)';
COMMENT ON COLUMN public.chat_messages.model_used IS 'AI model used to generate assistant response';
COMMENT ON COLUMN public.chat_messages.metadata IS 'Additional JSON metadata (e.g., citations, confidence)';
COMMENT ON COLUMN public.chat_messages.created_at IS 'When message was created';
COMMENT ON COLUMN public.chat_messages.updated_at IS 'Last update timestamp (usually not updated)';

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_messages TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
