import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { RetrievalService } from './services/retrievalService';
import { LLMService } from './services/llmService';

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.APP_PORT || 3001;

// Initialize services
const retrievalService = new RetrievalService();
const llmService = new LLMService();

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// ============================================================================
// HEALTH CHECK
// ============================================================================
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'LegaLink360 Backend',
    version: '1.0.0',
  });
});

// ============================================================================
// RETRIEVAL API
// ============================================================================
/**
 * POST /api/retrieve
 * Search for relevant legal documents
 */
app.post('/api/retrieve', async (req: Request, res: Response) => {
  try {
    const { query, topK = 5 } = req.body;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        error: 'Query is required',
      });
    }

    console.log(`\n${'='.repeat(70)}`);
    console.log(`🔍 RETRIEVE REQUEST`);
    console.log(`${'='.repeat(70)}`);
    console.log(`Query: ${query}`);

    const startTime = Date.now();

    // Search for relevant documents
    const results = await retrievalService.semanticSearch(query, topK);

    const elapsedTime = Date.now() - startTime;

    console.log(`${'='.repeat(70)}`);
    console.log(`Results: ${results.length} documents found`);
    console.log(`Time: ${elapsedTime}ms`);
    console.log(`${'='.repeat(70)}\n`);

    res.json({
      success: true,
      query: query,
      resultsCount: results.length,
      elapsedTime: `${elapsedTime}ms`,
      results: results.map((r, i) => ({
        rank: i + 1,
        id: r.id,
        title: r.title,
        content: r.content.substring(0, 500) + (r.content.length > 500 ? '...' : ''),
        relevanceScore: `${(r.relevanceScore * 100).toFixed(1)}%`,
        category: r.category,
        chunkIndex: r.chunkIndex,
      })),
    });
  } catch (error: any) {
    console.error(`❌ Retrieval error: ${error.message}\n`);
    res.status(500).json({
      error: 'Retrieval failed',
      message: error.message,
    });
  }
});

// ============================================================================
// QUERY API (with LLM)
// ============================================================================
/**
 * POST /api/query
 * Full RAG pipeline: retrieve + generate answer
 */
app.post('/api/query', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Query is required' });
    }

    console.log(`\n${'='.repeat(70)}`);
    console.log(`❓ QUERY REQUEST`);
    console.log(`${'='.repeat(70)}`);
    console.log(`Query: ${query}`);

    const startTime = Date.now();

    // Step 1: Retrieve relevant documents
    console.log('\nStep 1: RETRIEVAL');
    console.log('─'.repeat(70));
    const documents = await retrievalService.semanticSearch(query, 5);

    if (documents.length === 0) {
      console.log('No documents found');
      return res.json({
        success: true,
        query: query,
        answer:
          'I could not find any relevant legal documents to answer your question. Please try rephrasing your question.',
        sources: [],
        elapsedTime: `${Date.now() - startTime}ms`,
      });
    }

    // Step 2: Generate answer using LLM
    console.log('\nStep 2: ANSWER GENERATION');
    console.log('─'.repeat(70));
    const answer = await llmService.generateAnswer(query, documents);

    // Step 3: Format response with sources
    const sources = documents.map((doc, i) => ({
      rank: i + 1,
      id: doc.id,
      title: doc.title,
      category: doc.category,
      relevanceScore: `${(doc.relevanceScore * 100).toFixed(1)}%`,
    }));

    const elapsedTime = Date.now() - startTime;

    console.log(`${'='.repeat(70)}`);
    console.log(`✅ Query complete`);
    console.log(`   Sources: ${documents.length}`);
    console.log(`   Time: ${elapsedTime}ms`);
    console.log(`${'='.repeat(70)}\n`);

    res.json({
      success: true,
      query: query,
      answer: answer,
      sources: sources,
      sourceCount: documents.length,
      elapsedTime: `${elapsedTime}ms`,
    });
  } catch (error: any) {
    console.error(`❌ Query error: ${error.message}\n`);
    res.status(500).json({
      error: 'Query processing failed',
      message: error.message,
    });
  }
});

// ============================================================================
// STREAMING API
// ============================================================================
/**
 * POST /api/query/stream
 * Stream answer for real-time display
 */
app.post('/api/query/stream', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Query is required' });
    }

    console.log(`\n${'='.repeat(70)}`);
    console.log(`📡 STREAM REQUEST`);
    console.log(`${'='.repeat(70)}`);
    console.log(`Query: ${query}\n`);

    const startTime = Date.now();

    // Retrieve documents
    console.log('Step 1: RETRIEVAL');
    console.log('─'.repeat(70));
    const documents = await retrievalService.semanticSearch(query, 5);

    if (documents.length === 0) {
      console.log('No documents found\n');
      res.setHeader('Content-Type', 'application/json');
      res.json({
        answer:
          'I could not find any relevant legal documents to answer your question.',
        sources: [],
      });
      return;
    }

    // Set up streaming response
    console.log('Step 2: STREAMING ANSWER');
    console.log('─'.repeat(70));
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Stream answer chunks
    let chunkCount = 0;
    for await (const chunk of llmService.generateAnswerStream(query, documents)) {
      chunkCount++;
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    }

    // Send sources at the end
    const sources = documents.map((doc, i) => ({
      rank: i + 1,
      title: doc.title,
      category: doc.category,
      relevanceScore: `${(doc.relevanceScore * 100).toFixed(1)}%`,
    }));

    const elapsedTime = Date.now() - startTime;

    console.log(`   ✓ ${chunkCount} chunks streamed`);
    console.log(`${'='.repeat(70)}`);
    console.log(`✅ Stream complete`);
    console.log(`   Time: ${elapsedTime}ms`);
    console.log(`${'='.repeat(70)}\n`);

    res.write(
      `data: ${JSON.stringify({ done: true, sources, elapsedTime: `${elapsedTime}ms` })}\n\n`
    );
    res.end();
  } catch (error: any) {
    console.error(`❌ Stream error: ${error.message}\n`);
    res.status(500).json({
      error: 'Streaming failed',
      message: error.message,
    });
  }
});

// ============================================================================
// 404 Handler
// ============================================================================
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    availableEndpoints: [
      'GET /health',
      'POST /api/retrieve',
      'POST /api/query',
      'POST /api/query/stream',
    ],
  });
});

// ============================================================================
// START SERVER
// ============================================================================
app.listen(PORT, () => {
  console.log(`\n${'═'.repeat(70)}`);
  console.log('🚀 LEGALINK360 BACKEND SERVER');
  console.log(`${'═'.repeat(70)}`);
  console.log(`\n📍 Server: http://localhost:${PORT}`);
  console.log(`\n📡 Available Endpoints:`);
  console.log(`   • GET  /health                    - Health check`);
  console.log(`   • POST /api/retrieve              - Search documents`);
  console.log(`   • POST /api/query                 - Full RAG query`);
  console.log(`   • POST /api/query/stream          - Streaming response`);
  console.log(`\n🔗 Environment:`);
  console.log(`   • Pinecone Index: ${process.env.PINECONE_INDEX_NAME}`);
  console.log(`   • OpenAI Model: gpt-4-turbo`);
  console.log(`   • Database: Supabase PostgreSQL`);
  console.log(`\n${'═'.repeat(70)}\n`);
});
