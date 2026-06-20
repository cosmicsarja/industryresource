#!/usr/bin/env node
// Script to create storage buckets and seed vendors via Supabase service-role API
// Run: SUPABASE_SERVICE_ROLE_KEY=<key> node setup.js

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PROJECT_URL = "https://cmrhvsiqlzntxwftfryj.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtcmh2c2lxbHpudHh3ZnRmcnlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2NjU5MzgsImV4cCI6MjA5NzI0MTkzOH0.mGgCrR6rkXd2BUjPD-TagkgwPUjC1mvMu-5squS5bqE";

if (!SERVICE_ROLE_KEY) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY env var is required");
  console.log("\nTo find your service role key:");
  console.log("1. Go to https://supabase.com/dashboard/project/cmrhvsiqlzntxwftfryj/settings/api");
  console.log("2. Copy the 'service_role' secret key");
  console.log("3. Run: SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/setup.js");
  process.exit(1);
}

const headers = {
  "apikey": SERVICE_ROLE_KEY,
  "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
};

async function createBucket(name) {
  const res = await fetch(`${PROJECT_URL}/storage/v1/bucket`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      id: name,
      name,
      public: true,
      fileSizeLimit: 10485760,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    }),
  });
  const data = await res.json();
  if (res.ok || data.message?.includes("already exists") || data.error?.includes("already exists")) {
    console.log(`✅ Bucket "${name}" ready`);
  } else {
    console.log(`⚠️  Bucket "${name}": ${JSON.stringify(data)}`);
  }
}

async function main() {
  console.log("🪣 Creating storage buckets...");
  await createBucket("machine-photos");
  await createBucket("material-photos");
  console.log("\n✅ Storage setup complete!");
  console.log("\n📋 Note: Run the SQL migration file manually in Supabase SQL Editor:");
  console.log("   supabase/migrations/20260620070000_storage_buckets_and_vendors.sql");
}

main().catch(console.error);
