-- =============================================================================
-- MIGRATION 006: Create Document Chunks Table
-- Description: Backend document chunking for vector embeddings
-- Date: February 2026 (Fresh Database)
-- Purpose: Store individual chunks of documents for vector embeddings and retrieval
-- =============================================================================

-- Create document_chunks table
CREATE TABLE IF NOT EXISTS public.document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Document reference
  document_id UUID NOT NULL REFERENCES public.backend_documents(id) ON DELETE CASCADE,
  
  -- Chunk information
  chunk_index INT NOT NULL,  -- Sequential chunk number within document
  content TEXT NOT NULL,  -- The actual text content of the chunk
  
  -- Vector reference
  pinecone_vector_id VARCHAR(255) UNIQUE,  -- ID in Pinecone vector DB
  embedding_model VARCHAR(100),  -- 'text-embedding-3-large', etc.
  embedding_dimensions INT DEFAULT 3072,
  
  -- Metadata for retrieval
  char_count INT,
  token_count INT,
  
  -- Search metadata
  keywords VARCHAR(255)[] DEFAULT '{}',
  summary TEXT,
  
  -- Position information
  page_number INT,  -- For documents with page information
  section_title VARCHAR(255),  -- Section or heading this chunk belongs to
  
  -- Relevance and usage tracking
  retrieval_count INT DEFAULT 0,  -- How many times this chunk was returned in search results
  last_retrieved_at TIMESTAMP WITH TIME ZONE,
  relevance_score DECIMAL(4, 3),  -- Average relevance score from retrievals
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Step 2: Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id 
  ON public.document_chunks(document_id);

CREATE INDEX IF NOT EXISTS idx_document_chunks_pinecone_vector_id 
  ON public.document_chunks(pinecone_vector_id);

CREATE INDEX IF NOT EXISTS idx_document_chunks_chunk_index 
  ON public.document_chunks(document_id, chunk_index);

CREATE INDEX IF NOT EXISTS idx_document_chunks_created_at 
  ON public.document_chunks(created_at);

CREATE INDEX IF NOT EXISTS idx_document_chunks_keywords 
  ON public.document_chunks USING GIN(keywords);

CREATE INDEX IF NOT EXISTS idx_document_chunks_retrieval_count
  ON public.document_chunks(retrieval_count DESC);

CREATE INDEX IF NOT EXISTS idx_document_chunks_relevance_score
  ON public.document_chunks(relevance_score DESC);

-- Step 3: Enable Row Level Security
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies
-- Policy 1: All authenticated users can read chunks (for RAG retrieval)
CREATE POLICY "All authenticated can read chunks"
  ON public.document_chunks
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- Policy 2: Backend service (authenticated) can insert chunks
CREATE POLICY "Authenticated can insert chunks"
  ON public.document_chunks
  FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

-- Policy 3: Authenticated can update chunks (for usage tracking)
CREATE POLICY "Authenticated can update chunks"
  ON public.document_chunks
  FOR UPDATE
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- Verification query
SELECT 'Migration 006 Applied: document_chunks table created with RLS' as migration_status;
