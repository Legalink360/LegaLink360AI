-- =============================================================================
-- MIGRATION 007: Create Ingestion Logs Table
-- Description: Backend document ingestion audit trail and monitoring
-- Date: February 2026 (Fresh Database)
-- Purpose: Log all document ingestion operations for monitoring, debugging and audit
-- =============================================================================

-- Create ingestion_logs table
CREATE TABLE IF NOT EXISTS public.ingestion_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Document reference
  document_id UUID REFERENCES public.backend_documents(id) ON DELETE CASCADE,
  
  -- Ingestion process information
  operation VARCHAR(100),  -- 'parse', 'chunk', 'embed', 'index', 'validate', etc.
  status VARCHAR(50),  -- 'started', 'in_progress', 'completed', 'failed', 'retried'
  
  -- Process details
  file_path VARCHAR(500),
  processing_duration_ms INT,
  
  -- Results
  items_processed INT,  -- Total items processed in this operation
  items_failed INT,  -- Items that failed
  
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
  triggered_by VARCHAR(100),  -- 'user', 'system', 'scheduled', 'admin'
  operation_details JSONB,  -- Additional details in JSON format
  
  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Step 2: Create indexes for efficient querying
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

CREATE INDEX IF NOT EXISTS idx_ingestion_logs_triggered_by
  ON public.ingestion_logs(triggered_by);

-- Step 3: Enable Row Level Security
ALTER TABLE public.ingestion_logs ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies
-- Policy 1: Backend can insert logs
CREATE POLICY "Authenticated can insert logs"
  ON public.ingestion_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

-- Policy 2: Authenticated users can view logs
CREATE POLICY "Authenticated can view logs"
  ON public.ingestion_logs
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- Verification query
SELECT 'Migration 007 Applied: ingestion_logs table created with RLS' as migration_status;
