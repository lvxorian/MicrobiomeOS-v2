import { deepseek } from "@/lib/deepseek";
import { prisma } from "@/lib/db/prisma";

export async function generateDailyInsight(
  newStudies: { title: string; plainSummary: string; evidenceScore: number }[],
  totalScanned: number,
  newCount: number
): Promise<string> {
  if (newCount === 0) {
    return "Dnes agent neidentifikoval žádné nové studie o mikrobiomu. Včerejší poznatky zůstávají aktuální — pokračujeme ve sledování klíčových oblastí: střevní mikrobiom, osa střevo–mozek, metabolomika a probiotické intervence.";
  }

  const studiesCtx = newStudies
    .map((s, i) => `Studie ${i + 1}: "${s.title}"\nShrnutí: ${s.plainSummary}\nEV: ${s.evidenceScore}`)
    .join("\n\n");

  const response = await deepseek.chat.completions.create({
    model: "deepseek-chat",
    max_tokens: 600,
    temperature: 0.3,
    messages: [
      {
        role: "system",
        content: `Jsi vedoucí výzkumný mikrobiolog. Tvým úkolem je napsat jeden expertní odstavec v češtině, který shrne dnešní přísun studií.

Piš stylem Petra Ryšávky — odborně, analyticky, s klinickým přesahem. Odpověz na otázky:
- Vyšlo dnes něco průlomového nebo klinicky významného?
- Jaký trend v mikrobiomovém výzkumu dnešní studie naznačují?
- Co by si z dnešních studií měl odnést klinický lékař?

Pokud není nic převratného, upřímně to řekni a shrň, co se řeší aktuálně.

Piš přesně jeden odstavec (4-7 vět). Žádné odrážky, žádný markdown. Pouze čistý text v češtině.
Používej české desetinné čárky (např. 7,4).`,
      },
      {
        role: "user",
        content: `DNES NALEZENO: ${totalScanned} studií, z toho ${newCount} nových.\n\nNOVÉ STUDIE:\n${studiesCtx}\n\nNapiš Daily Insight.`,
      },
    ],
  });

  return response.choices[0]?.message?.content || "Dnes bez významných novinek v oblasti mikrobiomu.";
}

export async function saveDailyReport(
  date: Date,
  insight: string,
  studiesCount: number,
  studiesNew: number,
  keyFindings: string[]
) {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  await prisma.dailyReport.upsert({
    where: { date: dayStart },
    update: {
      summaryText: insight,
      keyFindingsJson: JSON.stringify(keyFindings),
      studiesCount,
      studiesNew,
    },
    create: {
      date: dayStart,
      summaryText: insight,
      keyFindingsJson: JSON.stringify(keyFindings),
      studiesCount,
      studiesNew,
    },
  });
}
