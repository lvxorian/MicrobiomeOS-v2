const { execSync } = require("child_process");

try {
  console.log("[vercel-deploy] Running prisma db push...");
  execSync("npx prisma db push --skip-generate", { stdio: "inherit" });
  console.log("[vercel-deploy] Schema pushed successfully.");
} catch (err) {
  console.warn("[vercel-deploy] prisma db push skipped (DB not available during build).");
  console.warn("[vercel-deploy] Make sure to push schema manually before first deploy.");
}
