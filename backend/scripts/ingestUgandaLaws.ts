/**
 * Ingest Uganda Laws Data
 * 
 * This script ingests the Uganda laws data from ugandanLawsData.ts into:
 * 1. Pinecone (vector embeddings)
 * 2. Supabase (metadata storage)
 * 
 * Usage: npm run ingest-uganda-laws
 */

// @ts-ignore - uuid doesn't have proper TypeScript definitions in all versions
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAI } from 'openai';
import { createClient } from '@supabase/supabase-js';
import { UGANDA_LAWS_CHUNKS, UGANDA_LAWS_METADATA } from '../data/ugandanLawsData';

// Initialize clients
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || '',
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

interface DocumentChunk {
  id: string;
  title: string;
  category: string;
  content: string;
  source: string;
  chunkIndex: number;
}

async function ingestionLogger(
  operation: string,
  status: 'started' | 'completed' | 'failed',
  itemsProcessed: number = 0,
  errorMessage: string = ''
) {
  console.log(`[${new Date().toISOString()}] ${operation} - ${status.toUpperCase()}`);
  if (itemsProcessed > 0) console.log(`  Items: ${itemsProcessed}`);
  if (errorMessage) console.log(`  Error: ${errorMessage}`);
}

async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-large',
      input: text,
      dimensions: 3072,
    });
    return response.data[0].embedding;
  } catch (error: any) {
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }
}

async function storeInSupabase(chunk: DocumentChunk, vectorId: string, documentId: string) {
  try {
    const { data, error } = await supabase
      .from('document_chunks')
      .insert({
        id: uuidv4(),
        document_id: documentId,
        chunk_index: chunk.chunkIndex,
        content: chunk.content,
        pinecone_vector_id: vectorId,
        embedding_model: 'text-embedding-3-large',
        embedding_dimensions: 3072,
        char_count: chunk.content.length,
        token_count: Math.ceil(chunk.content.length / 4), // Approximate token count
        keywords: chunk.category.split(' '),
        summary: chunk.title,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error) {
      throw new Error(`Supabase insert failed: ${error.message}`);
    }

    return data;
  } catch (error: any) {
    throw new Error(`Failed to store in Supabase: ${error.message}`);
  }
}

async function ingestUgandaLawsData() {
  console.log('\n' + '='.repeat(70));
  console.log('🇺🇬 LEGALINK360 - UGANDA LAWS DATA INGESTION');
  console.log('='.repeat(70) + '\n');

  let successCount = 0;
  let failureCount = 0;

  try {
    // Step 1: Create document record in backend_documents
    console.log('Step 1️⃣  Creating document metadata...');
    await ingestionLogger('Create metadata', 'started');

    const documentId = uuidv4();
    const { data: docData, error: docError } = await supabase
      .from('backend_documents')
      .insert({
        id: documentId,
        title: UGANDA_LAWS_METADATA.title,
        description: UGANDA_LAWS_METADATA.description,
        file_name: 'Laws of the Republic of Uganda - v3 Edition 2023.pdf',
        document_type: UGANDA_LAWS_METADATA.documentType,
        status: 'processing',
        total_chunks: UGANDA_LAWS_CHUNKS.length,
        indexed_chunks: 0,
        vector_count: 0,
        keywords: Object.keys(
          require('../data/ugandanLawsData').UGANDA_LAWS_TOPICS
        ),
        summary: UGANDA_LAWS_METADATA.description,
        author: 'Government of Uganda',
        created_at: new Date().toISOString(),
      })
      .select();

    if (docError) {
      throw new Error(`Failed to create document metadata: ${docError.message}`);
    }

    await ingestionLogger('Create metadata', 'completed', 1);
    console.log(`   ✓ Document ID: ${documentId}`);
    console.log(`   ✓ Document created in backend_documents\n`);

    // Step 2: Process chunks
    console.log(`Step 2️⃣  Processing ${UGANDA_LAWS_CHUNKS.length} chunks...\n`);

    const vectorsToInsert: any[] = [];

    for (let i = 0; i < UGANDA_LAWS_CHUNKS.length; i++) {
      const chunk = UGANDA_LAWS_CHUNKS[i];
      const progress = `[${i + 1}/${UGANDA_LAWS_CHUNKS.length}]`;

      try {
        // Generate embedding
        console.log(`   ${progress} Generating embedding for: ${chunk.title}`);
        const embedding = await generateEmbedding(chunk.content);

        // Prepare vector for Pinecone
        const vectorId = `uganda-law-${i}`;
        vectorsToInsert.push({
          id: vectorId,
          values: embedding,
          metadata: {
            chunkId: chunk.id,
            title: chunk.title,
            category: chunk.category,
            source: chunk.source,
            chunkIndex: chunk.chunkIndex,
            textContent: chunk.content.substring(0, 500), // Store preview
          },
        });

        // Store in Supabase
        await storeInSupabase(chunk, vectorId, documentId);
        successCount++;
        console.log(`   ✓ Embedded and stored\n`);
      } catch (error: any) {
        failureCount++;
        console.log(`   ✗ Failed: ${error.message}\n`);
      }

      // Rate limiting (avoid API overload)
      if ((i + 1) % 5 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // Step 3: Upload to Pinecone
    console.log(`\nStep 3️⃣  Uploading ${vectorsToInsert.length} vectors to Pinecone...\n`);
    await ingestionLogger('Upload to Pinecone', 'started');

    const indexName = process.env.PINECONE_INDEX_NAME || 'legalink360-legal-docs';
    const index = pinecone.Index(indexName);

    // Batch upload vectors (Pinecone allows up to 100 vectors per request)
    const batchSize = 20;
    for (let i = 0; i < vectorsToInsert.length; i += batchSize) {
      const batch = vectorsToInsert.slice(i, i + batchSize);
      await index.upsert(batch);
      console.log(`   ✓ Uploaded batch ${Math.floor(i / batchSize) + 1}\n`);
    }

    await ingestionLogger('Upload to Pinecone', 'completed', vectorsToInsert.length);

    // Step 4: Verify ingestion
    console.log('Step 4️⃣  Verifying ingestion...\n');
    const stats = await index.describeIndexStats();
    console.log(`   Total vectors in index: ${stats.totalRecordCount}`);
    console.log(`   Index ready: ${stats.totalRecordCount ? '✓' : '✗'}\n`);

    // Step 5: Update document status
    console.log('Step 5️⃣  Finalizing document...\n');
    const { error: updateError } = await supabase
      .from('backend_documents')
      .update({
        status: 'indexed',
        indexed_chunks: successCount,
        vector_count: successCount,
        processing_completed_at: new Date().toISOString(),
      })
      .eq('id', documentId);

    if (updateError) {
      console.log(`   ✗ Failed to update status: ${updateError.message}`);
    } else {
      console.log(`   ✓ Document status updated to 'indexed'\n`);
    }

    // Summary
    console.log('='.repeat(70));
    console.log('✅ INGESTION SUMMARY');
    console.log('='.repeat(70));
    console.log(`Document Title:        ${UGANDA_LAWS_METADATA.title}`);
    console.log(`Source:                ${UGANDA_LAWS_METADATA.source}`);
    console.log(`Total Chunks:          ${UGANDA_LAWS_CHUNKS.length}`);
    console.log(`Successfully Ingested: ${successCount}`);
    console.log(`Failed:                ${failureCount}`);
    console.log(`Success Rate:          ${((successCount / UGANDA_LAWS_CHUNKS.length) * 100).toFixed(1)}%`);
    console.log(`Vectors in Pinecone:   ${stats.totalRecordCount}`);
    console.log(`Index Name:            ${indexName}`);
    console.log(`Status:                READY FOR QUERIES`);
    console.log('='.repeat(70) + '\n');

    // Next steps
    console.log('🚀 NEXT STEPS:');
    console.log('1. Test vector search queries');
    console.log('2. Verify metadata in Supabase');
    console.log('3. Test with frontend chat interface');
    console.log('4. Monitor performance and costs\n');

    if (failureCount > 0) {
      console.log(
        `⚠️  WARNING: ${failureCount} chunks failed to ingest. Review logs above.\n`
      );
      process.exit(1);
    }

    process.exit(0);
  } catch (error: any) {
    console.error(`\n❌ INGESTION FAILED: ${error.message}\n`);
    console.error(error);
    process.exit(1);
  }
}

// Run the ingestion
ingestUgandaLawsData();
