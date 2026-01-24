import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAI } from 'openai';
import { createClient } from '@supabase/supabase-js';

async function testAllConnections() {
  console.log('\n' + '='.repeat(70));
  console.log('🔍 LEGALINK360 BACKEND - CONNECTION VERIFICATION');
  console.log('='.repeat(70) + '\n');

  let allPassed = true;

  // Test 1: Pinecone Connection
  console.log('1️⃣  PINECONE VECTOR DATABASE');
  console.log('-'.repeat(70));
  try {
    if (!process.env.PINECONE_API_KEY) {
      throw new Error('PINECONE_API_KEY not set in .env.local');
    }

    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    const indexName = process.env.PINECONE_INDEX_NAME || 'legalink360-legal-docs';
    const index = pinecone.Index(indexName);
    const stats = await index.describeIndexStats();

    console.log('   ✅ Connected to Pinecone');
    console.log(`   ✅ API Key: ${process.env.PINECONE_API_KEY.substring(0, 10)}...`);
    console.log(`   ✅ Index Name: ${indexName}`);
    console.log(`   ✅ Environment: ${process.env.PINECONE_ENVIRONMENT}`);
    console.log(`   ✅ Total Vectors Indexed: ${stats.totalRecordCount || 0}`);
    console.log(`   ✅ Ready for document ingestion\n`);
  } catch (error: any) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    allPassed = false;
  }

  // Test 2: OpenAI Connection
  console.log('2️⃣  OPENAI API (Embeddings & LLM)');
  console.log('-'.repeat(70));
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not set in .env.local');
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Test embedding generation
    console.log('   Testing embedding generation...');
    const response = await openai.embeddings.create({
      model: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-large',
      input: 'What is a limited liability company?',
    });

    console.log('   ✅ Connected to OpenAI API');
    console.log(`   ✅ API Key: ${process.env.OPENAI_API_KEY.substring(0, 10)}...`);
    console.log(`   ✅ Embedding Model: ${process.env.OPENAI_EMBEDDING_MODEL}`);
    console.log(`   ✅ Chat Model: ${process.env.OPENAI_CHAT_MODEL}`);
    console.log(`   ✅ Embedding Dimensions: ${response.data[0].embedding.length}`);
    console.log(`   ✅ Ready for document embedding\n`);
  } catch (error: any) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    allPassed = false;
  }

  // Test 3: Supabase Connection
  console.log('3️⃣  SUPABASE DATABASE (PostgreSQL)');
  console.log('-'.repeat(70));
  try {
    if (!process.env.SUPABASE_URL) {
      throw new Error('SUPABASE_URL not set in .env.local');
    }
    if (!process.env.SUPABASE_SERVICE_KEY) {
      throw new Error('SUPABASE_SERVICE_KEY not set in .env.local');
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    // Test database connection
    const { error } = await supabase.from('documents').select('count').limit(1);
    if (error) throw error;

    console.log('   ✅ Connected to Supabase');
    console.log(`   ✅ Project URL: ${process.env.SUPABASE_URL}`);
    console.log(`   ✅ Service Key: ${process.env.SUPABASE_SERVICE_KEY.substring(0, 10)}...`);
    console.log('   ✅ Database accessible');
    console.log('   ✅ Tables ready for metadata storage\n');
  } catch (error: any) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    allPassed = false;
  }

  // Test 4: Environment Variables Check
  console.log('4️⃣  ENVIRONMENT VARIABLES');
  console.log('-'.repeat(70));
  const required = [
    'OPENAI_API_KEY',
    'OPENAI_EMBEDDING_MODEL',
    'OPENAI_CHAT_MODEL',
    'PINECONE_API_KEY',
    'PINECONE_ENVIRONMENT',
    'PINECONE_INDEX_NAME',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_KEY',
    'SUPABASE_ANON_KEY',
    'NODE_ENV',
  ];

  let missingVars: string[] = [];

  for (const key of required) {
    if (!process.env[key]) {
      missingVars.push(key);
      console.log(`   ❌ Missing: ${key}`);
    } else {
      const value = process.env[key];
      const masked =
        value.length > 20
          ? value.substring(0, 10) + '...' + value.substring(value.length - 5)
          : value;
      console.log(`   ✅ ${key}: ${masked}`);
    }
  }

  if (missingVars.length === 0) {
    console.log('\n   ✅ All required environment variables present\n');
  } else {
    console.log(`\n   ⚠️  Missing ${missingVars.length} variable(s)\n`);
    allPassed = false;
  }

  // Final Summary
  console.log('='.repeat(70));
  if (allPassed) {
    console.log('✅ ALL CONNECTIONS PASSED - Backend is ready for ingestion!\n');
    console.log('Next steps:');
    console.log('  1. npm run ingest-uganda-laws    (test with Uganda laws documents)');
    console.log('  2. npm run ingest-custom    (ingest your legal documents)');
    console.log('  3. Start building retrieval API\n');
  } else {
    console.log('❌ SOME CONNECTIONS FAILED - Please fix errors above\n');
    console.log('Common fixes:');
    console.log('  1. Check .env.local file exists in backend/ directory');
    console.log('  2. Verify all API keys are correct');
    console.log('  3. Run: npm install (to install dependencies)');
    console.log('  4. Ensure Pinecone index is created');
    console.log('  5. Check internet connection\n');
  }
  console.log('='.repeat(70) + '\n');

  process.exit(allPassed ? 0 : 1);
}

// Run tests
testAllConnections().catch((error) => {
  console.error('\n❌ Test suite failed:', error.message);
  process.exit(1);
});
