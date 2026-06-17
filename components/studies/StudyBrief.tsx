"use client";

import { EvidenceScore } from "@/components/studies/EvidenceScore";
import { MethodFingerprint } from "@/components/studies/MethodFingerprint";
import { TaxaBarChart } from "@/components/studies/TaxaBarChart";
import { TagBadge } from "@/components/shared/TagBadge";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { ArrowUp, ArrowDown, Minus, ExternalLink, Bookmark, Columns2 } from "lucide-react";
import type { Study, StudyTaxon, Taxon, Tag } from "@prisma/client";
import type { FindingItem } from "@/types";

type StudyWithRelations = Study & {
  taxa: (StudyTaxon & { taxon: Taxon })[];
  tags: Tag[];
};

type StudyBriefProps = {
  study: StudyWithRelations;
};

export function StudyBrief({ study }: StudyBriefProps) {
  const findings: FindingItem[] = (() => {
    try {
      if (typeof study.keyFindings === "string") return JSON.parse(study.keyFindings);
      return (study.keyFindings as unknown as FindingItem[]) || [];
    } catch {
      return [];
    }
  })();

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="mb-2 flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[1.5px] text-teal">
            {study.source}
          </span>
          <span className="text-text3">·</span>
          <span className="font-mono text-[10px] text-text3">{study.journal}</span>
          <span className="text-text3">·</span>
          <span className="font-mono text-[10px] text-text3">
            {study.publishedAt
              ? new Date(study.publishedAt).toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric", year: "numeric" })
              : study.year}
          </span>
        </div>

        <h1 className="font-heading text-2xl font-bold tracking-[-0.5px] text-text leading-tight mb-3">
          {study.title}
        </h1>

        <div className="flex flex-wrap items-center gap-2 mb-6">
          {study.tags.map((tag) => (
            <TagBadge key={tag.id} label={tag.label} color={tag.color} />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-8 font-mono text-[10px] text-text3">
          <span>{study.journal}</span>
          <span>
            {study.publishedAt
              ? new Date(study.publishedAt).toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric", year: "numeric" })
              : study.year}
          </span>
          <span>{study.studyDesign.replace(/_/g, " ")}</span>
          {study.sampleSize && <span>n = {study.sampleSize.toLocaleString("cs-CZ")}</span>}
        </div>

        <section className="mb-8">
          <SectionHeader
            eyebrow="Shrnutí pro praxi"
            title="Shrnutí pro praxi"
          />
          <p className="text-text-secondary text-sm leading-relaxed">
            {study.plainSummary}
          </p>
        </section>

        <section className="mb-8">
          <SectionHeader
            eyebrow="Klíčová zjištění"
            title="Klíčová zjištění"
          />
          <div className="space-y-3">
            {findings.map((finding, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-card border border-border rounded-lg p-4"
              >
                <span className="text-xl mt-0.5 shrink-0">{finding.icon}</span>
                <p
                  className="text-sm text-text leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: finding.text }}
                />
              </div>
            ))}
          </div>
        </section>

        {study.taxa.length > 0 && (
          <section className="mb-8">
            <SectionHeader
              eyebrow="Dopad na taxony"
              title="Změny v abundanci taxonů"
            />
            <div className="bg-card border border-border rounded-lg p-4">
              <TaxaBarChart data={study.taxa} />
            </div>
          </section>
        )}

        <section>
          <SectionHeader
            eyebrow="Omezení"
            title="Omezení studie"
          />
          <p className="text-text-secondary text-sm leading-relaxed">
            {study.limitations}
          </p>
          {study.clinicalRelevance && (
            <div className="mt-4 p-4 rounded-lg bg-teal/5 border border-teal/10">
              <span className="block font-mono text-[10px] uppercase tracking-[1.5px] text-teal mb-1">
                Klinický význam
              </span>
              <p className="text-sm text-text leading-relaxed">
                {study.clinicalRelevance}
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Sidebar */}
      <aside className="lg:w-72 shrink-0">
        <div className="sticky top-20 space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <EvidenceScore score={study.evidenceScore} />
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <span className="block font-mono text-[10px] uppercase tracking-[1.5px] text-text3 mb-3">
              Metodologický profil
            </span>
            <MethodFingerprint
              studyDesign={study.studyDesign}
              sampleSize={study.sampleSize}
              sequencingMethod={study.sequencingMethod}
              cohortType={study.cohortType}
              duration={study.duration}
            />
          </div>

          {study.taxa.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-4">
              <span className="block font-mono text-[10px] uppercase tracking-[1.5px] text-text3 mb-3">
                Klíčové taxony
              </span>
              <div className="space-y-2">
                {study.taxa.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center gap-2 text-xs"
                  >
                    {st.direction === "UP" ? (
                      <ArrowUp className="h-3 w-3 text-teal shrink-0" />
                    ) : st.direction === "DOWN" ? (
                      <ArrowDown className="h-3 w-3 text-red shrink-0" />
                    ) : (
                      <Minus className="h-3 w-3 text-text3 shrink-0" />
                    )}
                    <span className="font-mono text-text italic">
                      {st.taxon.species || st.taxon.genus}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            {/* DOI — primární, permanentní odkaz */}
            {study.doi && (
              <a
                href={`https://doi.org/${study.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full h-9 rounded-md border border-teal/20 bg-teal/5 text-teal font-mono text-[11px] hover:bg-teal/10 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                DOI: {study.doi}
              </a>
            )}
            {/* PubMed — fallback */}
            {study.pmid && (
              <a
                href={`https://pubmed.ncbi.nlm.nih.gov/${study.pmid}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full h-9 rounded-md border border-border text-text-secondary font-mono text-[11px] hover:bg-card2 hover:text-text transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                PubMed: {study.pmid}
              </a>
            )}
            {/* URL časopisu — pouze pokud chybí DOI */}
            {!study.doi && study.url && (
              <a
                href={study.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full h-9 rounded-md border border-border text-text-secondary font-mono text-[11px] hover:bg-card2 hover:text-text transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Zobrazit původní článek
              </a>
            )}
            <button className="flex items-center justify-center gap-2 w-full h-9 rounded-md border border-border text-text-secondary font-mono text-[11px] hover:bg-card2 hover:text-text transition-colors">
              <Bookmark className="h-3.5 w-3.5" />
              Přidat do sbírky
            </button>
            <a
              href={`/comparator?study=${study.id}`}
              className="flex items-center justify-center gap-2 w-full h-9 rounded-md border border-border text-text-secondary font-mono text-[11px] hover:bg-card2 hover:text-text transition-colors"
            >
              <Columns2 className="h-3.5 w-3.5" />
              Porovnat s...
            </a>
          </div>
        </div>
      </aside>
    </div>
  );
}
