# Database Migrations

Complete record of all database schema changes for LegaLink360 AI.

## Overview

This directory contains all database migrations organized chronologically. Each migration file is self-contained and can be applied independently or as part of a complete setup.

## Migration Files

### Frontend Migrations

#### 001: Create User Profiles Table
- **File**: `001_create_user_profiles.sql`
- **Date**: January 2026
- **Tables**: `user_profiles`
- **Purpose**: User authentication and profile management
- **Status**: ✅ APPLIED
- **Description**: 
  - Links to Supabase `auth.users` table
  - Stores user profile information
  - Includes RLS policies for user data privacy
  - Indexes for email and creation date queries

#### 002: Create Documents Table
- **File**: `002_create_documents_table.sql`
- **Date**: January 2026
- **Tables**: `documents`
- **Purpose**: User document management and tracking
- **Status**: ✅ APPLIED
- **Description**:
  - Tracks user-uploaded documents
  - Stores file metadata and references to Pinecone vectors
  - Includes processing status tracking
  - RLS policies ensure users see only their documents
  - Indexes on user_id, status, type for efficient querying

#### 003: Create Chat Threads Table
- **File**: `003_create_chat_threads.sql`
- **Date**: January 2026
- **Tables**: `chat_threads`
- **Purpose**: Organize user conversations
- **Status**: ✅ APPLIED
- **Description**:
  - Groups chat messages into threads
  - Tracks referenced documents per conversation
  - Supports archiving and metadata
  - RLS ensures users see only their threads

#### 004: Create Chat Messages Table
- **File**: `004_create_chat_messages.sql`
- **Date**: January 2026
- **Tables**: `chat_messages`
- **Purpose**: Store individual chat messages and responses
- **Status**: ✅ APPLIED
- **Description**:
  - Individual messages within chat threads
  - References retrieved documents and vectors
  - Tracks response performance metrics
  - RLS ensures message privacy

### Backend Migrations

#### 005: Create Backend Documents Table
- **File**: `005_create_backend_documents.sql`
- **Date**: January 2026
- **Tables**: `backend_documents`
- **Purpose**: Backend document metadata for vector indexing
- **Status**: ✅ APPLIED
- **Description**:
  - Stores metadata for documents ingested into Pinecone
  - Tracks processing status and vector information
  - Includes keywords, summary, and source information
  - Separate from user-uploaded documents
  - Indexes for efficient retrieval

#### 006: Create Document Chunks Table
- **File**: `006_create_document_chunks.sql`
- **Date**: January 2026
- **Tables**: `document_chunks`
- **Purpose**: Store document chunks for vector embeddings
- **Status**: ✅ APPLIED
- **Description**:
  - Individual chunks of documents
  - References to Pinecone vector IDs
  - Tracks retrieval count and relevance
  - Supports keyword and semantic searches
  - Indexes for fast chunk retrieval

#### 007: Create Ingestion Logs Table
- **File**: `007_create_ingestion_logs.sql`
- **Date**: January 2026
- **Tables**: `ingestion_logs`
- **Purpose**: Audit trail for document ingestion processes
- **Status**: ✅ APPLIED
- **Description**:
  - Logs every step of document processing
  - Tracks timing, errors, and API calls
  - Monitors costs and resource usage
  - Useful for debugging and optimization
  - Indexes for error analysis and performance monitoring

#### 008: Create Query Logs Table
- **File**: `008_create_query_logs.sql`
- **Date**: January 2026
- **Tables**: `query_logs`
- **Purpose**: Track semantic search and RAG queries
- **Status**: ✅ APPLIED
- **Description**:
  - Logs all retrieval and LLM queries
  - Tracks relevance scores and latency
  - Monitors costs and performance
  - Collects user feedback on responses
  - Useful for optimization and analytics

## Table Dependencies

```
auth.users (Supabase)
├── user_profiles
├── documents
├── chat_threads
│   └── chat_messages
└── query_logs

backend_documents
├── document_chunks
└── ingestion_logs
```

## Applying Migrations

### Apply All Migrations (New Setup)

```bash
# Connect to your Supabase database
psql postgresql://user:password@db.supabase.co:5432/postgres

# Run all migrations in order
\i migrations/001_create_user_profiles.sql
\i migrations/002_create_documents_table.sql
\i migrations/003_create_chat_threads.sql
\i migrations/004_create_chat_messages.sql
\i migrations/005_create_backend_documents.sql
\i migrations/006_create_document_chunks.sql
\i migrations/007_create_ingestion_logs.sql
\i migrations/008_create_query_logs.sql
```

### Apply Specific Migration

```bash
# Example: Apply only user profiles migration
psql postgresql://user:password@db.supabase.co:5432/postgres -f migrations/001_create_user_profiles.sql
```

### Via Supabase Dashboard

1. Go to SQL Editor in Supabase Dashboard
2. Create new query
3. Copy and paste migration SQL
4. Execute

## Verification

After applying migrations, verify with:

```sql
-- List all tables
\dt

-- List all policies
SELECT policyname, tablename, roles 
FROM pg_policies 
ORDER BY tablename, policyname;

-- Check table structure
\d table_name

-- Count tables created
SELECT count(*) FROM information_schema.tables 
WHERE table_schema = 'public';
```

## Rollback

To rollback a migration (remove a table):

```sql
DROP TABLE IF EXISTS table_name CASCADE;
```

**Warning**: This will delete all data in the table.

## Current Status

| Migration | Table | Status | Applied | Notes |
|-----------|-------|--------|---------|-------|
| 001 | user_profiles | ✅ Applied | Jan 2026 | User authentication |
| 002 | documents | ✅ Applied | Jan 2026 | User document tracking |
| 003 | chat_threads | ✅ Applied | Jan 2026 | Chat organization |
| 004 | chat_messages | ✅ Applied | Jan 2026 | Message storage |
| 005 | backend_documents | ✅ Applied | Jan 2026 | Backend metadata |
| 006 | document_chunks | ✅ Applied | Jan 2026 | Vector chunks |
| 007 | ingestion_logs | ✅ Applied | Jan 2026 | Audit trail |
| 008 | query_logs | ✅ Applied | Jan 2026 | Query tracking |

## Key Features

### Row Level Security (RLS)
All tables have RLS enabled to ensure data privacy:
- Users can only access their own data
- Backend service can manage backend tables
- Service keys bypass RLS when needed

### Indexes
Strategic indexes on all tables for performance:
- User ID queries (foreign key lookups)
- Date-based queries (created_at, updated_at)
- Status and type filtering
- Full-text search on keywords

### Timestamping
All tables include:
- `created_at` - When record was created
- `updated_at` - Last update time
- Additional event timestamps where relevant

### Cascading Deletes
Foreign key constraints use ON DELETE CASCADE:
- Deleting a user deletes their data
- Deleting a document deletes related chunks
- Maintains referential integrity

## Next Steps

1. ✅ Create all migrations
2. ✅ Apply to Supabase database
3. 📋 Add stored procedures for common operations
4. 📋 Create views for reporting and analytics
5. 📋 Add triggers for audit logging
6. 📋 Optimize indexes based on query patterns

## Documentation

Detailed documentation for each table:
- [User Profiles](#001-create-user-profiles-table)
- [Documents](#002-create-documents-table)
- [Chat Threads](#003-create-chat-threads-table)
- [Chat Messages](#004-create-chat-messages-table)
- [Backend Documents](#005-create-backend-documents-table)
- [Document Chunks](#006-create-document-chunks-table)
- [Ingestion Logs](#007-create-ingestion-logs-table)
- [Query Logs](#008-create-query-logs-table)

---

**Total Migrations**: 8  
**Total Tables Created**: 8  
**Total Policies**: 20+  
**Status**: 🟢 Production Ready
