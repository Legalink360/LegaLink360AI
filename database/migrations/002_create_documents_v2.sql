-- =============================================================================
-- MIGRATION 002: Create Documents Table
-- Description: Frontend document management with user ownership
-- Date: February 2026 (Fresh Database)
-- Purpose: Store document metadata that users have uploaded or accessed
-- =============================================================================

-- Create documents table for user-uploaded files
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User ownership
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Document metadata
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_name VARCHAR(255),
  file_path VARCHAR(500),
  document_type VARCHAR(100),  -- 'contract', 'brief', 'case_law', 'policy', 'template', etc.
  
  -- Storage information
  file_size BIGINT,
  mime_type VARCHAR(100),
  
  -- Processing status
  status VARCHAR(50) DEFAULT 'pending',  -- pending, processing, completed, failed
  processing_error TEXT,
  
  -- Vector database references
  pinecone_vector_ids TEXT[],  -- Array of Pinecone vector IDs
  backend_document_id UUID,  -- Reference to backend_documents if this was ingested
  
  -- Document access level
  is_public BOOLEAN DEFAULT FALSE,  -- Whether document can be shared
  is_archived BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Step 2: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_documents_user_id 
  ON public.documents(user_id);

CREATE INDEX IF NOT EXISTS idx_documents_status 
  ON public.documents(status);

CREATE INDEX IF NOT EXISTS idx_documents_created_at 
  ON public.documents(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_documents_document_type 
  ON public.documents(document_type);

CREATE INDEX IF NOT EXISTS idx_documents_is_archived
  ON public.documents(is_archived);

CREATE INDEX IF NOT EXISTS idx_documents_user_created
  ON public.documents(user_id, created_at DESC);

-- Step 3: Enable Row Level Security
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies
-- Policy 1: Users can view their own documents
CREATE POLICY "Users can view own documents"
  ON public.documents
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_public = TRUE);

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
SELECT 'Migration 002 Applied: documents table created with RLS' as migration_status;
