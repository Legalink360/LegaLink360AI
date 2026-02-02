-- =============================================================================
-- MIGRATION 010: Create Document Sharing Table
-- Description: Document sharing and collaboration features
-- Date: February 2026 (Fresh Database)
-- Purpose: Track document sharing permissions and collaborative access
-- =============================================================================

-- Create document_shares table
CREATE TABLE IF NOT EXISTS public.document_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Document and owner
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Recipient
  shared_with_email VARCHAR(255),  -- For sharing with non-registered users
  shared_with_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Sharing settings
  permission VARCHAR(50) DEFAULT 'view',  -- 'view', 'comment', 'edit'
  expiration_date TIMESTAMP WITH TIME ZONE,
  
  -- Sharing metadata
  share_token VARCHAR(255) UNIQUE,  -- For link-based sharing
  is_public_link BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  accessed_at TIMESTAMP WITH TIME ZONE,
  revoked_at TIMESTAMP WITH TIME ZONE
);

-- Step 2: Create indexes
CREATE INDEX IF NOT EXISTS idx_document_shares_document_id 
  ON public.document_shares(document_id);

CREATE INDEX IF NOT EXISTS idx_document_shares_owner_id 
  ON public.document_shares(owner_id);

CREATE INDEX IF NOT EXISTS idx_document_shares_shared_with_user_id 
  ON public.document_shares(shared_with_user_id);

CREATE INDEX IF NOT EXISTS idx_document_shares_share_token 
  ON public.document_shares(share_token);

-- Step 3: Enable Row Level Security
ALTER TABLE public.document_shares ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies
-- Policy 1: Document owners can view their shares
CREATE POLICY "Document owners can view shares"
  ON public.document_shares
  FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

-- Policy 2: Shared users can view documents shared with them
CREATE POLICY "Shared users can view document shares"
  ON public.document_shares
  FOR SELECT
  TO authenticated
  USING (shared_with_user_id = auth.uid());

-- Policy 3: Document owners can create shares
CREATE POLICY "Document owners can create shares"
  ON public.document_shares
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

-- Policy 4: Document owners can update shares
CREATE POLICY "Document owners can update shares"
  ON public.document_shares
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Policy 5: Document owners can delete shares
CREATE POLICY "Document owners can delete shares"
  ON public.document_shares
  FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- Verification query
SELECT 'Migration 010 Applied: document_shares table created with RLS' as migration_status;
