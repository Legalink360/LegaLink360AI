import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAI } from 'openai';
import { createClient } from '@supabase/supabase-js';

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  relevanceScore: number;
  category: string;
  chunkIndex: number;
}

export class RetrievalService {
  private pinecone: Pinecone;
  private openai: OpenAI;
  private supabase: any;
  private indexName: string;

  constructor() {
    try {
      this.pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY!,
      });
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY!,
      });
      this.supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_KEY!
      );
      this.indexName = process.env.PINECONE_INDEX_NAME!;
    } catch (error) {
      console.error('[RetrievalService] Error initializing:', (error as any).message);
      throw error;
    }
  }

  /**
   * Generate embedding for a query string
   */
  async generateQueryEmbedding(query: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-large',
      input: query,
      dimensions: 3072,
    });
    return response.data[0].embedding;
  }

  /**
   * Search vector database for relevant documents
   */
  async semanticSearch(
    query: string,
    topK: number = 5
  ): Promise<SearchResult[]> {
    try {
      // Generate query embedding
      const queryEmbedding = await this.generateQueryEmbedding(query);

      // Search Pinecone
      const index = this.pinecone.Index(this.indexName);
      const searchResults = await index.query({
        vector: queryEmbedding,
        topK: topK,
        includeMetadata: true,
      });

      if (!searchResults.matches || searchResults.matches.length === 0) {
        return [];
      }

      // Fetch full content from Supabase
      const results: SearchResult[] = [];
      for (const match of searchResults.matches) {
        try {
          const { data, error } = await this.supabase
            .from('document_chunks')
            .select('content, summary')
            .eq('pinecone_vector_id', match.id)
            .single();

          if (!error && data) {
            results.push({
              id: match.id,
              title: String(match.metadata?.title || 'Unknown'),
              content: data.content,
              relevanceScore: match.score || 0,
              category: String(match.metadata?.category || 'Unknown'),
              chunkIndex: Number(match.metadata?.chunkIndex || 0),
            });
          }
        } catch (err) {
          console.warn(`Failed to fetch content for ${match.id}`);
        }
      }

      return results;
    } catch (error: any) {
      console.error('Search error:', error);
      throw new Error(`Semantic search failed: ${error.message}`);
    }
  }

  /**
   * Rerank results by relevance
   */
  rerankedSearch(results: SearchResult[], query: string): SearchResult[] {
    return results.sort((a, b) => {
      const aScore = a.relevanceScore;
      const bScore = b.relevanceScore;
      return bScore - aScore;
    });
  }
}
