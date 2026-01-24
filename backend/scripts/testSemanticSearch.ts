/**
 * Test Semantic Search
 * 
 * Query the indexed Uganda laws vectors and verify relevance
 * Usage: npm run test-search
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAI } from 'openai';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const pineconeApiKey = process.env.PINECONE_API_KEY!;
const pineconeIndexName = process.env.PINECONE_INDEX_NAME!;
const openaiApiKey = process.env.OPENAI_API_KEY!;

const pinecone = new Pinecone({ apiKey: pineconeApiKey });
const openai = new OpenAI({ apiKey: openaiApiKey });
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Sample test queries
const testQueries = [
  'What are the grounds for divorce in Uganda?',
  'What is the punishment for theft in Uganda?',
  'What are the employer obligations regarding wages?',
  'How do I register land in Uganda?',
  'What are the rights of company shareholders?',
  'What is the minimum working hours per week?',
  'What makes a contract valid in Uganda?',
  'Who pays income tax in Uganda?',
];

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-large',
    input: text,
    dimensions: 3072,
  });

  return response.data[0].embedding;
}

async function testSemanticSearch(query: string, topK: number = 5) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🔍 QUERY: ${query}`);
  console.log(`${'='.repeat(70)}\n`);

  try {
    // Step 1: Generate embedding for query
    console.log('⏳ Generating query embedding...');
    const queryEmbedding = await generateEmbedding(query);
    console.log(`   ✓ Embedding generated (3072 dimensions)\n`);

    // Step 2: Search Pinecone
    console.log(`⏳ Searching Pinecone for top ${topK} results...`);
    const index = pinecone.Index(pineconeIndexName);
    const results = await index.query({
      vector: queryEmbedding,
      topK: topK,
      includeMetadata: true,
    });

    console.log(`   ✓ Found ${results.matches?.length || 0} matches\n`);

    // Step 3: Display results
    if (!results.matches || results.matches.length === 0) {
      console.log('❌ No results found');
      return;
    }

    for (let i = 0; i < results.matches.length; i++) {
      const match = results.matches[i];
      const relevanceScore = (match.score || 0).toFixed(4);
      const relevancePercent = ((match.score || 0) * 100).toFixed(1);

      console.log(`\n📄 RESULT ${i + 1}`);
      console.log(`   ID: ${match.id}`);
      console.log(`   Relevance: ${relevancePercent}% (score: ${relevanceScore})`);

      if (match.metadata) {
        console.log(`   Title: ${match.metadata.title}`);
        console.log(`   Category: ${match.metadata.category}`);
        console.log(`   Chunk Index: ${match.metadata.chunkIndex}`);
        
        // Fetch full content from Supabase
        const { data, error } = await supabase
          .from('document_chunks')
          .select('content')
          .eq('pinecone_vector_id', match.id)
          .single();

        if (!error && data) {
          const preview = data.content.substring(0, 300);
          console.log(`   Content Preview:`);
          console.log(`   ${preview}${preview.length < data.content.length ? '...' : ''}`);
        }
      }
    }

    // Step 4: Summary
    const avgScore = (
      results.matches.reduce((sum, m) => sum + (m.score || 0), 0) / results.matches.length
    ).toFixed(4);
    console.log(`\n${'─'.repeat(70)}`);
    console.log(`Average Relevance Score: ${avgScore}`);
    console.log(`${'─'.repeat(70)}\n`);
  } catch (error: any) {
    console.error(`\n❌ Error: ${error.message}\n`);
  }
}

async function runAllTests() {
  console.log('\n' + '='.repeat(70));
  console.log('🇺🇬 LEGALINK360 - SEMANTIC SEARCH TEST');
  console.log('='.repeat(70));
  console.log(`\nTesting ${testQueries.length} sample queries...\n`);

  for (const query of testQueries) {
    await testSemanticSearch(query, 3);
    // Add delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n' + '='.repeat(70));
  console.log('✅ TEST COMPLETE');
  console.log('='.repeat(70));
  console.log('\n📊 Summary:');
  console.log(`   Total queries tested: ${testQueries.length}`);
  console.log(`   Results per query: 3`);
  console.log(`   Total results shown: ${testQueries.length * 3}`);
  console.log('\n💡 Tips:');
  console.log('   • Relevance > 0.7 = Good match');
  console.log('   • Relevance > 0.8 = Excellent match');
  console.log('   • Relevance < 0.5 = Poor match\n');
}

// Run tests
runAllTests().catch(console.error);
