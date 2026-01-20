/**
 * Document Ingestion Example Script
 * 
 * Usage:
 * ts-node ingestSampleDocuments.ts
 * 
 * This script demonstrates:
 * 1. Ingesting sample legal documents
 * 2. Chunking and embedding
 * 3. Indexing in Pinecone
 * 4. Storing metadata in PostgreSQL
 */

import { ingestDocument, batchIngestDocuments } from '../services/documentIngestion';
import { SAMPLE_DOCUMENTS } from '../data/sampleDocuments';
import * as fs from 'fs';
import * as path from 'path';
import * as pg from 'pg';

// Initialize PostgreSQL connection
const dbPool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Get database connection
async function getDb() {
  return dbPool;
}

/**
 * Create necessary database tables if they don't exist
 */
async function initializeDatabase() {
  const db = await getDb();

  try {
    console.log('Initializing database tables...\n');

    // Create documents table
    await db.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id UUID PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        source VARCHAR(500),
        source_url VARCHAR(500),
        jurisdiction JSONB,
        practice_areas JSONB,
        document_type VARCHAR(50),
        authority_level VARCHAR(50),
        confidence_score FLOAT,
        date_published TIMESTAMP,
        date_updated TIMESTAMP,
        tags JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create embeddings_metadata table
    await db.query(`
      CREATE TABLE IF NOT EXISTS embeddings_metadata (
        id UUID PRIMARY KEY,
        document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
        chunk_index INT,
        vector_id VARCHAR(100),
        chunk_text TEXT,
        tokens_count INT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create qa_history table
    await db.query(`
      CREATE TABLE IF NOT EXISTS qa_history (
        id UUID PRIMARY KEY,
        user_id UUID,
        question TEXT,
        answer TEXT,
        sources JSONB,
        jurisdiction VARCHAR(100),
        status VARCHAR(50) DEFAULT 'pending',
        lawyer_review_notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('✓ Database tables initialized\n');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

/**
 * Save sample documents to temporary files
 */
async function createSampleDocumentFiles(): Promise<Array<{ filePath: string; metadata: any }>> {
  const tempDir = path.join(process.cwd(), '.temp_documents');

  // Create temp directory if it doesn't exist
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const documentPaths: Array<{ filePath: string; metadata: any }> = [];

  for (const doc of SAMPLE_DOCUMENTS) {
    const filePath = path.join(tempDir, doc.name);

    // Write document content to file
    fs.writeFileSync(filePath, doc.content, 'utf-8');

    documentPaths.push({
      filePath,
      metadata: doc.metadata,
    });

    console.log(`✓ Created sample document: ${doc.name}`);
  }

  console.log(`\n✓ All ${SAMPLE_DOCUMENTS.length} sample documents created in .temp_documents/\n`);

  return documentPaths;
}

/**
 * Main ingestion workflow
 */
async function runIngestion() {
  const db = await getDb();

  try {
    console.log('========================================');
    console.log('LegaLink360 - Document Ingestion Demo');
    console.log('========================================\n');

    // Step 1: Initialize database
    console.log('STEP 1: Initialize Database');
    console.log('----------------------------------');
    await initializeDatabase();

    // Step 2: Create sample document files
    console.log('STEP 2: Create Sample Document Files');
    console.log('----------------------------------');
    const documentPaths = await createSampleDocumentFiles();

    // Step 3: Ingest documents
    console.log('STEP 3: Ingest Documents');
    console.log('----------------------------------');
    const ingestedDocuments = await batchIngestDocuments(documentPaths, db);

    // Step 4: Summary
    console.log('\n========================================');
    console.log('Ingestion Summary');
    console.log('========================================\n');

    console.log(`Total documents ingested: ${ingestedDocuments.length}`);
    console.log(`Total chunks created: ${ingestedDocuments.reduce((sum, d) => sum + d.totalChunks, 0)}`);

    for (const doc of ingestedDocuments) {
      console.log(`\n📄 ${doc.title}`);
      console.log(`   Document ID: ${doc.documentId}`);
      console.log(`   Chunks: ${doc.totalChunks}`);
      console.log(`   Practice Areas: ${doc.metadata.practiceAreas.join(', ')}`);
      console.log(`   Jurisdiction: ${doc.metadata.jurisdiction.join(', ')}`);
      console.log(`   Confidence: ${(doc.metadata.confidenceScore * 100).toFixed(0)}%`);
    }

    // Step 5: Test retrieval
    console.log('\n========================================');
    console.log('Test Retrieval');
    console.log('========================================\n');

    await testRetrieval();

    console.log('\n✅ Ingestion completed successfully!\n');
  } catch (error) {
    console.error('❌ Ingestion failed:', error);
    throw error;
  } finally {
    // Cleanup: Remove temp documents
    const tempDir = path.join(process.cwd(), '.temp_documents');
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
      console.log('✓ Cleaned up temporary files');
    }

    // Close database connection
    await db.end();
  }
}

/**
 * Test retrieval from Pinecone
 */
async function testRetrieval() {
  const { Pinecone } = await import('@pinecone-database/pinecone');
  const { OpenAI } = await import('openai');

  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const testQueries = [
    'What are the voting rights in an LLC operating agreement?',
    'How does California law treat non-compete agreements?',
    'What is the difference between an LLC and a Corporation?',
  ];

  console.log('Testing semantic search with sample queries:\n');

  for (const query of testQueries) {
    // Embed the query
    const embedding = await openai.embeddings.create({
      model: 'text-embedding-3-large',
      input: query,
    });

    // Search Pinecone
    const pineconeIndex = pinecone.index('legalink360-legal-docs');
    const results = await pineconeIndex.query({
      vector: embedding.data[0].embedding as number[],
      topK: 3,
      includeMetadata: true,
    });

    console.log(`Query: "${query}"`);
    console.log('Top Results:');

    for (let i = 0; i < Math.min(results.matches.length, 3); i++) {
      const match = results.matches[i];
      console.log(
        `  ${i + 1}. ${match.metadata?.title} (Score: ${(match.score * 100).toFixed(1)}%)`
      );
      console.log(`     Type: ${match.metadata?.document_type}`);
      console.log(`     Authority: ${match.metadata?.authority_level}`);
    }

    console.log('');
  }
}

/**
 * Query database statistics
 */
async function getStatistics(db: pg.Pool) {
  try {
    const docCount = await db.query('SELECT COUNT(*) as count FROM documents');
    const chunkCount = await db.query('SELECT COUNT(*) as count FROM embeddings_metadata');
    const totalTokens = await db.query('SELECT SUM(tokens_count) as total FROM embeddings_metadata');

    console.log('\nDatabase Statistics:');
    console.log(`- Documents: ${docCount.rows[0].count}`);
    console.log(`- Chunks: ${chunkCount.rows[0].count}`);
    console.log(`- Total Tokens: ${totalTokens.rows[0].total || 0}`);
  } catch (error) {
    console.error('Error querying statistics:', error);
  }
}

// Run the ingestion if this script is executed directly
if (require.main === module) {
  runIngestion().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { runIngestion, initializeDatabase, createSampleDocumentFiles };
