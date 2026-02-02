# Document Ingestion Setup Guide

This guide walks through setting up and running the legal document ingestion pipeline for LegaLink360.

## Overview

The ingestion pipeline handles:
1. **Parsing** - Extract text from PDFs, DOCX, TXT files
2. **Chunking** - Split documents into semantic chunks with overlap
3. **Embedding** - Generate vector embeddings using OpenAI API
4. **Indexing** - Store vectors in Pinecone
5. **Metadata** - Store document metadata in PostgreSQL

## Prerequisites

### 1. Services & Accounts

You need accounts/services for:

- **Pinecone** (Vector Database)
  - Sign up: https://www.pinecone.io/
  - Free tier: 1M vectors, sufficient for MVP
  - Create index: `legalink360-legal-docs`
  - Index config:
    - Dimensions: 3072
    - Metric: cosine
    - Cloud: us-west-2-gcp

- **OpenAI** (Embeddings & LLM)
  - API key from: https://platform.openai.com/
  - Models used:
    - `text-embedding-3-large` (embeddings)
    - `gpt-4` (answer generation)
  - Ensure sufficient API credits

- **PostgreSQL** (Metadata Storage)
  - Using Supabase (already in your stack)
  - Or local PostgreSQL instance

### 2. Node.js Dependencies

Install required packages:

```bash
cd backend

npm install \
  @pinecone-database/pinecone \
  openai \
  pdf-parse \
  docx-parser \
  pg \
  uuid \
  dotenv
```

### 3. Environment Variables

Create `.env.local` in your backend directory:

```env
# OpenAI API
OPENAI_API_KEY=sk-xxxxx

# Pinecone
PINECONE_API_KEY=xxxxx
PINECONE_ENVIRONMENT=us-west-2-gcp

# PostgreSQL / Supabase
DATABASE_URL=postgresql://user:password@host:port/dbname

# Environment
NODE_ENV=development
```

## Quick Start (5 Minutes)

### Step 1: Set Up Pinecone Index

```bash
# Log into Pinecone console: https://app.pinecone.io

# Create new index with:
# - Name: legalink360-legal-docs
# - Dimensions: 3072
# - Metric: cosine
# - Region: us-west-2-gcp
# - Pod type: s1 (starter)
```

### Step 2: Initialize Database

```bash
# Run setup script
cd backend
npx ts-node scripts/ingestSampleDocuments.ts
```

This will:
- Create necessary database tables
- Create sample legal documents
- Ingest the 3 sample documents
- Test retrieval
- Clean up temporary files

### Step 3: Verify Ingestion

```bash
# Query database to see ingested documents
psql $DATABASE_URL -c "SELECT id, title, document_type FROM documents;"
```

You should see:
```
                   id                   |                                    title                                    | document_type
----------------------------------------+------------------------------------------------------------------------------+---------------
 xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx | Delaware Limited Liability Company Operating Agreement Template             | template
 xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx | Non-Compete and Confidentiality Agreement (California)                     | template
 xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx | Business Entity Formation: Overview and Comparison Guide                    | guide
```

## Detailed Walkthrough

### Understanding Document Chunking

Documents are split into overlapping chunks to preserve context:

```
Original Document (10,000 tokens)
        ↓
Split by sentences
        ↓
512-token chunks with 50-token overlap
        ↓
Example:
Chunk 1: tokens 0-512
Chunk 2: tokens 463-975 (overlap: tokens 463-512)
Chunk 3: tokens 926-1438 (overlap: tokens 926-975)
...
```

Why overlap?
- Prevents important context from being split across chunks
- Improves retrieval accuracy
- Small overhead for significant quality gain

### Understanding Embeddings

Embeddings are vector representations of text:

```
"What are voting rights in an LLC?" 
        ↓
OpenAI text-embedding-3-large
        ↓
[0.042, -0.123, 0.156, ..., 0.089] (3072 dimensions)
        ↓
Stored in Pinecone
        ↓
Similar documents retrieved by cosine similarity
```

Cost of embeddings:
- text-embedding-3-large: $0.02 per 1M tokens
- Processing 1,000 documents (~500K tokens total) ≈ $0.01

### Understanding Pinecone Indexing

Pinecone stores vectors and metadata:

```json
{
  "id": "doc-123-chunk-0",
  "values": [0.042, -0.123, 0.156, ..., 0.089],
  "metadata": {
    "document_id": "doc-123",
    "chunk_index": 0,
    "title": "Delaware LLC Operating Agreement",
    "jurisdiction": "Delaware",
    "practice_areas": "Business Formation|Corporate Law",
    "document_type": "template",
    "authority_level": "authoritative",
    "confidence_score": 1.0,
    "date_updated": "2024-01-15T00:00:00Z"
  }
}
```

Retrieval process:
1. User asks question
2. Embed question → vector
3. Query Pinecone with vector
4. Get top-K similar vectors
5. Return metadata + original documents from PostgreSQL

## Adding Your Own Documents

### Format 1: PDF File

```typescript
import { ingestDocument } from '../services/documentIngestion';

const result = await ingestDocument(
  '/path/to/document.pdf',
  {
    title: 'Delaware LLC Act',
    source: 'Delaware State Legislature',
    sourceUrl: 'https://delaware.gov/...',
    jurisdiction: ['US Federal', 'Delaware'],
    practiceAreas: ['Business Formation', 'Corporate Law'],
    documentType: 'statute',
    datePublished: new Date('1992-01-01'),
    dateUpdated: new Date('2024-01-15'),
    authorityLevel: 'authoritative',
    confidenceScore: 1.0,
    tags: ['LLC', 'Delaware', 'Statute', '6 Del. C. § 18-101']
  },
  db
);

console.log(`Ingested document with ${result.totalChunks} chunks`);
```

### Format 2: Batch Multiple Documents

```typescript
import { batchIngestDocuments } from '../services/documentIngestion';

const documents = [
  {
    filePath: '/path/to/doc1.pdf',
    metadata: { ... }
  },
  {
    filePath: '/path/to/doc2.txt',
    metadata: { ... }
  }
];

const results = await batchIngestDocuments(documents, db);
console.log(`Ingested ${results.length} documents`);
```

### Format 3: From URL

```typescript
import axios from 'axios';
import * as fs from 'fs';
import { ingestDocument } from '../services/documentIngestion';

// Download document
const response = await axios.get('https://example.com/document.pdf', {
  responseType: 'arraybuffer'
});

// Save temporarily
const tempPath = '/tmp/document.pdf';
fs.writeFileSync(tempPath, response.data);

// Ingest
const result = await ingestDocument(tempPath, metadata, db);

// Clean up
fs.unlinkSync(tempPath);
```

## Cost Estimation

For 5,000 documents (~2.5M tokens):

| Service | Cost |
|---------|------|
| OpenAI Embeddings | $0.05 |
| Pinecone (free tier) | $0 |
| PostgreSQL | $25-50 |
| **Total** | **$25-50** |

Monthly operational costs:
- 10,000 queries/month × $0.002/query = $20
- Total: ~$50/month

## Troubleshooting

### Issue: "Pinecone API key invalid"

```bash
# Verify API key
echo $PINECONE_API_KEY

# Check account at: https://app.pinecone.io/keys
```

### Issue: "Index not found"

```bash
# Verify index exists in Pinecone console
# OR create it programmatically:

import { Pinecone } from '@pinecone-database/pinecone';

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

await pc.createIndex({
  name: 'legalink360-legal-docs',
  dimension: 3072,
  metric: 'cosine',
  spec: {
    serverless: {
      cloud: 'aws',
      region: 'us-west-2'
    }
  }
});
```

### Issue: "Database connection error"

```bash
# Verify DATABASE_URL
psql $DATABASE_URL -c "SELECT 1;"

# Should output: 1 (success)
```

### Issue: "Out of memory when parsing large PDF"

```typescript
// For large PDFs, increase Node memory:
// package.json
{
  "scripts": {
    "ingest": "node --max-old-space-size=4096 ingestSampleDocuments.ts"
  }
}
```

## Monitoring Ingestion

Track ingestion progress in PostgreSQL:

```sql
-- Count documents by type
SELECT document_type, COUNT(*) as count
FROM documents
GROUP BY document_type;

-- Count chunks by document
SELECT title, COUNT(chunk_index) as chunk_count
FROM documents d
LEFT JOIN embeddings_metadata m ON d.id = m.document_id
GROUP BY d.id, title;

-- Find recent documents
SELECT title, date_updated
FROM documents
ORDER BY date_updated DESC
LIMIT 10;

-- Check document statistics
SELECT 
  COUNT(*) as total_documents,
  COUNT(DISTINCT document_id) as unique_documents,
  SUM(tokens_count) as total_tokens,
  AVG(tokens_count) as avg_tokens_per_chunk
FROM embeddings_metadata;
```

## Next Steps

1. **Expand Knowledge Base**
   - Add more documents (target: 5,000 for MVP)
   - Add state-specific statutes
   - Add case law
   - Add legal guides

2. **Test Retrieval**
   - Create test queries for each practice area
   - Measure retrieval accuracy
   - Adjust chunking if needed

3. **Integrate with Chat**
   - Connect ingestion to `/api/ingest` endpoint
   - Allow lawyers to upload documents
   - Show source citations in chat

4. **Monitor Quality**
   - Track lawyer review feedback
   - Identify weak areas
   - Continuously improve

## References

- [Pinecone Documentation](https://docs.pinecone.io/)
- [OpenAI Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
- [PostgreSQL Full-Text Search](https://www.postgresql.org/docs/current/textsearch.html)
- [Chunking Strategies](https://js.langchain.com/docs/modules/data_connection/document_loaders/file_loaders)

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review service documentation (links above)
3. Check API rate limits / quotas
4. Verify environment variables are set correctly
