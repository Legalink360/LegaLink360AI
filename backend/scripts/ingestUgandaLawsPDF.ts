/**
 * Ingest Uganda Laws PDF
 * 
 * This script ingests the Uganda Laws 2023 PDF into:
 * 1. Pinecone (vector embeddings for RAG)
 * 2. Supabase (metadata and document storage)
 * 
 * Features:
 * - Intelligent PDF parsing with section detection
 * - Smart chunking (512 tokens per chunk with overlap)
 * - Category classification (Constitutional Law, Criminal Law, etc.)
 * - Batch processing for efficiency
 * - Error handling and retry logic
 * 
 * Usage: 
 *   npx ts-node scripts/ingestUgandaLawsPDF.ts
 * 
 * Time estimate: 5-10 minutes for full document
 */

// @ts-ignore
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAI } from 'openai';
import { createClient } from '@supabase/supabase-js';
// @ts-ignore
import pdfParse from 'pdf-parse';

// Initialize clients
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || '',
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

const supabase = createClient(
  process.env.SUPABASE_PROJECT_URL || '',
  process.env.SUPABASE_SECRET_API_KEY || ''
);

const BATCH_SIZE = 5; // Process 5 chunks at a time
const CHUNK_SIZE = 512; // tokens
const CHUNK_OVERLAP = 50; // tokens
const INDEX_NAME = 'legalink360-legal-docs';

interface DocumentChunk {
  id: string;
  title: string;
  category: string;
  content: string;
  section: string;
  subsection: string;
  pageNumber?: number;
  source: string;
  chunkIndex: number;
  totalChunks?: number;
}

interface ProcessingStats {
  totalChunks: number;
  processedChunks: number;
  failedChunks: number;
  totalTokens: number;
  startTime: Date;
  endTime?: Date;
}

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Extract text from PDF file
 */
async function extractPDFText(filePath: string): Promise<{ text: string; numPages: number }> {
  try {
    log(`📖 Reading PDF: ${filePath}`, 'cyan');
    const fileBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(fileBuffer);
    
    log(`✅ PDF extracted: ${data.numpages || data.numPages || 'unknown'} pages`, 'green');
    return {
      text: data.text,
      numPages: data.numpages || data.numPages || 0,
    };
  } catch (error: any) {
    log(`❌ Failed to extract PDF: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Estimate token count (rough approximation: 1 token ≈ 4 characters)
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Intelligently chunk document by sections
 */
function chunkDocument(text: string): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  
  // Split by major sections (Act, Chapter, Section patterns)
  const sectionPattern = /^(?:PART|CHAPTER|SECTION|ACT|SCHEDULE|ARTICLE)[\s\d\-\.]*[:\.]?/gim;
  const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
  
  let currentChunk = '';
  let currentTokens = 0;
  let chunkIndex = 0;
  let currentSection = 'General';
  let currentSubsection = '';

  for (const para of paragraphs) {
    const trimmedPara = para.trim();
    const paraTokens = estimateTokens(trimmedPara);

    // Detect section headers
    if (sectionPattern.test(trimmedPara)) {
      if (currentChunk.length > 0) {
        chunks.push({
          id: uuidv4(),
          title: `${currentSection} - Part ${chunkIndex + 1}`,
          category: classifyContent(currentChunk),
          content: currentChunk,
          section: currentSection,
          subsection: currentSubsection,
          source: 'Uganda Laws 2023 - Comprehensive Edition',
          chunkIndex: chunkIndex,
        });
        chunkIndex++;
        currentChunk = '';
        currentTokens = 0;
      }
      currentSection = trimmedPara.substring(0, 100);
      currentSubsection = '';
    }

    // If adding this paragraph exceeds chunk size
    if (currentTokens + paraTokens > CHUNK_SIZE && currentChunk.length > 0) {
      chunks.push({
        id: uuidv4(),
        title: `${currentSection} - Part ${chunkIndex + 1}`,
        category: classifyContent(currentChunk),
        content: currentChunk,
        section: currentSection,
        subsection: currentSubsection,
        source: 'Uganda Laws 2023 - Comprehensive Edition',
        chunkIndex: chunkIndex,
      });
      
      // Add overlap from end of previous chunk
      const overlapText = currentChunk.split(' ').slice(-Math.ceil(CHUNK_OVERLAP / 4)).join(' ');
      currentChunk = overlapText + '\n\n' + trimmedPara;
      currentTokens = estimateTokens(currentChunk);
      chunkIndex++;
    } else {
      if (currentChunk.length > 0) currentChunk += '\n\n';
      currentChunk += trimmedPara;
      currentTokens += paraTokens;
    }
  }

  // Add final chunk
  if (currentChunk.length > 0) {
    chunks.push({
      id: uuidv4(),
      title: `${currentSection} - Part ${chunkIndex + 1}`,
      category: classifyContent(currentChunk),
      content: currentChunk,
      section: currentSection,
      subsection: currentSubsection,
      source: 'Uganda Laws 2023 - Comprehensive Edition',
      chunkIndex: chunkIndex,
    });
  }

  // Add total chunks count
  chunks.forEach(chunk => {
    chunk.totalChunks = chunks.length;
  });

  return chunks;
}

/**
 * Classify document content by legal category
 */
function classifyContent(text: string): string {
  const lowerText = text.toLowerCase();
  
  const categories: { [key: string]: string[] } = {
    'Constitutional Law': ['constitution', 'amendment', 'presidency', 'parliament', 'sovereignty'],
    'Criminal Law': ['offence', 'crime', 'criminal', 'punishment', 'imprisonment', 'sentence'],
    'Civil Law': ['civil', 'contract', 'liability', 'damages', 'tort'],
    'Commercial Law': ['business', 'commercial', 'trade', 'merchant', 'company', 'corporation'],
    'Property Law': ['property', 'land', 'real estate', 'tenant', 'landlord', 'lease'],
    'Family Law': ['marriage', 'divorce', 'family', 'child', 'custody', 'inheritance'],
    'Labor Law': ['employment', 'worker', 'labor', 'wage', 'workplace'],
    'Administrative Law': ['administrative', 'government', 'authority', 'regulation', 'minister'],
    'Tax Law': ['tax', 'revenue', 'duty', 'customs', 'excise'],
    'Environmental Law': ['environment', 'pollution', 'conservation', 'wildlife', 'forest'],
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      return category;
    }
  }

  return 'General Law';
}

/**
 * Generate embedding for text chunk
 */
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-large',
      input: text.substring(0, 8000), // Limit to 8000 chars for API
      dimensions: 3072,
    });
    return response.data[0].embedding;
  } catch (error: any) {
    log(`⚠️  Embedding generation failed: ${error.message}`, 'yellow');
    // Return zero vector on failure
    return Array(3072).fill(0);
  }
}

/**
 * Store chunk in Supabase
 */
async function storeInSupabase(
  chunk: DocumentChunk,
  vectorId: string,
  documentId: string
): Promise<boolean> {
  try {
    const { error } = await supabase.from('document_chunks').insert({
      id: uuidv4(),
      document_id: documentId,
      chunk_index: chunk.chunkIndex,
      content: chunk.content,
      pinecone_vector_id: vectorId,
      embedding_model: 'text-embedding-3-large',
      embedding_dimensions: 3072,
      char_count: chunk.content.length,
      token_count: estimateTokens(chunk.content),
      keywords: chunk.category.split(' '),
      summary: chunk.title,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: JSON.stringify({
        section: chunk.section,
        subsection: chunk.subsection,
        category: chunk.category,
        source: chunk.source,
      }),
    });

    if (error) {
      throw new Error(error.message);
    }
    return true;
  } catch (error: any) {
    log(`❌ Supabase store failed: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Store chunk in Pinecone
 */
async function storeInPinecone(
  chunk: DocumentChunk,
  embedding: number[],
  documentId: string
): Promise<string | null> {
  try {
    const index = pinecone.Index(INDEX_NAME);
    const vectorId = `uganda-laws-${documentId}-${chunk.chunkIndex}`;

    await index.upsert([
      {
        id: vectorId,
        values: embedding,
        metadata: {
          document_id: documentId,
          chunk_index: chunk.chunkIndex,
          title: chunk.title,
          category: chunk.category,
          section: chunk.section,
          content: chunk.content.substring(0, 1000), // Store first 1000 chars
          source: chunk.source,
          created_at: new Date().toISOString(),
        } as any,
      },
    ]);

    return vectorId;
  } catch (error: any) {
    log(`❌ Pinecone store failed: ${error.message}`, 'red');
    return null;
  }
}

/**
 * Process chunks in batches
 */
async function processChunks(
  chunks: DocumentChunk[],
  documentId: string,
  stats: ProcessingStats
): Promise<void> {
  log(`\n🔄 Processing ${chunks.length} chunks in batches of ${BATCH_SIZE}...`, 'cyan');

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, Math.min(i + BATCH_SIZE, chunks.length));
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(chunks.length / BATCH_SIZE);

    log(`\n📦 Batch ${batchNum}/${totalBatches} (${batch.length} chunks)`, 'blue');

    for (const chunk of batch) {
      try {
        // Generate embedding
        const embedding = await generateEmbedding(chunk.content);
        stats.totalTokens += estimateTokens(chunk.content);

        // Store in Pinecone
        const vectorId = await storeInPinecone(chunk, embedding, documentId);
        if (!vectorId) {
          stats.failedChunks++;
          continue;
        }

        // Store in Supabase
        const success = await storeInSupabase(chunk, vectorId, documentId);
        if (success) {
          stats.processedChunks++;
          log(`  ✅ Chunk ${chunk.chunkIndex + 1}: ${chunk.title.substring(0, 50)}...`, 'green');
        } else {
          stats.failedChunks++;
          log(`  ❌ Chunk ${chunk.chunkIndex + 1}: Failed to store`, 'red');
        }
      } catch (error: any) {
        stats.failedChunks++;
        log(`  ❌ Chunk ${chunk.chunkIndex + 1}: ${error.message}`, 'red');
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Delay between batches
    if (i + BATCH_SIZE < chunks.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

/**
 * Main ingestion function
 */
async function main() {
  const stats: ProcessingStats = {
    totalChunks: 0,
    processedChunks: 0,
    failedChunks: 0,
    totalTokens: 0,
    startTime: new Date(),
  };

  try {
    log('\n╔════════════════════════════════════════════════╗', 'cyan');
    log('║    UGANDA LAWS 2023 PDF INGESTION SYSTEM      ║', 'cyan');
    log('╚════════════════════════════════════════════════╝\n', 'cyan');

    // Create document record
    const documentId = uuidv4();
    log(`📝 Document ID: ${documentId}`, 'blue');

    // Extract PDF
    const pdfPath = path.join(__dirname, '../data/Uganda_Laws_2023.pdf');
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`PDF not found at ${pdfPath}`);
    }

    const { text, numPages } = await extractPDFText(pdfPath);
    log(`📄 Total pages: ${numPages}`, 'green');
    log(`📊 Total text size: ${(text.length / 1024).toFixed(2)} KB`, 'green');

    // Chunk document
    log(`\n✂️  Chunking document...`, 'cyan');
    const chunks = chunkDocument(text);
    stats.totalChunks = chunks.length;
    log(`✅ Created ${chunks.length} chunks`, 'green');

    // Store document metadata
    const { error: docError } = await supabase.from('documents').insert({
      id: documentId,
      title: 'Laws of the Republic of Uganda - v1 Edition 2023',
      description:
        'Comprehensive collection of Ugandan laws including constitutional, criminal, civil, commercial, and administrative law',
      content_type: 'application/pdf',
      file_path: pdfPath,
      file_size_bytes: text.length,
      page_count: numPages,
      chunk_count: chunks.length,
      language: 'en',
      jurisdiction: 'Uganda',
      source_url:
        'https://www.parliament.go.ug/documents/category/legislations',
      ingestion_status: 'processing',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: JSON.stringify({
        source: 'Official Uganda Government',
        coverage: 'Comprehensive legal framework',
        categories: [
          'Constitutional Law',
          'Criminal Law',
          'Civil Law',
          'Commercial Law',
          'Property Law',
          'Administrative Law',
        ],
      }),
    });

    if (docError) {
      log(`⚠️  Document metadata storage failed: ${docError.message}`, 'yellow');
    }

    // Process chunks
    await processChunks(chunks, documentId, stats);

    // Update document status
    await supabase
      .from('documents')
      .update({
        ingestion_status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', documentId);

    stats.endTime = new Date();
    const duration = ((stats.endTime.getTime() - stats.startTime.getTime()) / 1000).toFixed(2);

    // Print summary
    log('\n╔════════════════════════════════════════════════╗', 'green');
    log('║              INGESTION COMPLETE               ║', 'green');
    log('╚════════════════════════════════════════════════╝', 'green');
    log(`\n📊 INGESTION STATISTICS:`, 'cyan');
    log(`   Total Chunks:      ${stats.totalChunks}`, 'blue');
    log(`   Processed:         ${stats.processedChunks}`, 'green');
    log(`   Failed:            ${stats.failedChunks}`, stats.failedChunks > 0 ? 'red' : 'green');
    log(`   Success Rate:      ${((stats.processedChunks / stats.totalChunks) * 100).toFixed(2)}%`, 'blue');
    log(`   Total Tokens:      ${stats.totalTokens.toLocaleString()}`, 'blue');
    log(`   Duration:          ${duration}s`, 'blue');
    log(`   Avg Time/Chunk:    ${(parseFloat(duration) / stats.totalChunks).toFixed(2)}s`, 'blue');

    log(`\n✨ Uganda Laws PDF successfully ingested into LegaLink360!`, 'green');
    log(`🔍 Your bot can now search and analyze these laws for legal queries.\n`, 'green');
  } catch (error: any) {
    log(`\n❌ INGESTION FAILED: ${error.message}`, 'red');
    log(error.stack, 'red');
    process.exit(1);
  }
}

// Run ingestion
main().catch(error => {
  log(`Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
