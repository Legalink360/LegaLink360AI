-- =============================================================================
-- MIGRATION 002: Create Documents Table
-- Description: Frontend document management with user ownership
-- Date: January 2026
-- Status: APPLIED
-- =============================================================================

-- This table stores document metadata that users have uploaded or accessed

CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User ownership
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Document metadata
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_name VARCHAR(255),
  file_path VARCHAR(500),
  document_type VARCHAR(100),  -- 'contract', 'brief', 'case_law', etc.
  
  -- Storage info
  file_size BIGINT,
  mime_type VARCHAR(100),
  
  -- Processing status
  status VARCHAR(50) DEFAULT 'pending',  -- pending, processing, completed, failed
  processing_error TEXT,
  
  -- Vector database reference
  pinecone_vector_ids TEXT[],  -- Array of Pinecone vector IDs
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_documents_user_id 
  ON public.documents(user_id);

CREATE INDEX IF NOT EXISTS idx_documents_status 
  ON public.documents(status);

CREATE INDEX IF NOT EXISTS idx_documents_created_at 
  ON public.documents(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_documents_document_type 
  ON public.documents(document_type);

-- Enable Row Level Security
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Policy 1: Users can view only their own documents
CREATE POLICY "Users can view own documents"
  ON public.documents
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy 2: Users can insert their own documents
CREATE POLICY "Users can insert own documents"
  ON public.documents
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy 3: Users can update their own documents
CREATE POLICY "Users can update own documents"
  ON public.documents
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy 4: Users can delete their own documents
CREATE POLICY "Users can delete own documents"
  ON public.documents
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Verification query
SELECT 'Migration 002 Applied: documents table created' as migration_status;
