import { prisma } from "@/lib/db/prisma";
import { fetchPubMed } from "./sources/pubmed";
import { fetchNature } from "./sources/nature";
import { fetchBiorxiv } from "./sources/biorxiv";
import { fetchCell } from "./sources/cell";
import { fetchGutBMJ } from "./sources/gut-bmj";
import { processStudyWithLLM } from "./processor";
import { scoreEvidence } from "./scorer";
import { generateDailyInsight, saveDailyReport } from "./daily-insight";
import type { RawStudy } from "@/types";

const SOURCES = [
  { key: "PUBMED", name: "PubMed", fetch: fetchPubMed },
  { key: "NATURE", name: "Nature", fetch: fetchNature },
  { key: "CELL", name: "Cell Host & Microbe", fetch: fetchCell },
  { key: "BIORXIV", name: "bioRxiv", fetch: fetchBiorxiv },
  { key: "GUT_BMJ", name: "Gut (BMJ)", fetch: fetchGutBMJ },
] as const;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function logLine(runId: string, type: string, message: string) {
  await prisma.agentRun.update({
    where: { id: runId },
    data: {
      logLines: JSON.stringify([
        ...JSON.parse(
          (await prisma.agentRun.findUnique({ where: { id: runId }, select: { logLines: true } }))?.logLines || "[]"
        ),
        { timestamp: new Date().toISOString(), type, message },
      ]),
    },
  });
}

async function matchAlerts(studyId: string) {
  const study = await prisma.study.findUnique({
    where: { id: studyId },
    select: { title: true, plainSummary: true, evidenceScore: true },
  });
  if (!study) return 0;

  const alerts = await prisma.alert.findMany({ where: { isActive: true } });
  let fired = 0;

  for (const alert of alerts) {
    const keywords: string[] = JSON.parse(alert.keywords);
    const text = (study.title + " " + study.plainSummary).toLowerCase();
    const match = keywords.some((kw) => text.includes(kw.toLowerCase()));
    if (match && study.evidenceScore >= alert.minEvidence) {
      await prisma.alertMatch.upsert({
        where: { alertId_studyId: { alertId: alert.id, studyId } },
        update: { matchedAt: new Date() },
        create: { alertId: alert.id, studyId },
      });
      await prisma.alert.update({
        where: { id: alert.id },
        data: { lastTriggered: new Date() },
      });
      fired++;
    }
  }
  return fired;
}

async function upsertTaxon(name: string, genus: string, species: string | null, phylum: string, color: string) {
  return prisma.taxon.upsert({
    where: { name },
    update: {},
    create: { name, genus, species, phylum, color },
  });
}

const PHYLUM_COLORS: Record<string, string> = {
  Firmicutes: "#00D4AA",
  Bacteroidetes: "#7B61FF",
  Proteobacteria: "#F5A623",
  Actinobacteria: "#FF4D6A",
  Verrucomicrobia: "#36B8F5",
};

export async function runAgent(sourceKey?: string, existingRunId?: string) {
  const runId = existingRunId || (await prisma.agentRun.create({
    data: { status: "RUNNING", logLines: "[]", studiesFound: 0, studiesNew: 0, alertsFired: 0 },
  })).id;

  try {
    await logLine(runId, "INFO", "Agent spuštěn — zahajuji denní sken");

    const sourcesToRun = sourceKey ? SOURCES.filter((s) => s.key === sourceKey) : SOURCES;
    let totalFound = 0;
    let totalNew = 0;
    let totalAlerts = 0;
    const newStudiesForInsight: { title: string; plainSummary: string; evidenceScore: number; studyId: string }[] = [];

    for (const src of sourcesToRun) {
      await logLine(runId, "FETCH", `${src.name}: hledání posledních studií...`);

      let rawStudies: RawStudy[] = [];
      try {
        rawStudies = await src.fetch();
      } catch (err) {
        await logLine(runId, "ERROR", `${src.name}: chyba fetch — ${(err as Error).message}`);
        continue;
      }

      await logLine(runId, "INFO", `${src.name}: nalezeno ${rawStudies.length} studií`);
      totalFound += rawStudies.length;

      for (const raw of rawStudies) {
        // Bezpečnostní kontrola — title musí být string
        if (!raw.title || typeof raw.title !== "string") {
          await logLine(runId, "ERROR", `Přeskakuji studii s nevalidním názvem (typ: ${typeof raw.title})`);
          continue;
        }

        // Deduplikace: DOI → PMID → title+journal+year
        const exists = raw.doi
          ? await prisma.study.findFirst({ where: { doi: raw.doi } })
          : raw.pmid
            ? await prisma.study.findFirst({ where: { pmid: raw.pmid } })
            : await prisma.study.findFirst({
                where: { title: raw.title, journal: raw.journal, year: raw.year },
              });
        if (exists) continue;

        try {
          await logLine(runId, "PARSE", `Zpracování: ${String(raw.title).slice(0, 60)}...`);

          const processed = await processStudyWithLLM(raw);
          await sleep(500); // Rate limit

          const score = scoreEvidence(processed, {
            journal: raw.journal,
            isPeerReviewed: raw.isPeerReviewed,
            isPreprint: raw.isPreprint,
          });

          // Save study
          const study = await prisma.study.create({
            data: {
              title: processed.titleCz || raw.title,
              authors: JSON.stringify(raw.authors),
              journal: raw.journal,
              year: raw.year,
              doi: raw.doi,
              pmid: raw.pmid,
              url: raw.url,
              source: raw.source,
              isPeerReviewed: raw.isPeerReviewed,
              isPreprint: raw.isPreprint,
              publishedAt: raw.publishedAt ? new Date(raw.publishedAt) : new Date(raw.year, 0, 1),
              indexedAt: new Date(),
              plainSummary: processed.plainSummary,
              keyFindings: JSON.stringify(processed.keyFindings),
              limitations: processed.limitations,
              clinicalRelevance: processed.clinicalRelevance,
              evidenceScore: score,
              studyDesign: processed.studyDesign,
              sampleSize: processed.sampleSize,
              sequencingMethod: processed.sequencingMethod,
              cohortType: processed.cohortType,
              duration: processed.duration,
            },
          });

          // Upsert taxa (každý taxon zvlášť, jeden špatný nezabije celou studii)
          for (const t of processed.taxa) {
            try {
              // Normalizace: pokud chybí genus, použij name
              const taxonName = t.name?.trim() || "";
              const taxonGenus = t.genus?.trim() || taxonName;
              const taxonPhylum = t.phylum?.trim() || "Firmicutes";

              if (!taxonName) {
                await logLine(runId, "ERROR", `Taxon přeskočen — prázdný název`);
                continue;
              }

              const color = PHYLUM_COLORS[taxonPhylum] || "#36B8F5";
              const taxon = await upsertTaxon(taxonName, taxonGenus, t.species || null, taxonPhylum, color);

              await prisma.studyTaxon.create({
                data: {
                  studyId: study.id,
                  taxonId: taxon.id,
                  direction: t.direction,
                  magnitude: t.magnitude,
                  note: t.note,
                },
              });
            } catch (taxonErr) {
              await logLine(runId, "ERROR", `Taxon ${t.name || "?"} selhal: ${(taxonErr as Error).message.slice(0, 100)}`);
            }
          }

          // Connect tags
          for (const tagLabel of processed.suggestedTags.slice(0, 5)) {
            const tag = await prisma.tag.upsert({
              where: { label: tagLabel },
              update: {},
              create: { label: tagLabel, color: "teal" },
            });
            await prisma.study.update({
              where: { id: study.id },
              data: { tags: { connect: { id: tag.id } } },
            });
          }

          totalNew++;
          newStudiesForInsight.push({
            title: raw.title,
            plainSummary: processed.plainSummary,
            evidenceScore: score,
            studyId: study.id,
          });
          await logLine(runId, "STORE", `Uloženo: ${raw.title.slice(0, 60)}${raw.doi ? ` (DOI: ${raw.doi})` : ""}`);

          // Match alerts
          const fired = await matchAlerts(study.id);
          totalAlerts += fired;
          if (fired > 0) {
            await logLine(runId, "ALERT", `${fired} upozornění aktivováno`);
          }
        } catch (err) {
          await logLine(runId, "ERROR", `Chyba zpracování: ${(err as Error).message}`);
        }
      }
    }

    await logLine(runId, "INFO", `Denní sken dokončen — ${totalFound} studií nalezeno, ${totalNew} nově uloženo, ${totalAlerts} upozornění`);
    await prisma.agentRun.update({
      where: { id: runId },
      data: {
        status: "SUCCESS",
        finishedAt: new Date(),
        studiesFound: totalFound,
        studiesNew: totalNew,
        alertsFired: totalAlerts,
      },
    });

    // Generovat Daily Insight
    if (newStudiesForInsight.length > 0 || totalFound > 0) {
      await logLine(runId, "INFO", "Generuji Daily Insight...");
      try {
        const insight = await generateDailyInsight(newStudiesForInsight, totalFound, totalNew);
        const keyFindings = newStudiesForInsight.map((s) => ({ title: s.title, studyId: s.studyId }));
        await saveDailyReport(new Date(), insight, totalFound, totalNew, keyFindings);
        await logLine(runId, "INFO", "Daily Insight uložen");
      } catch (insightErr) {
        await logLine(runId, "ERROR", `Chyba Daily Insight: ${(insightErr as Error).message}`);
      }
    }
  } catch (err) {
    await logLine(runId, "ERROR", `Kritická chyba: ${(err as Error).message}`);
    await prisma.agentRun.update({
      where: { id: runId },
      data: {
        status: "FAILED",
        finishedAt: new Date(),
        errorMsg: (err as Error).message,
      },
    });
  }
}

