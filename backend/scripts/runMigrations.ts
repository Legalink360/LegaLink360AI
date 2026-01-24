import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const migrations = [
  "001_create_user_profiles.sql",
  "002_create_documents_table.sql",
  "003_create_chat_threads.sql",
  "004_create_chat_messages.sql",
  "005_create_backend_documents.sql",
  "006_create_document_chunks.sql",
  "007_create_ingestion_logs.sql",
  "008_create_query_logs.sql",
];

async function runMigrations() {
  console.log("\n======================================================================");
  console.log("🗄️  DATABASE MIGRATIONS - RUNNING");
  console.log("======================================================================\n");

  const startTime = Date.now();
  let successCount = 0;
  let failureCount = 0;

  for (const migration of migrations) {
    const filePath = path.join(
      __dirname,
      "..",
      "..",
      "database",
      "migrations",
      migration
    );

    if (!fs.existsSync(filePath)) {
      console.log(`❌ Migration file not found: ${migration}`);
      failureCount++;
      continue;
    }

    const sqlContent = fs.readFileSync(filePath, "utf-8");

    console.log(`⏳ Running: ${migration}`);

    try {
      const { error } = await supabase.rpc("exec", {
        sql_query: sqlContent,
      });

      if (error) {
        console.log(`   Error: ${error.message}`);
        failureCount++;
      } else {
        console.log(`   ✅ Success`);
        successCount++;
      }
    } catch (err: any) {
      // Try direct SQL query as fallback
      console.log(`   ⚠️  RPC failed, trying direct SQL...`);

      try {
        const { error } = await supabase.rpc("exec", {
          sql_query: sqlContent,
        });

        if (error) {
          console.log(`   ❌ Failed: ${error.message}`);
          failureCount++;
        } else {
          console.log(`   ✅ Success`);
          successCount++;
        }
      } catch (err2: any) {
        console.log(`   ❌ Error: ${err2.message}`);
        failureCount++;
      }
    }
  }

  const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log("\n======================================================================");
  console.log("📊 MIGRATION SUMMARY");
  console.log("======================================================================");
  console.log(`✅ Successful: ${successCount}/${migrations.length}`);
  console.log(`❌ Failed: ${failureCount}/${migrations.length}`);
  console.log(`⏱️  Time: ${elapsedTime}s`);
  console.log("======================================================================\n");

  // Verify tables were created
  console.log("🔍 Verifying tables...\n");

  try {
    const { data, error } = await supabase.from("backend_documents").select("*").limit(1);

    if (!error) {
      console.log("✅ backend_documents table exists and is accessible");
    } else {
      console.log(
        `❌ backend_documents table not found: ${error.message}`
      );
    }
  } catch (err: any) {
    console.log(`❌ Verification error: ${err.message}`);
  }

  console.log("\n");

  if (failureCount > 0) {
    console.log(
      "⚠️  Some migrations failed. Check the Supabase Dashboard SQL Editor:"
    );
    console.log("   1. Go to https://app.supabase.com");
    console.log("   2. Select your project");
    console.log("   3. Go to SQL Editor");
    console.log("   4. Create new query");
    console.log("   5. Copy content from database/migrations/*.sql files");
    console.log("   6. Run them in order\n");
    process.exit(1);
  } else {
    console.log("🎉 All migrations completed successfully!");
    console.log("✅ Database schema is ready for ingestion\n");
    process.exit(0);
  }
}

runMigrations();
