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
      console.log(`[RETRIEVAL] Searching for: "${query}"`);
      
      // Generate query embedding
      console.log('   ⏳ Generating embedding...');
      const queryEmbedding = await this.generateQueryEmbedding(query);
      console.log('   ✓ Embedding generated');

      // Search Pinecone
      console.log(`   ⏳ Searching Pinecone...`);
      const index = this.pinecone.Index(this.indexName);
      const searchResults = await index.query({
        vector: queryEmbedding,
        topK: topK,
        includeMetadata: true,
      });

      console.log(`   ✓ Found ${searchResults.matches?.length || 0} matches`);

      if (!searchResults.matches || searchResults.matches.length === 0) {
        return [];
      }

      // Fetch full content from Supabase
      console.log('   ⏳ Fetching content from Supabase...');
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
              title: match.metadata?.title || 'Unknown',
              content: data.content,
              relevanceScore: match.score || 0,
              category: match.metadata?.category || 'Unknown',
              chunkIndex: match.metadata?.chunkIndex || 0,
            });
          }
        } catch (err) {
          console.warn(`Failed to fetch content for ${match.id}`);
        }
      }

      console.log(`   ✓ Retrieved ${results.length} full documents\n`);
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
