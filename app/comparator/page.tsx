import React from "react";
import Link from "next/link";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { EvidenceScore } from "@/components/studies/EvidenceScore";
import { MethodFingerprint } from "@/components/studies/MethodFingerprint";
import { getStudiesList } from "@/lib/db/queries";
import { ArrowUp, ArrowDown, Minus, ArrowLeftRight, Trophy, FlaskConical } from "lucide-react";
import type { StudyTaxon, Taxon } from "@prisma/client";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: { study?: string; study2?: string };
};

function MetricRow({
  label,
  valueA,
  valueB,
  better = "higher",
}: {
  label: string;
  valueA: string;
  valueB: string;
  better?: "higher" | "lower" | "none";
}) {
  const isDiff = valueA !== valueB;
  const aBetter =
    better === "none"
      ? null
      : better === "higher"
        ? parseFloat(valueA) > parseFloat(valueB)
        : parseFloat(valueA) < parseFloat(valueB);
  const bBetter =
    better === "none"
      ? null
      : better === "higher"
        ? parseFloat(valueB) > parseFloat(valueA)
        : parseFloat(valueB) < parseFloat(valueA);

  return (
    <div className={`grid grid-cols-[1fr_100px_1fr] py-2.5 border-b border-border/50 items-center ${isDiff ? "bg-teal/5 -mx-4 px-4 rounded" : ""}`}>
      <span className={`font-mono text-[11px] text-center ${aBetter ? "text-teal font-medium" : "text-text-secondary"}`}>
        {valueA}
        {aBetter && <Trophy className="inline h-3 w-3 ml-1 text-teal" />}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[1px] text-text3 text-center">{label}</span>
      <span className={`font-mono text-[11px] text-center ${bBetter ? "text-teal font-medium" : "text-text-secondary"}`}>
        {valueB}
        {bBetter && <Trophy className="inline h-3 w-3 ml-1 text-teal" />}
      </span>
    </div>
  );
}

function TaxaComparison({ taxa1, taxa2 }: { taxa1: (StudyTaxon & { taxon: Taxon })[]; taxa2: (StudyTaxon & { taxon: Taxon })[] }) {
  const allNames = new Set([
    ...taxa1.map((t) => t.taxon.name),
    ...taxa2.map((t) => t.taxon.name),
  ]);

  if (allNames.size === 0) return null;

  return (
    <div className="mt-4">
      <span className="block font-mono text-[9px] uppercase tracking-[1px] text-text3 mb-2">Klíčové taxony</span>
      <div className="grid grid-cols-[1fr_60px_60px] gap-x-2 gap-y-1.5">
        <span className="font-mono text-[8px] text-text3 uppercase tracking-[0.5px]">Taxon</span>
        <span className="font-mono text-[8px] text-text3 uppercase tracking-[0.5px] text-center">A</span>
        <span className="font-mono text-[8px] text-text3 uppercase tracking-[0.5px] text-center">B</span>
        {Array.from(allNames).map((name) => {
          const a = taxa1.find((t) => t.taxon.name === name);
          const b = taxa2.find((t) => t.taxon.name === name);
          return (
            <React.Fragment key={name}>
              <span className="font-mono text-[10px] text-text-secondary italic truncate">{name.split(" ").pop()}</span>
              <span className="text-center">
                {a ? (
                  a.direction === "UP" ? <ArrowUp className="h-3 w-3 text-teal mx-auto" /> :
                  a.direction === "DOWN" ? <ArrowDown className="h-3 w-3 text-red mx-auto" /> :
                  <Minus className="h-3 w-3 text-text3 mx-auto" />
                ) : <span className="text-text3">—</span>}
              </span>
              <span className="text-center">
                {b ? (
                  b.direction === "UP" ? <ArrowUp className="h-3 w-3 text-teal mx-auto" /> :
                  b.direction === "DOWN" ? <ArrowDown className="h-3 w-3 text-red mx-auto" /> :
                  <Minus className="h-3 w-3 text-text3 mx-auto" />
                ) : <span className="text-text3">—</span>}
              </span>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

const DESIGN_CZ: Record<string, string> = {
  RCT: "RCT",
  OPEN_LABEL_RCT: "Otevřená RCT",
  COHORT: "Kohortová",
  CASE_CONTROL: "Případ-kontrola",
  META_ANALYSIS: "Meta-analýza",
  SYSTEMATIC_REVIEW: "Systematický přehled",
  MECHANISTIC: "Mechanistická",
  CASE_REPORT: "Kazuistika",
  PREPRINT: "Preprint",
  OTHER: "Ostatní",
};

export default async function ComparatorPage({ searchParams }: Props) {
  const study1Id = searchParams.study;
  const study2Id = searchParams.study2;
  const data = await getStudiesList({ limit: 50 });
  const study1 = study1Id ? data.studies.find((s) => s.id === study1Id) || null : null;
  const study2 = study2Id ? data.studies.find((s) => s.id === study2Id) || null : null;
  const bothSelected = study1 && study2;

  return (
    <div className="max-w-7xl mx-auto">
      <SectionHeader
        eyebrow="Srovnání studií"
        title="Porovnávač"
        description="Porovnejte dvě studie vedle sebe — design, skóre, data, taxony, výsledky."
      />

      {/* Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] uppercase tracking-[1.5px] text-teal">Studie A</span>
            {study1Id && <span className="font-mono text-[9px] text-text3">vybráno</span>}
          </div>
          <div className="max-h-60 overflow-y-auto space-y-1.5 bg-card border border-border rounded-lg p-1.5 scrollbar-thin">
            {data.studies.map((s) => (
              <Link
                key={s.id}
                href={`/comparator?study=${s.id}${study2Id ? `&study2=${study2Id}` : ""}`}
                className={`block rounded-md p-2.5 transition-all border ${
                  s.id === study1Id
                    ? "bg-teal/5 border-teal/30"
                    : "border-transparent hover:bg-bg3 hover:border-border"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[9px] uppercase tracking-[1px] text-teal shrink-0">{s.source}</span>
                  <span className="font-mono text-[9px] text-text3">{s.year}</span>
                  <span className={`ml-auto font-mono text-[9px] shrink-0 ${s.evidenceScore >= 8 ? "text-teal" : s.evidenceScore >= 6 ? "text-amber" : "text-red"}`}>
                    EV {s.evidenceScore.toFixed(1).replace(".", ",")}
                  </span>
                </div>
                <p className={`text-[12px] leading-snug line-clamp-2 ${s.id === study1Id ? "text-text" : "text-text-secondary"}`}>
                  {s.title}
                </p>
              </Link>
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] uppercase tracking-[1.5px] text-purple">Studie B</span>
            {study2Id && <span className="font-mono text-[9px] text-text3">vybráno</span>}
          </div>
          <div className="max-h-60 overflow-y-auto space-y-1.5 bg-card border border-border rounded-lg p-1.5 scrollbar-thin">
            {data.studies.map((s) => (
              <Link
                key={s.id}
                href={`/comparator?study=${study1Id || ""}&study2=${s.id}`}
                className={`block rounded-md p-2.5 transition-all border ${
                  s.id === study2Id
                    ? "bg-purple/5 border-purple/30"
                    : "border-transparent hover:bg-bg3 hover:border-border"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[9px] uppercase tracking-[1px] text-purple shrink-0">{s.source}</span>
                  <span className="font-mono text-[9px] text-text3">{s.year}</span>
                  <span className={`ml-auto font-mono text-[9px] shrink-0 ${s.evidenceScore >= 8 ? "text-teal" : s.evidenceScore >= 6 ? "text-amber" : "text-red"}`}>
                    EV {s.evidenceScore.toFixed(1).replace(".", ",")}
                  </span>
                </div>
                <p className={`text-[12px] leading-snug line-clamp-2 ${s.id === study2Id ? "text-text" : "text-text-secondary"}`}>
                  {s.title}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {!bothSelected ? (
        <div className="text-center py-16 text-text3">
          <FlaskConical className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p className="font-mono text-sm">Vyberte obě studie pro porovnání</p>
        </div>
      ) : (
        <>
          {/* Side-by-side headers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-card border border-border rounded-lg p-5">
              <span className="block font-mono text-[9px] uppercase tracking-[1.5px] text-teal mb-1">Studie A</span>
              <h3 className="font-heading text-sm font-semibold text-text leading-snug">{study1.title}</h3>
              <span className="block font-mono text-[10px] text-text3 mt-1">{study1.journal} · {study1.year}</span>
            </div>
            <div className="bg-card border border-border rounded-lg p-5">
              <span className="block font-mono text-[9px] uppercase tracking-[1.5px] text-purple mb-1">Studie B</span>
              <h3 className="font-heading text-sm font-semibold text-text leading-snug">{study2.title}</h3>
              <span className="block font-mono text-[10px] text-text3 mt-1">{study2.journal} · {study2.year}</span>
            </div>
          </div>

          {/* EV Score comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-card border border-border rounded-lg p-5 flex flex-col items-center">
              <span className="font-mono text-[9px] uppercase tracking-[1.5px] text-teal mb-3">Studie A</span>
              <EvidenceScore score={study1.evidenceScore} />
            </div>
            <div className="bg-card border border-border rounded-lg p-5 flex flex-col items-center">
              <span className="font-mono text-[9px] uppercase tracking-[1.5px] text-purple mb-3">Studie B</span>
              <EvidenceScore score={study2.evidenceScore} />
            </div>
          </div>

          {/* Metric table */}
          <div className="bg-card border border-border rounded-lg p-4 mb-6">
            <div className="grid grid-cols-[1fr_100px_1fr] py-1.5 border-b border-border mb-1">
              <span className="font-mono text-[9px] uppercase tracking-[1px] text-teal text-center">Studie A</span>
              <span className="font-mono text-[9px] uppercase tracking-[1px] text-text3 text-center">Metrika</span>
              <span className="font-mono text-[9px] uppercase tracking-[1px] text-purple text-center">Studie B</span>
            </div>
            <MetricRow label="Design" valueA={DESIGN_CZ[study1.studyDesign] || study1.studyDesign} valueB={DESIGN_CZ[study2.studyDesign] || study2.studyDesign} better="none" />
            <MetricRow label="Skóre" valueA={study1.evidenceScore.toFixed(1).replace(".", ",")} valueB={study2.evidenceScore.toFixed(1).replace(".", ",")} />
            <MetricRow
              label="Počet (n)"
              valueA={study1.sampleSize ? study1.sampleSize.toLocaleString("cs-CZ") : "—"}
              valueB={study2.sampleSize ? study2.sampleSize.toLocaleString("cs-CZ") : "—"}
            />
            <MetricRow label="Sekvenace" valueA={study1.sequencingMethod || "—"} valueB={study2.sequencingMethod || "—"} better="none" />
            <MetricRow label="Trvání" valueA={study1.duration || "—"} valueB={study2.duration || "—"} better="none" />
            <MetricRow label="Kohorta" valueA={study1.cohortType || "—"} valueB={study2.cohortType || "—"} better="none" />
            <MetricRow label="Zdroj" valueA={study1.source} valueB={study2.source} better="none" />
            <MetricRow label="Recenzováno" valueA={study1.isPeerReviewed ? "Ano" : study1.isPreprint ? "Preprint" : "Ne"} valueB={study2.isPeerReviewed ? "Ano" : study2.isPreprint ? "Preprint" : "Ne"} better="none" />
          </div>

          {/* Method fingerprint side-by-side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-card border border-border rounded-lg p-4">
              <span className="block font-mono text-[9px] uppercase tracking-[1.5px] text-teal mb-3">Metodologický profil A</span>
              <MethodFingerprint
                studyDesign={study1.studyDesign}
                sampleSize={study1.sampleSize}
                sequencingMethod={study1.sequencingMethod}
                cohortType={study1.cohortType}
                duration={study1.duration}
              />
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <span className="block font-mono text-[9px] uppercase tracking-[1.5px] text-purple mb-3">Metodologický profil B</span>
              <MethodFingerprint
                studyDesign={study2.studyDesign}
                sampleSize={study2.sampleSize}
                sequencingMethod={study2.sequencingMethod}
                cohortType={study2.cohortType}
                duration={study2.duration}
              />
            </div>
          </div>

          {/* Taxa comparison */}
          {(study1.taxa.length > 0 || study2.taxa.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-card border border-border rounded-lg p-4">
                <TaxaComparison taxa1={study1.taxa} taxa2={study2.taxa} />
              </div>
              <div className="bg-card border border-border rounded-lg p-4 flex items-center justify-center">
                <div className="text-center">
                  <ArrowLeftRight className="h-6 w-6 text-text3 mx-auto mb-2" />
                  <p className="font-mono text-[10px] text-text3">
                    {study1.taxa.length} taxonů vs. {study2.taxa.length} taxonů
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Summaries */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-lg p-4">
              <span className="block font-mono text-[9px] uppercase tracking-[1.5px] text-teal mb-2">Shrnutí A</span>
              <p className="text-text-secondary text-xs leading-relaxed">{study1.plainSummary}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <span className="block font-mono text-[9px] uppercase tracking-[1.5px] text-purple mb-2">Shrnutí B</span>
              <p className="text-text-secondary text-xs leading-relaxed">{study2.plainSummary}</p>
            </div>
          </div>

          {/* Quick verdict */}
          <div className="mt-6 bg-card border border-teal/20 rounded-lg p-5">
            <div className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-teal" />
              <div>
                <span className="block font-mono text-[10px] uppercase tracking-[1.5px] text-teal mb-0.5">Rychlý verdikt</span>
                <p className="text-text-secondary text-xs">
                  {study1.evidenceScore > study2.evidenceScore
                    ? `Studie A (${study1.evidenceScore.toFixed(1).replace(".", ",")}) má vyšší skóre důkazů než Studie B (${study2.evidenceScore.toFixed(1).replace(".", ",")}). ${
                        study1.sampleSize && study2.sampleSize && study1.sampleSize > study2.sampleSize
                          ? `Také pracuje s větším vzorkem (${study1.sampleSize.toLocaleString("cs-CZ")} vs ${study2.sampleSize.toLocaleString("cs-CZ")}).`
                          : ""
                      }`
                    : study2.evidenceScore > study1.evidenceScore
                      ? `Studie B (${study2.evidenceScore.toFixed(1).replace(".", ",")}) má vyšší skóre důkazů než Studie A (${study1.evidenceScore.toFixed(1).replace(".", ",")}). ${
                          study2.sampleSize && study1.sampleSize && study2.sampleSize > study1.sampleSize
                            ? `Také pracuje s větším vzorkem (${study2.sampleSize.toLocaleString("cs-CZ")} vs ${study1.sampleSize.toLocaleString("cs-CZ")}).`
                            : ""
                        }`
                      : "Obě studie mají stejné skóre důkazů. Zvažte další faktory jako velikost vzorku, design nebo relevanci pro váš výzkum."}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
