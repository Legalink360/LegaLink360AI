-- =============================================================================
-- CREATE BACKEND_DOCUMENTS TABLE ONLY
-- This is the only table missing for Uganda laws ingestion
-- =============================================================================

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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_backend_documents_status ON public.backend_documents(status);
CREATE INDEX IF NOT EXISTS idx_backend_documents_document_type ON public.backend_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_backend_documents_created_at ON public.backend_documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_backend_documents_vector_count ON public.backend_documents(vector_count);
CREATE INDEX IF NOT EXISTS idx_backend_documents_keywords ON public.backend_documents USING GIN(keywords);

-- Enable RLS
ALTER TABLE public.backend_documents ENABLE ROW LEVEL SECURITY;

-- Create policy if it doesn't exist
DROP POLICY IF EXISTS "Backend service can manage documents" ON public.backend_documents;
CREATE POLICY "Backend service can manage documents"
  ON public.backend_documents
  FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- Also ensure document_chunks has correct foreign key to backend_documents
ALTER TABLE public.document_chunks
  DROP CONSTRAINT IF EXISTS fk_document_chunks_document_id;

ALTER TABLE public.document_chunks
  ADD CONSTRAINT fk_document_chunks_document_id 
  FOREIGN KEY (document_id) REFERENCES public.backend_documents(id) ON DELETE CASCADE;

-- Verification
SELECT '✅ backend_documents table is ready for ingestion!' as status;
