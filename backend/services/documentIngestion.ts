/**
 * LegaLink360 - Legal Document Ingestion Service
 * 
 * This module handles:
 * 1. Document parsing (PDF, TXT, DOCX)
 * 2. Text chunking with overlap
 * 3. Embedding generation (OpenAI)
 * 4. Vector indexing (Pinecone)
 * 5. Metadata storage (PostgreSQL)
 */

import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAI } from 'openai';
import * as pdfParse from 'pdf-parse';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Initialize clients
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Types
interface DocumentMetadata {
  title: string;
  source: string;
  sourceUrl?: string;
  jurisdiction: string[];
  practiceAreas: string[];
  documentType: 'statute' | 'case_law' | 'template' | 'guide' | 'precedent';
  datePublished: Date;
  dateUpdated: Date;
  authorityLevel: 'authoritative' | 'secondary' | 'tertiary';
  confidenceScore: number;
  tags: string[];
}

interface ChunkedDocument {
  chunkIndex: number;
  text: string;
  startOffset: number;
  endOffset: number;
  tokens: number;
}

interface IngestedDocument {
  documentId: string;
  title: string;
  chunks: ChunkedDocument[];
  totalChunks: number;
  embedding: number[];
  metadata: DocumentMetadata;
  pineconeId: string;
}

/**
 * Parse different document formats
 */
async function parseDocument(
  filePath: string
): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.pdf') {
    return await parsePDF(filePath);
  } else if (ext === '.txt') {
    return await parseTXT(filePath);
  } else if (ext === '.docx') {
    return await parseDOCX(filePath);
  } else {
    throw new Error(`Unsupported file format: ${ext}`);
  }
}

/**
 * Parse PDF files
 */
async function parsePDF(filePath: string): Promise<string> {
  const fileBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(fileBuffer);
  
  // Extract text and preserve structure
  let extractedText = '';
  
  // Include metadata if available
  if (data.info?.Title) {
    extractedText += `Title: ${data.info.Title}\n\n`;
  }
  
  // Extract text from all pages
  extractedText += data.text;
  
  return extractedText;
}

/**
 * Parse TXT files
 */
async function parseTXT(filePath: string): Promise<string> {
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * Parse DOCX files (simplified - in production use docx-parser)
 */
async function parseDOCX(filePath: string): Promise<string> {
  // Note: requires npm install docx-parser
  // For now, return placeholder
  console.warn('DOCX parsing requires additional setup. Using placeholder.');
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * Chunk document text with overlap
 * 
 * Strategy:
 * - Split by sentences/paragraphs
 * - Target: 512 tokens per chunk
 * - Overlap: 50 tokens between chunks
 * - Preserve: Section headers, legal citations
 */
function chunkDocument(
  text: string,
  chunkSize: number = 512,
  overlap: number = 50
): ChunkedDocument[] {
  const chunks: ChunkedDocument[] = [];
  
  // Split by sentences (preserve paragraph structure)
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  
  let currentChunk = '';
  let currentTokens = 0;
  let startOffset = 0;
  let chunkIndex = 0;

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i].trim();
    const sentenceTokens = estimateTokens(sentence);

    // If adding this sentence exceeds chunk size, save current chunk
    if (currentTokens + sentenceTokens > chunkSize && currentChunk.length > 0) {
      chunks.push({
        chunkIndex: chunkIndex++,
        text: currentChunk.trim(),
        startOffset,
        endOffset: startOffset + currentChunk.length,
        tokens: currentTokens,
      });

      // Create overlap by keeping last 50 tokens worth of text
      const overlapText = getLastNTokens(currentChunk, overlap);
      currentChunk = overlapText + ' ' + sentence;
      currentTokens = estimateTokens(currentChunk);
      startOffset += currentChunk.length - overlapText.length;
    } else {
      currentChunk += ' ' + sentence;
      currentTokens += sentenceTokens;
    }
  }

  // Add remaining text
  if (currentChunk.trim().length > 0) {
    chunks.push({
      chunkIndex: chunkIndex,
      text: currentChunk.trim(),
      startOffset,
      endOffset: startOffset + currentChunk.length,
      tokens: currentTokens,
    });
  }

  return chunks;
}

/**
 * Estimate tokens (approximation: ~1 token per 4 characters)
 * For accurate count, use OpenAI tokenizer
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Get last N tokens worth of text (for overlap)
 */
function getLastNTokens(text: string, tokenCount: number): string {
  const charCount = tokenCount * 4; // Rough approximation
  return text.slice(-charCount);
}

/**
 * Generate embeddings for text chunks
 */
async function generateEmbeddings(
  chunks: ChunkedDocument[]
): Promise<number[][]> {
  console.log(`Generating embeddings for ${chunks.length} chunks...`);

  const embeddings: number[][] = [];

  // Process in batches (OpenAI recommends batching for efficiency)
  const batchSize = 100;
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-large',
        input: batch.map(c => c.text),
        dimensions: 3072, // text-embedding-3-large produces 3072-dimensional vectors
      });

      for (const embedding of response.data) {
        embeddings.push(embedding.embedding as number[]);
      }

      console.log(`Embedded ${i + batch.length}/${chunks.length} chunks`);
    } catch (error) {
      console.error(`Error generating embeddings for batch ${i}-${i + batchSize}:`, error);
      throw error;
    }
  }

  return embeddings;
}

/**
 * Index vectors in Pinecone
 */
async function indexInPinecone(
  documentId: string,
  chunks: ChunkedDocument[],
  embeddings: number[][],
  metadata: DocumentMetadata
): Promise<string[]> {
  console.log(`Indexing ${chunks.length} vectors in Pinecone...`);

  const pineconeIndex = pinecone.index('legalink360-legal-docs');
  const vectorIds: string[] = [];

  // Prepare vectors for upsert
  const vectors = chunks.map((chunk, idx) => {
    const vectorId = `${documentId}-chunk-${chunk.chunkIndex}`;
    vectorIds.push(vectorId);

    return {
      id: vectorId,
      values: embeddings[idx],
      metadata: {
        document_id: documentId,
        chunk_index: chunk.chunkIndex,
        chunk_text: chunk.text.substring(0, 1000), // Store first 1000 chars for reference
        title: metadata.title,
        source: metadata.source,
        jurisdiction: metadata.jurisdiction.join('|'),
        practice_areas: metadata.practiceAreas.join('|'),
        document_type: metadata.documentType,
        authority_level: metadata.authorityLevel,
        confidence_score: metadata.confidenceScore,
        date_updated: metadata.dateUpdated.toISOString(),
      },
    };
  });

  // Upsert in batches (Pinecone has limits)
  const upsertBatchSize = 100;
  for (let i = 0; i < vectors.length; i += upsertBatchSize) {
    const batch = vectors.slice(i, i + upsertBatchSize);
    
    try {
      await pineconeIndex.upsert(batch);
      console.log(`Upserted ${i + batch.length}/${vectors.length} vectors`);
    } catch (error) {
      console.error(`Error upserting batch ${i}-${i + upsertBatchSize}:`, error);
      throw error;
    }
  }

  return vectorIds;
}

/**
 * Store document metadata in PostgreSQL
 */
async function storeDocumentMetadata(
  documentId: string,
  chunks: ChunkedDocument[],
  vectorIds: string[],
  metadata: DocumentMetadata,
  db: any // Your database client
): Promise<void> {
  console.log('Storing document metadata in PostgreSQL...');

  // Insert document record
  const docResult = await db.query(
    `INSERT INTO documents (
      id, title, content, source, source_url, jurisdiction, 
      practice_areas, document_type, authority_level, 
      confidence_score, date_published, date_updated, tags
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING id`,
    [
      documentId,
      metadata.title,
      chunks.map(c => c.text).join('\n\n'), // Store full content
      metadata.source,
      metadata.sourceUrl,
      JSON.stringify(metadata.jurisdiction),
      JSON.stringify(metadata.practiceAreas),
      metadata.documentType,
      metadata.authorityLevel,
      metadata.confidenceScore,
      metadata.datePublished,
      metadata.dateUpdated,
      JSON.stringify(metadata.tags),
    ]
  );

  // Insert chunk metadata
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const vectorId = vectorIds[i];

    await db.query(
      `INSERT INTO embeddings_metadata (
        id, document_id, chunk_index, vector_id, chunk_text, tokens_count
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        uuidv4(),
        documentId,
        chunk.chunkIndex,
        vectorId,
        chunk.text,
        chunk.tokens,
      ]
    );
  }

  console.log('Metadata stored successfully');
}

/**
 * Main ingestion function - ties everything together
 */
async function ingestDocument(
  filePath: string,
  metadata: DocumentMetadata,
  db: any
): Promise<IngestedDocument> {
  console.log(`\n=== Starting Document Ingestion ===`);
  console.log(`File: ${filePath}`);
  console.log(`Title: ${metadata.title}`);
  console.log(`Jurisdiction: ${metadata.jurisdiction.join(', ')}`);
  console.log(`Practice Areas: ${metadata.practiceAreas.join(', ')}`);

  try {
    // Step 1: Parse document
    console.log('\n[1/5] Parsing document...');
    const rawText = await parseDocument(filePath);
    console.log(`Parsed ${rawText.length} characters`);

    // Step 2: Chunk document
    console.log('\n[2/5] Chunking document...');
    const chunks = chunkDocument(rawText);
    console.log(`Created ${chunks.length} chunks`);
    console.log(`Tokens per chunk: ${chunks.map(c => c.tokens).join(', ').substring(0, 50)}...`);

    // Step 3: Generate embeddings
    console.log('\n[3/5] Generating embeddings...');
    const embeddings = await generateEmbeddings(chunks);
    console.log(`Generated ${embeddings.length} embeddings`);

    // Step 4: Index in Pinecone
    console.log('\n[4/5] Indexing in Pinecone...');
    const documentId = uuidv4();
    const vectorIds = await indexInPinecone(documentId, chunks, embeddings, metadata);
    console.log(`Indexed ${vectorIds.length} vectors`);

    // Step 5: Store metadata in PostgreSQL
    console.log('\n[5/5] Storing metadata in PostgreSQL...');
    await storeDocumentMetadata(documentId, chunks, vectorIds, metadata, db);

    console.log('\n=== Ingestion Complete ===\n');

    return {
      documentId,
      title: metadata.title,
      chunks,
      totalChunks: chunks.length,
      embedding: embeddings[0], // Return first chunk's embedding as sample
      metadata,
      pineconeId: vectorIds[0],
    };
  } catch (error) {
    console.error('Ingestion failed:', error);
    throw error;
  }
}

/**
 * Batch ingest multiple documents
 */
async function batchIngestDocuments(
  documentPaths: Array<{ filePath: string; metadata: DocumentMetadata }>,
  db: any
): Promise<IngestedDocument[]> {
  const results: IngestedDocument[] = [];

  for (const doc of documentPaths) {
    try {
      const result = await ingestDocument(doc.filePath, doc.metadata, db);
      results.push(result);
    } catch (error) {
      console.error(`Failed to ingest ${doc.filePath}:`, error);
      // Continue with next document
    }
  }

  return results;
}

export {
  ingestDocument,
  batchIngestDocuments,
  parseDocument,
  chunkDocument,
  generateEmbeddings,
  indexInPinecone,
  storeDocumentMetadata,
  DocumentMetadata,
  IngestedDocument,
  ChunkedDocument,
};
