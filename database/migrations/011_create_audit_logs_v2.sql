-- =============================================================================
-- MIGRATION 011: Create Audit Logs Table
-- Description: System audit trail and compliance logging
-- Date: February 2026 (Fresh Database)
-- Purpose: Track all important user actions for compliance and security audit
-- =============================================================================

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User information
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email VARCHAR(255),  -- Denormalized for audit trail
  
  -- Action information
  action VARCHAR(100),  -- 'login', 'logout', 'document_uploaded', 'document_deleted', 'query_executed', etc.
  resource_type VARCHAR(100),  -- 'document', 'chat_thread', 'user_profile', etc.
  resource_id VARCHAR(255),  -- ID of the resource being acted upon
  
  -- Action details
  action_details JSONB,  -- Additional details about the action
  changes JSONB,  -- For update actions, track what changed
  
  -- Result
  status VARCHAR(50),  -- 'success', 'failure'
  error_message TEXT,
  
  -- Request information
  ip_address INET,  -- IP address from which action was taken
  user_agent TEXT,  -- User agent string
  request_id VARCHAR(255),  -- For correlating related requests
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Step 2: Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id 
  ON public.audit_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action 
  ON public.audit_logs(action);

CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type 
  ON public.audit_logs(resource_type);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at 
  ON public.audit_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_status 
  ON public.audit_logs(status);

CREATE INDEX IF NOT EXISTS idx_audit_logs_request_id 
  ON public.audit_logs(request_id);

-- Step 3: Enable Row Level Security
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies
-- Policy 1: Authenticated users can view logs of their own actions
CREATE POLICY "Users can view own audit logs"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy 2: Backend can insert audit logs
CREATE POLICY "Authenticated can insert audit logs"
  ON public.audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

-- Verification query
SELECT 'Migration 011 Applied: audit_logs table created with RLS' as migration_status;
