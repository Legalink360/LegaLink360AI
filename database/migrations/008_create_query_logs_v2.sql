-- =============================================================================
-- MIGRATION 008: Create Query Logs Table
-- Description: Backend RAG query tracking and performance monitoring
-- Date: February 2026 (Fresh Database)
-- Purpose: Log all semantic search and RAG queries for monitoring and optimization
-- =============================================================================

-- Create query_logs table
CREATE TABLE IF NOT EXISTS public.query_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User and chat context
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  chat_message_id UUID,  -- Reference to the chat message that triggered this query
  thread_id UUID REFERENCES public.chat_threads(id) ON DELETE SET NULL,
  
  -- Query information
  query_text TEXT NOT NULL,
  query_embedding_model VARCHAR(100),
  query_length_chars INT,
  query_length_tokens INT,
  
  -- Retrieval configuration
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
  
  -- LLM response information
  llm_model VARCHAR(100),  -- 'gpt-4', 'gpt-4-turbo', etc.
  llm_tokens_input INT,
  llm_tokens_output INT,
  llm_response_time_ms INT,
  llm_response_text TEXT,  -- Full response for analysis
  
  -- Quality metrics and feedback
  response_was_helpful BOOLEAN,  -- User feedback on response helpfulness
  response_was_accurate BOOLEAN,  -- User feedback on accuracy
  response_was_complete BOOLEAN,  -- User feedback on completeness
  user_feedback TEXT,  -- Free-form user feedback
  user_rating INT,  -- 1-5 star rating if provided
  
  -- Cost tracking
  embedding_cost_usd DECIMAL(10, 6),
  llm_cost_usd DECIMAL(10, 6),
  total_cost_usd DECIMAL(10, 6),
  
  -- Performance metrics
  total_latency_ms INT,  -- Total time from query to response
  retrieval_latency_ms INT,  -- Time to retrieve documents
  embedding_latency_ms INT,  -- Time to generate embedding
  llm_latency_ms INT,  -- Time for LLM to generate response
  
  -- Status and error handling
  status VARCHAR(50),  -- 'success', 'partial', 'failed', 'timeout'
  error_message TEXT,
  error_code VARCHAR(50),
  
  -- Query classification
  query_category VARCHAR(100),  -- 'case_analysis', 'contract_review', 'legal_research', etc.
  query_intent VARCHAR(100),  -- 'research', 'summarization', 'analysis', etc.
  
  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Step 2: Create indexes for analysis and monitoring
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

CREATE INDEX IF NOT EXISTS idx_query_logs_response_was_helpful
  ON public.query_logs(response_was_helpful) WHERE response_was_helpful IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_query_logs_thread_id
  ON public.query_logs(thread_id);

CREATE INDEX IF NOT EXISTS idx_query_logs_llm_model
  ON public.query_logs(llm_model);

CREATE INDEX IF NOT EXISTS idx_query_logs_query_category
  ON public.query_logs(query_category);

CREATE INDEX IF NOT EXISTS idx_query_logs_cost
  ON public.query_logs(total_cost_usd DESC);

-- Step 3: Enable Row Level Security
ALTER TABLE public.query_logs ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies
-- Policy 1: Users can view only their own query logs
CREATE POLICY "Users can view own query logs"
  ON public.query_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL);

-- Policy 2: Backend can insert query logs
CREATE POLICY "Authenticated can insert query logs"
  ON public.query_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

-- Policy 3: Backend can update query logs (for feedback)
CREATE POLICY "Authenticated can update query logs"
  ON public.query_logs
  FOR UPDATE
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- Verification query
SELECT 'Migration 008 Applied: query_logs table created with RLS' as migration_status;
