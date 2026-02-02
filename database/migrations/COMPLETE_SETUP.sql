-- =============================================================================
-- SUPABASE DATABASE INITIALIZATION SCRIPT
-- For: LegaLink360AI
-- Purpose: Complete one-click database setup
-- =============================================================================
--
-- This script combines ALL 11 migrations into one file for convenience.
-- You can paste this ENTIRE script into Supabase SQL Editor and run it once.
--
-- ⚠️ IMPORTANT: If any migration fails, scroll up to see the error message
-- and fix it before running the next one.
--
-- =============================================================================

-- ============================================================================
-- MIGRATION 001: User Profiles
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  auth_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  job_title VARCHAR(100),
  company VARCHAR(100),
  phone VARCHAR(20),
  email_verified BOOLEAN DEFAULT FALSE,
  account_status VARCHAR(50) DEFAULT 'active',
  preferred_language VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_login_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON public.user_profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_account_status ON public.user_profiles(account_status);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.user_profiles FOR SELECT TO authenticated USING (auth.uid() = auth_id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE TO authenticated USING (auth.uid() = auth_id) WITH CHECK (auth.uid() = auth_id);
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = auth_id);
CREATE POLICY "Users can delete own profile" ON public.user_profiles FOR DELETE TO authenticated USING (auth.uid() = auth_id);

-- ============================================================================
-- MIGRATION 002: Documents
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_name VARCHAR(255),
  file_path VARCHAR(500),
  document_type VARCHAR(100),
  file_size BIGINT,
  mime_type VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending',
  processing_error TEXT,
  pinecone_vector_ids TEXT[],
  backend_document_id UUID,
  is_public BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_document_type ON public.documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_is_archived ON public.documents(is_archived);
CREATE INDEX IF NOT EXISTS idx_documents_user_created ON public.documents(user_id, created_at DESC);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents" ON public.documents FOR SELECT TO authenticated USING (user_id = auth.uid() OR is_public = TRUE);
CREATE POLICY "Users can insert own documents" ON public.documents FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own documents" ON public.documents FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own documents" ON public.documents FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ============================================================================
-- MIGRATION 003: Chat Threads
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.chat_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  topic VARCHAR(100),
  document_ids UUID[] DEFAULT '{}',
  message_count INT DEFAULT 0,
  last_message_text TEXT,
  is_archived BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_message_at TIMESTAMP WITH TIME ZONE,
  archived_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_chat_threads_user_id ON public.chat_threads(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_threads_created_at ON public.chat_threads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_threads_last_message_at ON public.chat_threads(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_threads_is_archived ON public.chat_threads(is_archived);
CREATE INDEX IF NOT EXISTS idx_chat_threads_user_created ON public.chat_threads(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_threads_is_pinned ON public.chat_threads(is_pinned);

ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own threads" ON public.chat_threads FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own threads" ON public.chat_threads FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own threads" ON public.chat_threads FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own threads" ON public.chat_threads FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ============================================================================
-- MIGRATION 004: Chat Messages
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  formatted_content TEXT,
  referenced_documents UUID[] DEFAULT '{}',
  pinecone_vector_ids VARCHAR(255)[] DEFAULT '{}',
  response_time_ms INT,
  model_used VARCHAR(100),
  tokens_used INT,
  tokens_input INT,
  tokens_output INT,
  is_helpful BOOLEAN,
  user_feedback TEXT,
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_thread_id ON public.chat_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_role ON public.chat_messages(role);
CREATE INDEX IF NOT EXISTS idx_chat_messages_thread_created ON public.chat_messages(thread_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_is_helpful ON public.chat_messages(is_helpful) WHERE is_helpful IS NOT NULL;

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages" ON public.chat_messages FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own messages" ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own messages" ON public.chat_messages FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own messages" ON public.chat_messages FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ============================================================================
-- MIGRATION 005: Backend Documents
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.backend_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_name VARCHAR(255),
  file_path VARCHAR(500),
  document_type VARCHAR(100),
  source_url VARCHAR(500),
  file_size BIGINT,
  mime_type VARCHAR(100),
  jurisdiction VARCHAR(100)[],
  practice_areas VARCHAR(100)[],
  authority_level VARCHAR(50),
  author VARCHAR(255),
  published_date DATE,
  updated_date DATE,
  status VARCHAR(50) DEFAULT 'pending',
  processing_error TEXT,
  processing_started_at TIMESTAMP WITH TIME ZONE,
  processing_completed_at TIMESTAMP WITH TIME ZONE,
  total_chunks INT DEFAULT 0,
  indexed_chunks INT DEFAULT 0,
  vector_count INT DEFAULT 0,
  pinecone_vector_ids VARCHAR(255)[] DEFAULT '{}',
  pinecone_index_name VARCHAR(100),
  keywords VARCHAR(255)[] DEFAULT '{}',
  summary TEXT,
  confidence_score DECIMAL(3, 2),
  total_words INT,
  total_pages INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  archived_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_backend_documents_status ON public.backend_documents(status);
CREATE INDEX IF NOT EXISTS idx_backend_documents_document_type ON public.backend_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_backend_documents_created_at ON public.backend_documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_backend_documents_authority_level ON public.backend_documents(authority_level);
CREATE INDEX IF NOT EXISTS idx_backend_documents_jurisdiction ON public.backend_documents USING GIN(jurisdiction);
CREATE INDEX IF NOT EXISTS idx_backend_documents_practice_areas ON public.backend_documents USING GIN(practice_areas);
CREATE INDEX IF NOT EXISTS idx_backend_documents_keywords ON public.backend_documents USING GIN(keywords);

ALTER TABLE public.backend_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated can read backend documents" ON public.backend_documents FOR SELECT TO authenticated USING (TRUE);

-- ============================================================================
-- MIGRATION 006: Document Chunks
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.backend_documents(id) ON DELETE CASCADE,
  chunk_index INT NOT NULL,
  content TEXT NOT NULL,
  pinecone_vector_id VARCHAR(255) UNIQUE,
  embedding_model VARCHAR(100),
  embedding_dimensions INT DEFAULT 3072,
  char_count INT,
  token_count INT,
  keywords VARCHAR(255)[] DEFAULT '{}',
  summary TEXT,
  page_number INT,
  section_title VARCHAR(255),
  retrieval_count INT DEFAULT 0,
  last_retrieved_at TIMESTAMP WITH TIME ZONE,
  relevance_score DECIMAL(4, 3),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id ON public.document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_pinecone_vector_id ON public.document_chunks(pinecone_vector_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_chunk_index ON public.document_chunks(document_id, chunk_index);
CREATE INDEX IF NOT EXISTS idx_document_chunks_created_at ON public.document_chunks(created_at);
CREATE INDEX IF NOT EXISTS idx_document_chunks_keywords ON public.document_chunks USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_document_chunks_retrieval_count ON public.document_chunks(retrieval_count DESC);
CREATE INDEX IF NOT EXISTS idx_document_chunks_relevance_score ON public.document_chunks(relevance_score DESC);

ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated can read chunks" ON public.document_chunks FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Authenticated can insert chunks" ON public.document_chunks FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "Authenticated can update chunks" ON public.document_chunks FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- ============================================================================
-- MIGRATION 007: Ingestion Logs
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ingestion_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.backend_documents(id) ON DELETE CASCADE,
  operation VARCHAR(100),
  status VARCHAR(50),
  file_path VARCHAR(500),
  processing_duration_ms INT,
  items_processed INT,
  items_failed INT,
  error_message TEXT,
  error_code VARCHAR(50),
  error_stack_trace TEXT,
  memory_used_mb INT,
  cpu_percent INT,
  api_calls INT,
  tokens_used INT,
  api_cost_usd DECIMAL(10, 6),
  triggered_by VARCHAR(100),
  operation_details JSONB,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ingestion_logs_document_id ON public.ingestion_logs(document_id);
CREATE INDEX IF NOT EXISTS idx_ingestion_logs_status ON public.ingestion_logs(status);
CREATE INDEX IF NOT EXISTS idx_ingestion_logs_operation ON public.ingestion_logs(operation);
CREATE INDEX IF NOT EXISTS idx_ingestion_logs_created_at ON public.ingestion_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ingestion_logs_error ON public.ingestion_logs(error_code) WHERE status = 'failed';
CREATE INDEX IF NOT EXISTS idx_ingestion_logs_triggered_by ON public.ingestion_logs(triggered_by);

ALTER TABLE public.ingestion_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can insert logs" ON public.ingestion_logs FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "Authenticated can view logs" ON public.ingestion_logs FOR SELECT TO authenticated USING (TRUE);

-- ============================================================================
-- MIGRATION 008: Query Logs
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.query_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  chat_message_id UUID,
  thread_id UUID REFERENCES public.chat_threads(id) ON DELETE SET NULL,
  query_text TEXT NOT NULL,
  query_embedding_model VARCHAR(100),
  query_length_chars INT,
  query_length_tokens INT,
  documents_requested INT,
  documents_returned INT,
  retrieved_document_ids UUID[],
  retrieved_chunk_ids UUID[],
  pinecone_vector_ids VARCHAR(255)[],
  min_similarity_score DECIMAL(4, 3),
  max_similarity_score DECIMAL(4, 3),
  avg_similarity_score DECIMAL(4, 3),
  llm_model VARCHAR(100),
  llm_tokens_input INT,
  llm_tokens_output INT,
  llm_response_time_ms INT,
  llm_response_text TEXT,
  response_was_helpful BOOLEAN,
  response_was_accurate BOOLEAN,
  response_was_complete BOOLEAN,
  user_feedback TEXT,
  user_rating INT,
  embedding_cost_usd DECIMAL(10, 6),
  llm_cost_usd DECIMAL(10, 6),
  total_cost_usd DECIMAL(10, 6),
  total_latency_ms INT,
  retrieval_latency_ms INT,
  embedding_latency_ms INT,
  llm_latency_ms INT,
  status VARCHAR(50),
  error_message TEXT,
  error_code VARCHAR(50),
  query_category VARCHAR(100),
  query_intent VARCHAR(100),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_query_logs_user_id ON public.query_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_query_logs_created_at ON public.query_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_query_logs_status ON public.query_logs(status);
CREATE INDEX IF NOT EXISTS idx_query_logs_documents_returned ON public.query_logs(documents_returned);
CREATE INDEX IF NOT EXISTS idx_query_logs_similarity_score ON public.query_logs(avg_similarity_score DESC);
CREATE INDEX IF NOT EXISTS idx_query_logs_response_was_helpful ON public.query_logs(response_was_helpful) WHERE response_was_helpful IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_query_logs_thread_id ON public.query_logs(thread_id);
CREATE INDEX IF NOT EXISTS idx_query_logs_llm_model ON public.query_logs(llm_model);
CREATE INDEX IF NOT EXISTS idx_query_logs_query_category ON public.query_logs(query_category);
CREATE INDEX IF NOT EXISTS idx_query_logs_cost ON public.query_logs(total_cost_usd DESC);

ALTER TABLE public.query_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own query logs" ON public.query_logs FOR SELECT TO authenticated USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "Authenticated can insert query logs" ON public.query_logs FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "Authenticated can update query logs" ON public.query_logs FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- ============================================================================
-- MIGRATION 009: User Preferences
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  theme VARCHAR(50) DEFAULT 'light',
  language VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(50) DEFAULT 'UTC',
  email_notifications_enabled BOOLEAN DEFAULT TRUE,
  email_digest_frequency VARCHAR(50) DEFAULT 'weekly',
  notifications_on_document_ready BOOLEAN DEFAULT TRUE,
  notifications_on_query_complete BOOLEAN DEFAULT TRUE,
  auto_save_drafts BOOLEAN DEFAULT TRUE,
  show_tutorial BOOLEAN DEFAULT TRUE,
  beta_features_enabled BOOLEAN DEFAULT FALSE,
  allow_analytics BOOLEAN DEFAULT TRUE,
  allow_usage_tracking BOOLEAN DEFAULT TRUE,
  allow_error_reporting BOOLEAN DEFAULT TRUE,
  default_search_results_count INT DEFAULT 5,
  minimum_relevance_score DECIMAL(4, 3) DEFAULT 0.5,
  custom_preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_theme ON public.user_preferences(theme);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences" ON public.user_preferences FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update own preferences" ON public.user_preferences FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can insert own preferences" ON public.user_preferences FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- MIGRATION 010: Document Sharing
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.document_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with_email VARCHAR(255),
  shared_with_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  permission VARCHAR(50) DEFAULT 'view',
  expiration_date TIMESTAMP WITH TIME ZONE,
  share_token VARCHAR(255) UNIQUE,
  is_public_link BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  accessed_at TIMESTAMP WITH TIME ZONE,
  revoked_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_document_shares_document_id ON public.document_shares(document_id);
CREATE INDEX IF NOT EXISTS idx_document_shares_owner_id ON public.document_shares(owner_id);
CREATE INDEX IF NOT EXISTS idx_document_shares_shared_with_user_id ON public.document_shares(shared_with_user_id);
CREATE INDEX IF NOT EXISTS idx_document_shares_share_token ON public.document_shares(share_token);

ALTER TABLE public.document_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Document owners can view shares" ON public.document_shares FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Shared users can view document shares" ON public.document_shares FOR SELECT TO authenticated USING (shared_with_user_id = auth.uid());
CREATE POLICY "Document owners can create shares" ON public.document_shares FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Document owners can update shares" ON public.document_shares FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Document owners can delete shares" ON public.document_shares FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- ============================================================================
-- MIGRATION 011: Audit Logs
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email VARCHAR(255),
  action VARCHAR(100),
  resource_type VARCHAR(100),
  resource_id VARCHAR(255),
  action_details JSONB,
  changes JSONB,
  status VARCHAR(50),
  error_message TEXT,
  ip_address INET,
  user_agent TEXT,
  request_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON public.audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_status ON public.audit_logs(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_request_id ON public.audit_logs(request_id);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Authenticated can insert audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (TRUE);

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- All migrations complete! Verify with:
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
-- ============================================================================

SELECT 'All migrations applied successfully! ✅' as status;
