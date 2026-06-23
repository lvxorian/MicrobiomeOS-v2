import { runAgent } from "../lib/agent";

async function main() {
  console.log("[Agent Cron] Starting daily scan at", new Date().toISOString());
  await runAgent();
  console.log("[Agent Cron] Scan complete.");
  process.exit(0);
}

main().catch((e) => {
  console.error("[Agent Cron] Fatal error:", e);
  process.exit(1);
});
