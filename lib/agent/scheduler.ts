import { schedule } from "node-cron";
import { runAgent } from "./index";

let job: ReturnType<typeof schedule> | null = null;

export function startScheduler() {
  if (job) return;

  job = schedule(
    "0 6 * * *",
    async () => {
      console.log("[Agent] Spouštím plánovaný denní sken...");
      await runAgent();
    },
    { timezone: "Europe/Prague" }
  );

  console.log("[Agent] CRON scheduler spuštěn — každý den v 06:00");
}

export function stopScheduler() {
  if (job) {
    job.stop();
    job = null;
    console.log("[Agent] CRON scheduler zastaven");
  }
}

export function getNextRun(): string {
  const now = new Date();

  // Zjisti aktuální offset pro Prahu (CET = +1, CEST = +2)
  const pragueNow = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Prague" }));
  const pragueOffset = pragueNow.getTime() - now.getTime();

  // Najdi next 06:00 v Praze
  const next = new Date(now.getTime() - pragueOffset); // převeď na "Pražský" časový základ
  next.setHours(6, 0, 0, 0);
  if (next.getTime() + pragueOffset <= now.getTime()) {
    next.setDate(next.getDate() + 1);
  }
  // Vrať zpět do UTC pro ISO string
  return new Date(next.getTime() + pragueOffset).toISOString();
}
