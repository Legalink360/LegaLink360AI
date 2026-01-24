 -- =============================================================================
-- LEGALINK360 - COMPLETE DATABASE SETUP
-- All migrations combined for easy execution in Supabase SQL Editor
-- =============================================================================

-- =============================================================================
-- MIGRATION 001: Create User Profiles Table
-- =============================================================================

DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

CREATE TABLE IF NOT EXISTS public.user_profiles (
  auth_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  job_title VARCHAR(100),
  company VARCHAR(100),
  phone VARCHAR(20),
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_email 
  ON public.user_profiles(email);

CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at 
  ON public.user_profiles(created_at);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_id)
  WITH CHECK (auth.uid() = auth_id);

CREATE POLICY "Users can insert own profile"
  ON public.user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = auth_id);

-- =============================================================================
-- MIGRATION 002: Create Documents Table
-- =============================================================================

DROP POLICY IF EXISTS "Users can view own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON public.documents;

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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_documents_user_id 
  ON public.documents(user_id);

CREATE INDEX IF NOT EXISTS idx_documents_status 
  ON public.documents(status);

CREATE INDEX IF NOT EXISTS idx_documents_created_at 
  ON public.documents(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_documents_document_type 
  ON public.documents(document_type);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents"
  ON public.documents
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own documents"
  ON public.documents
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own documents"
  ON public.documents
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own documents"
  ON public.documents
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- =============================================================================
-- MIGRATION 003: Create Chat Threads Table
-- =============================================================================

DROP POLICY IF EXISTS "Users can view own threads" ON public.chat_threads;
DROP POLICY IF EXISTS "Users can insert own threads" ON public.chat_threads;
DROP POLICY IF EXISTS "Users can update own threads" ON public.chat_threads;
DROP POLICY IF EXISTS "Users can delete own threads" ON public.chat_threads;

CREATE TABLE IF NOT EXISTS public.chat_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  topic VARCHAR(100),
  document_ids UUID[] DEFAULT '{}',
  message_count INT DEFAULT 0,
  last_message_text TEXT,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_message_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_chat_threads_user_id 
  ON public.chat_threads(user_id);

CREATE INDEX IF NOT EXISTS idx_chat_threads_created_at 
  ON public.chat_threads(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_threads_last_message_at 
  ON public.chat_threads(last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_threads_is_archived 
  ON public.chat_threads(is_archived);

ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own threads"
  ON public.chat_threads
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own threads"
  ON public.chat_threads
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own threads"
  ON public.chat_threads
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own threads"
  ON public.chat_threads
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- =============================================================================
-- MIGRATION 004: Create Chat Messages Table
-- =============================================================================

DROP POLICY IF EXISTS "Users can view own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can update own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON public.chat_messages;

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20),
  content TEXT NOT NULL,
  referenced_documents UUID[] DEFAULT '{}',
  pinecone_vector_ids TEXT[] DEFAULT '{}',
  response_time_ms INT,
  model_used VARCHAR(100),
  tokens_used INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_thread_id 
  ON public.chat_messages(thread_id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id 
  ON public.chat_messages(user_id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at 
  ON public.chat_messages(created_at);

CREATE INDEX IF NOT EXISTS idx_chat_messages_role 
  ON public.chat_messages(role);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages"
  ON public.chat_messages
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own messages"
  ON public.chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own messages"
  ON public.chat_messages
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own messages"
  ON public.chat_messages
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- =============================================================================
-- MIGRATION 005: Create Backend Documents Table
-- =============================================================================

DROP POLICY IF EXISTS "Backend service can manage documents" ON public.backend_documents;

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
  status VARCHAR(50) DEFAULT 'pending',
  processing_error TEXT,
  processing_started_at TIMESTAMP WITH TIME ZONE,
  processing_completed_at TIMESTAMP WITH TIME ZONE,
  total_chunks INT DEFAULT 0,
  indexed_chunks INT DEFAULT 0,
  vector_count INT DEFAULT 0,
  pinecone_vector_ids TEXT[],
  pinecone_index_name VARCHAR(100),
  keywords TEXT[],
  summary TEXT,
  author VARCHAR(255),
  published_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

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

ALTER TABLE public.backend_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Backend service can manage documents"
  ON public.backend_documents
  FOR ALL
  TO authenticated
  USING (TRUE);

-- =============================================================================
-- MIGRATION 006: Create Document Chunks Table
-- =============================================================================

DROP POLICY IF EXISTS "Users and backend can read chunks" ON public.document_chunks;
DROP POLICY IF EXISTS "Backend can insert chunks" ON public.document_chunks;
DROP POLICY IF EXISTS "Backend can update chunks" ON public.document_chunks;

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
  keywords TEXT[],
  summary TEXT,
  retrieval_count INT DEFAULT 0,
  last_retrieved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

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

ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users and backend can read chunks"
  ON public.document_chunks
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Backend can insert chunks"
  ON public.document_chunks
  FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

CREATE POLICY "Backend can update chunks"
  ON public.document_chunks
  FOR UPDATE
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- =============================================================================
-- MIGRATION 007: Create Ingestion Logs Table
-- =============================================================================

DROP POLICY IF EXISTS "Backend can insert logs" ON public.ingestion_logs;
DROP POLICY IF EXISTS "Can view ingestion logs" ON public.ingestion_logs;

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
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

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

ALTER TABLE public.ingestion_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Backend can insert logs"
  ON public.ingestion_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

CREATE POLICY "Can view ingestion logs"
  ON public.ingestion_logs
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- =============================================================================
-- MIGRATION 008: Create Query Logs Table
-- =============================================================================

DROP POLICY IF EXISTS "Users can view own query logs" ON public.query_logs;
DROP POLICY IF EXISTS "Backend can insert query logs" ON public.query_logs;

CREATE TABLE IF NOT EXISTS public.query_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  chat_message_id UUID,
  query_text TEXT NOT NULL,
  query_embedding_model VARCHAR(100),
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
  response_was_helpful BOOLEAN,
  user_feedback TEXT,
  embedding_cost_usd DECIMAL(10, 6),
  llm_cost_usd DECIMAL(10, 6),
  total_cost_usd DECIMAL(10, 6),
  total_latency_ms INT,
  retrieval_latency_ms INT,
  embedding_latency_ms INT,
  status VARCHAR(50),
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_query_logs_user_id 
  ON public.query_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_query_logs_created_at 
  ON public.query_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_query_logs_status 
  ON public.query_logs(status);

CREATE INDEX IF NOT EXISTS idx_query_logs_documents_returned 
  ON public.query_logs(documents_returned);

CREATE INDEX IF NOT EXISTS idx_query_logs_similarity_score 
  ON public.query_logs(avg_similarity_score DESC);

CREATE INDEX IF NOT EXISTS idx_query_logs_cost 
  ON public.query_logs(total_cost_usd DESC);

CREATE INDEX IF NOT EXISTS idx_query_logs_latency 
  ON public.query_logs(total_latency_ms DESC);

ALTER TABLE public.query_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own query logs"
  ON public.query_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Backend can insert query logs"
  ON public.query_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

-- =============================================================================
-- SETUP COMPLETE
-- =============================================================================

SELECT '✅ All migrations applied successfully!' as status;
