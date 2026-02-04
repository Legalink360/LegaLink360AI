import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { RetrievalService } from './services/retrievalService';
import { LLMService } from './services/llmService';
import { ChatThreadService } from './services/chatThreadService';

// Load environment variables only in development
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local' });
}

const app = express();
const PORT = process.env.PORT || process.env.APP_PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Initialize services with error handling
let retrievalService: any;
let llmService: any;
let chatThreadService: any;

try {
  retrievalService = new RetrievalService();
  llmService = new LLMService();
  chatThreadService = new ChatThreadService();
} catch (error) {
  console.warn('[Server] Warning initializing services:', (error as any).message);
  // Services are optional for chat thread functionality
}

// Middleware
// CORS configuration - specify allowed origins for production
const allowedOrigins: string[] = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://legalink360ai.vercel.app',
  process.env.CLIENT_URL || '',
].filter((origin): origin is string => Boolean(origin));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? allowedOrigins 
    : '*', // Allow all in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));

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
      results: results.map((r: any, i: number) => ({
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
    const sources = documents.map((doc: any, i: number) => ({
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
    const sources = documents.map((doc: any, i: number) => ({
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
// CHAT THREADS API
// ============================================================================

// Middleware to extract and validate user ID from auth header
const extractUserId = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    console.log('[Auth] No Bearer token found');
    return null;
  }
  
  // Extract user ID from the JWT token (it's in the 'sub' claim)
  try {
    const token = authHeader.substring(7);
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('[Auth] Invalid token format');
      return null;
    }
    
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    console.log('[Auth] Extracted user ID:', payload.sub);
    return payload.sub || null;
  } catch (error) {
    console.error('[Auth] Error extracting user ID:', error);
    return null;
  }
};

/**
 * GET /api/chat/threads
 * Get all chat threads for the authenticated user
 */
app.get('/api/chat/threads', async (req: Request, res: Response) => {
  try {
    const userId = extractUserId(req);
    console.log('[GET /api/chat/threads] User ID:', userId);
    
    if (!userId) {
      console.log('[GET /api/chat/threads] Unauthorized - no user ID');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const threads = await chatThreadService.getUserChatThreads(userId);
    console.log('[GET /api/chat/threads] Found threads:', threads.length);
    
    res.json({
      success: true,
      threads,
      count: threads.length,
    });
  } catch (error: any) {
    console.error('[GET /api/chat/threads] Error:', error);
    res.status(500).json({
      error: 'Failed to fetch chat threads',
      message: error.message,
    });
  }
});

/**
 * POST /api/chat/threads
 * Create a new chat thread
 */
app.post('/api/chat/threads', async (req: Request, res: Response) => {
  try {
    const userId = extractUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { title = 'New Chat', topic, documentIds } = req.body;

    const thread = await chatThreadService.createChatThread(userId, title, topic, documentIds);
    if (!thread) {
      return res.status(500).json({ error: 'Failed to create chat thread' });
    }

    res.status(201).json({
      success: true,
      thread,
    });
  } catch (error: any) {
    console.error('Error creating chat thread:', error);
    res.status(500).json({
      error: 'Failed to create chat thread',
      message: error.message,
    });
  }
});

/**
 * GET /api/chat/threads/:threadId
 * Get a specific chat thread
 */
app.get('/api/chat/threads/:threadId', async (req: Request, res: Response) => {
  try {
    const userId = extractUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { threadId } = req.params;
    const thread = await chatThreadService.getChatThread(threadId, userId);
    
    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    res.json({
      success: true,
      thread,
    });
  } catch (error: any) {
    console.error('Error fetching chat thread:', error);
    res.status(500).json({
      error: 'Failed to fetch chat thread',
      message: error.message,
    });
  }
});

/**
 * PUT /api/chat/threads/:threadId
 * Update a chat thread
 */
app.put('/api/chat/threads/:threadId', async (req: Request, res: Response) => {
  try {
    const userId = extractUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { threadId } = req.params;
    const updates = req.body;

    const thread = await chatThreadService.updateChatThread(threadId, userId, updates);
    if (!thread) {
      return res.status(404).json({ error: 'Thread not found or update failed' });
    }

    res.json({
      success: true,
      thread,
    });
  } catch (error: any) {
    console.error('Error updating chat thread:', error);
    res.status(500).json({
      error: 'Failed to update chat thread',
      message: error.message,
    });
  }
});

/**
 * POST /api/chat/threads/:threadId/archive
 * Archive a chat thread
 */
app.post('/api/chat/threads/:threadId/archive', async (req: Request, res: Response) => {
  try {
    const userId = extractUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { threadId } = req.params;
    const success = await chatThreadService.archiveThread(threadId, userId);

    if (!success) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    res.json({ success: true, message: 'Thread archived' });
  } catch (error: any) {
    console.error('Error archiving thread:', error);
    res.status(500).json({
      error: 'Failed to archive thread',
      message: error.message,
    });
  }
});

/**
 * DELETE /api/chat/threads/:threadId
 * Delete a chat thread
 */
app.delete('/api/chat/threads/:threadId', async (req: Request, res: Response) => {
  try {
    const userId = extractUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { threadId } = req.params;
    const success = await chatThreadService.deleteThread(threadId, userId);

    if (!success) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    res.json({ success: true, message: 'Thread deleted' });
  } catch (error: any) {
    console.error('Error deleting thread:', error);
    res.status(500).json({
      error: 'Failed to delete thread',
      message: error.message,
    });
  }
});

/**
 * POST /api/chat/threads/:threadId/pin
 * Pin or unpin a thread
 */
app.post('/api/chat/threads/:threadId/pin', async (req: Request, res: Response) => {
  try {
    const userId = extractUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { threadId } = req.params;
    const { isPinned } = req.body;

    const success = await chatThreadService.togglePinThread(threadId, userId, isPinned);

    if (!success) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    res.json({ success: true, message: isPinned ? 'Thread pinned' : 'Thread unpinned' });
  } catch (error: any) {
    console.error('Error toggling pin:', error);
    res.status(500).json({
      error: 'Failed to toggle pin',
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
// GLOBAL ERROR HANDLING MIDDLEWARE
// ============================================================================
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(`\n❌ ERROR at ${req.method} ${req.path}`);
  console.error(`   ${err.message}\n`);
  
  // Ensure we don't expose sensitive details in production
  const message = NODE_ENV === 'production' 
    ? 'Internal server error'
    : err.message;
  
  res.status(err.status || 500).json({
    error: 'Server error',
    message: message,
    ...(NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// ============================================================================
// START SERVER
// ============================================================================
const server = app.listen(PORT, () => {
  console.log(`\n${'═'.repeat(70)}`);
  console.log('🚀 LEGALINK360 BACKEND SERVER');
  console.log(`${'═'.repeat(70)}`);
  console.log(`\n📍 Server: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${NODE_ENV.toUpperCase()}`);
  console.log(`\n📡 Available Endpoints:`);
  console.log(`   • GET  /health                    - Health check`);
  console.log(`   • POST /api/retrieve              - Search documents`);
  console.log(`   • POST /api/query                 - Full RAG query`);
  console.log(`   • POST /api/query/stream          - Streaming response`);
  console.log(`\n🔗 Configuration:`);
  console.log(`   • Pinecone Index: ${process.env.PINECONE_INDEX_NAME || 'NOT SET'}`);
  console.log(`   • OpenAI Model: ${process.env.OPENAI_CHAT_MODEL || 'gpt-4-turbo'}`);
  console.log(`   • Supabase URL: ${process.env.SUPABASE_URL ? '✓ Configured' : '✗ NOT SET'}`);
  console.log(`\n✅ Server ready to accept requests`);
  console.log(`${'═'.repeat(70)}\n`);
});

// ============================================================================
// GLOBAL ERROR HANDLERS
// ============================================================================

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Server] Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('[Server] Uncaught Exception:', error);
  // Log but don't exit - allow server to keep running
});
