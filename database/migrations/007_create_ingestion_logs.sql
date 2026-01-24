-- =============================================================================
-- MIGRATION 007: Create Ingestion Logs Table
-- Description: Backend document ingestion audit trail and monitoring
-- Date: January 2026
-- Status: APPLIED
-- =============================================================================

-- This table logs all document ingestion operations for monitoring and debugging

CREATE TABLE IF NOT EXISTS public.ingestion_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Document reference
  document_id UUID REFERENCES public.backend_documents(id) ON DELETE CASCADE,
  
  -- Ingestion process information
  operation VARCHAR(100),  -- 'parse', 'chunk', 'embed', 'index', etc.
  status VARCHAR(50),  -- 'started', 'completed', 'failed'
  
  -- Process details
  file_path VARCHAR(500),
  processing_duration_ms INT,
  
  -- Results
  items_processed INT,
  items_failed INT,
  
  -- Error information
  error_message TEXT,
  error_code VARCHAR(50),
  error_stack_trace TEXT,
  
  -- Performance metrics
  memory_used_mb INT,
  cpu_percent INT,
  
  -- API call information
  api_calls INT,  -- Number of API calls made (OpenAI, Pinecone)
  tokens_used INT,
  api_cost_usd DECIMAL(10, 6),
  
  -- Metadata
  triggered_by VARCHAR(100),  -- 'user', 'system', 'scheduled', etc.
  
  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for querying
CREATE INDEX IF NOT EXISTS idx_ingestion_logs_document_id 
  ON public.ingestion_logs(document_id);

CREATE INDEX IF NOT EXISTS idx_ingestion_logs_status 
  ON public.ingestion_logs(status);

CREATE INDEX IF NOT EXISTS idx_ingestion_logs_operation 
  ON public.ingestion_logs(operation);

CREATE INDEX IF NOT EXISTS idx_ingestion_logs_created_at 
  ON public.ingestion_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ingestion_logs_error 
  ON public.ingestion_logs(error_code) WHERE status = 'failed';

-- Enable Row Level Security
ALTER TABLE public.ingestion_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Backend service logging
-- Policy 1: Backend can insert logs
CREATE POLICY "Backend can insert logs"
  ON public.ingestion_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

-- Policy 2: Backend and authenticated users can view logs
CREATE POLICY "Can view ingestion logs"
  ON public.ingestion_logs
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- Verification query
SELECT 'Migration 007 Applied: ingestion_logs table created' as migration_status;
