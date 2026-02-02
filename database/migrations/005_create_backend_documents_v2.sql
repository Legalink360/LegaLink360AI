-- =============================================================================
-- MIGRATION 005: Create Backend Documents Table
-- Description: Backend document ingestion and processing metadata
-- Date: February 2026 (Fresh Database)
-- Purpose: Store backend metadata for documents ingested into Pinecone
-- =============================================================================

-- Create backend_documents table
CREATE TABLE IF NOT EXISTS public.backend_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Document information
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_name VARCHAR(255),
  file_path VARCHAR(500),
  document_type VARCHAR(100),  -- 'statute', 'case_law', 'contract', 'policy', 'template', etc.
  source_url VARCHAR(500),
  
  -- File information
  file_size BIGINT,
  mime_type VARCHAR(100),
  
  -- Document metadata for legal context
  jurisdiction VARCHAR(100)[],  -- ['Uganda', 'Federal'] etc.
  practice_areas VARCHAR(100)[],  -- ['Contract Law', 'Tax Law'] etc.
  authority_level VARCHAR(50),  -- 'authoritative', 'secondary', 'tertiary'
  author VARCHAR(255),
  published_date DATE,
  updated_date DATE,
  
  -- Processing status
  status VARCHAR(50) DEFAULT 'pending',  -- pending, processing, indexed, failed, archived
  processing_error TEXT,
  processing_started_at TIMESTAMP WITH TIME ZONE,
  processing_completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Vector indexing information
  total_chunks INT DEFAULT 0,
  indexed_chunks INT DEFAULT 0,
  vector_count INT DEFAULT 0,
  
  -- Pinecone reference
  pinecone_vector_ids VARCHAR(255)[] DEFAULT '{}',  -- Array of all vector IDs for this document
  pinecone_index_name VARCHAR(100),
  
  -- Content metadata
  keywords VARCHAR(255)[] DEFAULT '{}',
  summary TEXT,
  confidence_score DECIMAL(3, 2),  -- Confidence score for metadata extraction (0-1)
  
  -- Content statistics
  total_words INT,
  total_pages INT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  archived_at TIMESTAMP WITH TIME ZONE
);

-- Step 2: Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_backend_documents_status 
  ON public.backend_documents(status);

CREATE INDEX IF NOT EXISTS idx_backend_documents_document_type 
  ON public.backend_documents(document_type);

CREATE INDEX IF NOT EXISTS idx_backend_documents_created_at 
  ON public.backend_documents(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_backend_documents_authority_level
  ON public.backend_documents(authority_level);

CREATE INDEX IF NOT EXISTS idx_backend_documents_jurisdiction
  ON public.backend_documents USING GIN(jurisdiction);

CREATE INDEX IF NOT EXISTS idx_backend_documents_practice_areas
  ON public.backend_documents USING GIN(practice_areas);

CREATE INDEX IF NOT EXISTS idx_backend_documents_keywords
  ON public.backend_documents USING GIN(keywords);

-- Step 3: Enable Row Level Security (Optional for backend documents)
ALTER TABLE public.backend_documents ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies - Allow authenticated users to read all backend documents
CREATE POLICY "All authenticated can read backend documents"
  ON public.backend_documents
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- Verification query
SELECT 'Migration 005 Applied: backend_documents table created with RLS' as migration_status;
