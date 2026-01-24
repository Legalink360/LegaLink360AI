-- =============================================================================
-- MIGRATION 005: Create Backend Document Metadata Table
-- Description: Backend document ingestion and processing metadata
-- Date: January 2026
-- Status: APPLIED
-- =============================================================================

-- This table stores backend metadata for documents ingested into Pinecone
-- One document can have multiple chunks that are indexed as vectors

CREATE TABLE IF NOT EXISTS public.backend_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Document information
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_name VARCHAR(255),
  file_path VARCHAR(500),
  document_type VARCHAR(100),  -- 'contract', 'brief', 'case_law', policy', etc.
  source_url VARCHAR(500),
  
  -- File information
  file_size BIGINT,
  mime_type VARCHAR(100),
  
  -- Processing status
  status VARCHAR(50) DEFAULT 'pending',  -- pending, processing, indexed, failed
  processing_error TEXT,
  processing_started_at TIMESTAMP WITH TIME ZONE,
  processing_completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Vector indexing info
  total_chunks INT DEFAULT 0,
  indexed_chunks INT DEFAULT 0,
  vector_count INT DEFAULT 0,
  
  -- Pinecone reference
  pinecone_vector_ids TEXT[],  -- Array of all vector IDs for this document
  pinecone_index_name VARCHAR(100),
  
  -- Metadata for retrieval
  keywords TEXT[],
  summary TEXT,
  author VARCHAR(255),
  published_date DATE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_backend_documents_status 
  ON public.backend_documents(status);

CREATE INDEX IF NOT EXISTS idx_backend_documents_document_type 
  ON public.backend_documents(document_type);

CREATE INDEX IF NOT EXISTS idx_backend_documents_created_at 
  ON public.backend_documents(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_backend_documents_vector_count 
  ON public.backend_documents(vector_count);

CREATE INDEX IF NOT EXISTS idx_backend_documents_keywords 
  ON public.backend_documents USING GIN(keywords);

-- Enable Row Level Security (even though backend writes directly)
ALTER TABLE public.backend_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow backend service to write, users to read
-- Policy 1: Backend service can manage all documents
CREATE POLICY "Backend service can manage documents"
  ON public.backend_documents
  FOR ALL
  TO authenticated
  USING (TRUE);

-- Verification query
SELECT 'Migration 005 Applied: backend_documents table created' as migration_status;
