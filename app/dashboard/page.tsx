import { SectionHeader } from "@/components/shared/SectionHeader";
import { StatCard } from "@/components/shared/StatCard";
import { StudyCard } from "@/components/studies/StudyCard";
import { DailyInsightHero } from "@/components/shared/DailyInsightHero";
import { getStudiesCount, getTaxaCount, getAverageEvidenceScore, getStudiesList } from "@/lib/db/queries";
import { getLatestDailyReport } from "@/lib/db/daily-report-queries";
import { Microscope, Share2, TrendingUp, Database } from "lucide-react";

export default async function DashboardPage() {
  const [studiesCount, taxaCount, avgScore, highEvidence, dailyReport] = await Promise.all([
    getStudiesCount(),
    getTaxaCount(),
    getAverageEvidenceScore(30),
    getStudiesList({ minEvidence: 7.0, limit: 8 }),
    getLatestDailyReport(),
  ]);

  const isToday = dailyReport
    ? new Date(dailyReport.date).toDateString() === new Date().toDateString()
    : false;

  let keyFindings: string[] = [];
  if (dailyReport) {
    try {
      keyFindings = JSON.parse(dailyReport.keyFindingsJson);
    } catch {
      keyFindings = [];
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <SectionHeader
        eyebrow="Výzkumný přehled"
        title="Přehled"
        description="Denní monitoring mikrobiomového výzkumu. Nejnovější studie zpracované AI agentem do strukturovaných výtahů."
      />

      {dailyReport && (
        <DailyInsightHero
          date={dailyReport.date.toISOString()}
          summaryText={dailyReport.summaryText}
          keyFindings={keyFindings}
          studiesCount={dailyReport.studiesCount}
          studiesNew={dailyReport.studiesNew}
          isToday={isToday}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Indexované studie"
          value={studiesCount}
          icon={<Database className="h-4 w-4" />}
        />
        <StatCard
          label="Sledované taxony"
          value={taxaCount}
          icon={<Share2 className="h-4 w-4" />}
        />
        <StatCard
          label="Průměrné skóre důkazů"
          value={avgScore.toFixed(1).replace(".", ",")}
          icon={<TrendingUp className="h-4 w-4" />}
          trend="za posledních 30 dní"
        />
        <StatCard
          label="Sledované zdroje"
          value={5}
          icon={<Microscope className="h-4 w-4" />}
          trend="PubMed, Nature, Cell, Gut, bioRxiv"
        />
      </div>

      <SectionHeader
        eyebrow="Nejvyšší důkazy"
        title="Studie s vysokým skóre důkazů"
        description="Studie s evidence score ≥ 7,0 — metaanalýzy, RCT a systematické přehledy."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {highEvidence.studies.map((study) => (
          <StudyCard key={study.id} study={study} />
        ))}
      </div>

      {highEvidence.total === 0 && (
        <div className="text-center py-16 text-text3">
          <Microscope className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-mono text-sm">Žádné studie k zobrazení</p>
        </div>
      )}
    </div>
  );
}
