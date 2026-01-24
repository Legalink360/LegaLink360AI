-- =============================================================================
-- MIGRATION 008: Create Query Logs Table
-- Description: Backend RAG query tracking and performance monitoring
-- Date: January 2026
-- Status: APPLIED
-- =============================================================================

-- This table logs all semantic search and RAG queries for monitoring and optimization

CREATE TABLE IF NOT EXISTS public.query_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User and chat context
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  chat_message_id UUID,  -- Reference to the chat message that triggered this query
  
  -- Query information
  query_text TEXT NOT NULL,
  query_embedding_model VARCHAR(100),
  
  -- Retrieval information
  documents_requested INT,  -- How many top documents to retrieve
  documents_returned INT,  -- How many documents actually returned
  
  -- Document references
  retrieved_document_ids UUID[],  -- IDs of documents in the retrieval result
  retrieved_chunk_ids UUID[],  -- IDs of chunks from document_chunks table
  pinecone_vector_ids VARCHAR(255)[],  -- IDs of vectors from Pinecone
  
  -- Relevance scores
  min_similarity_score DECIMAL(4, 3),  -- Lowest relevance score
  max_similarity_score DECIMAL(4, 3),  -- Highest relevance score
  avg_similarity_score DECIMAL(4, 3),  -- Average relevance score
  
  -- LLM response
  llm_model VARCHAR(100),  -- 'gpt-4-turbo', etc.
  llm_tokens_input INT,
  llm_tokens_output INT,
  llm_response_time_ms INT,
  
  -- Quality metrics
  response_was_helpful BOOLEAN,  -- User feedback
  user_feedback TEXT,
  
  -- Cost tracking
  embedding_cost_usd DECIMAL(10, 6),
  llm_cost_usd DECIMAL(10, 6),
  total_cost_usd DECIMAL(10, 6),
  
  -- Performance metrics
  total_latency_ms INT,
  retrieval_latency_ms INT,
  embedding_latency_ms INT,
  
  -- Status and errors
  status VARCHAR(50),  -- 'success', 'partial', 'failed'
  error_message TEXT,
  
  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for analysis and monitoring
CREATE INDEX IF NOT EXISTS idx_query_logs_user_id 
  ON public.query_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_query_logs_created_at 
  ON public.query_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_query_logs_status 
  ON public.query_logs(status);

CREATE INDEX IF NOT EXISTS idx_query_logs_documents_returned 
  ON public.query_logs(documents_returned);

CREATE INDEX IF NOT EXISTS idx_query_logs_similarity_score 
  ON public.query_logs(avg_similarity_score DESC);

CREATE INDEX IF NOT EXISTS idx_query_logs_cost 
  ON public.query_logs(total_cost_usd DESC);

CREATE INDEX IF NOT EXISTS idx_query_logs_latency 
  ON public.query_logs(total_latency_ms DESC);

-- Enable Row Level Security
ALTER TABLE public.query_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Policy 1: Users can view only their own query logs
CREATE POLICY "Users can view own query logs"
  ON public.query_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy 2: Backend can insert query logs
CREATE POLICY "Backend can insert query logs"
  ON public.query_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

-- Verification query
SELECT 'Migration 008 Applied: query_logs table created' as migration_status;
