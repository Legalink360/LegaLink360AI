-- =============================================================================
-- MIGRATION 006: Create Document Chunks Table
-- Description: Backend document chunking for vector embeddings
-- Date: January 2026
-- Status: APPLIED
-- =============================================================================

-- This table stores individual chunks of documents
-- Each chunk is converted to a vector embedding and stored in Pinecone

CREATE TABLE IF NOT EXISTS public.document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Document reference
  document_id UUID NOT NULL REFERENCES public.backend_documents(id) ON DELETE CASCADE,
  
  -- Chunk information
  chunk_index INT NOT NULL,  -- Sequential chunk number
  content TEXT NOT NULL,  -- The actual text content of the chunk
  
  -- Vector reference
  pinecone_vector_id VARCHAR(255) UNIQUE,  -- ID in Pinecone vector DB
  embedding_model VARCHAR(100),  -- 'text-embedding-3-large', etc.
  embedding_dimensions INT DEFAULT 3072,
  
  -- Metadata for retrieval
  char_count INT,
  token_count INT,
  
  -- Search metadata
  keywords TEXT[],
  summary TEXT,
  
  -- Relevance tracking
  retrieval_count INT DEFAULT 0,
  last_retrieved_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for efficient querying
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

-- Enable Row Level Security
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Policy 1: Backend service and authenticated users can read chunks
CREATE POLICY "Users and backend can read chunks"
  ON public.document_chunks
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- Policy 2: Backend service can insert chunks
CREATE POLICY "Backend can insert chunks"
  ON public.document_chunks
  FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

-- Policy 3: Backend service can update chunks
CREATE POLICY "Backend can update chunks"
  ON public.document_chunks
  FOR UPDATE
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- Verification query
SELECT 'Migration 006 Applied: document_chunks table created' as migration_status;
