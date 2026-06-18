const { execSync } = require("child_process");
const fs = require("fs");

const SCHEMA_PATH = "prisma/schema.prisma";

// On Vercel: swap provider from sqlite (local dev) to postgresql (production)
if (process.env.VERCEL) {
  console.log("[vercel-deploy] Vercel detected — switching schema provider to postgresql...");
  let schema = fs.readFileSync(SCHEMA_PATH, "utf8");
  if (schema.includes('provider = "sqlite"')) {
    schema = schema.replace('provider = "sqlite"', 'provider = "postgresql"');
    fs.writeFileSync(SCHEMA_PATH, schema);
    console.log("[vercel-deploy] Provider switched to postgresql.");
  } else {
    console.log("[vercel-deploy] Provider already postgresql, skipping.");
  }
}

try {
  console.log("[vercel-deploy] Running prisma db push...");
  execSync("npx prisma db push --skip-generate", { stdio: "inherit" });
  console.log("[vercel-deploy] Schema pushed successfully.");
} catch (err) {
  console.warn("[vercel-deploy] prisma db push skipped (DB not available during build).");
  console.warn("[vercel-deploy] Make sure to push schema manually before first deploy.");
}
