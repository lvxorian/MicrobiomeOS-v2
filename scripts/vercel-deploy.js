const { execSync } = require("child_process");
const fs = require("fs");

const SCHEMA_PATH = "prisma/schema.prisma";

// On Vercel: swap provider from sqlite (local dev) to postgresql (production)
// and add directUrl for migration operations
if (process.env.VERCEL) {
  console.log("[vercel-deploy] Vercel detected — switching schema to postgresql...");
  let schema = fs.readFileSync(SCHEMA_PATH, "utf8");

  if (schema.includes('provider = "sqlite"')) {
    schema = schema.replace(
      'provider = "sqlite"',
      'provider = "postgresql"'
    );
    // Add directUrl for prisma db push (direct connection, port 5432)
    schema = schema.replace(
      'url      = env("DATABASE_URL")',
      'url       = env("DATABASE_URL")\n  directUrl = env("DIRECT_URL")'
    );
    fs.writeFileSync(SCHEMA_PATH, schema);
    console.log("[vercel-deploy] Provider switched to postgresql + directUrl added.");
  } else {
    console.log("[vercel-deploy] Provider already postgresql, skipping.");
  }
}

// Show connection info (without password)
const dbUrl = process.env.DATABASE_URL || "";
const dbHost = dbUrl.replace(/\/\/[^:]+:[^@]+@/, "//***:***@");
console.log(`[vercel-deploy] DATABASE_URL host: ${dbHost || "not set"}`);
if (process.env.DIRECT_URL) {
  console.log("[vercel-deploy] DIRECT_URL is set (using direct connection for DDL).");
} else {
  console.log("[vercel-deploy] DIRECT_URL not set — prisma db push may fail.");
}

try {
  console.log("[vercel-deploy] Running prisma db push...");
  execSync("npx prisma db push --skip-generate", { stdio: "inherit" });
  console.log("[vercel-deploy] ✓ Schema pushed to database successfully.");
} catch (err) {
  console.error("[vercel-deploy] ⚠ prisma db push FAILED — DB not reachable during build.");
  console.error("[vercel-deploy]   Error:", err.message?.slice(0, 200) || String(err).slice(0, 200));
  console.error("[vercel-deploy]   If schema has never been pushed, run supabase-schema.sql");
  console.error("[vercel-deploy]   in Supabase SQL Editor manually: https://supabase.com/dashboard");
  console.error("[vercel-deploy] Build will continue — runtime may fail if tables don't exist.");
}
