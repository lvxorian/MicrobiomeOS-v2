import type { ProcessedStudy } from "@/types";

const DESIGN_SCORES: Record<string, number> = {
  META_ANALYSIS: 4,
  SYSTEMATIC_REVIEW: 3.5,
  RCT: 3.5,
  OPEN_LABEL_RCT: 2.5,
  COHORT: 2,
  CASE_CONTROL: 1.5,
  MECHANISTIC: 1,
  CASE_REPORT: 0.5,
  PREPRINT: 0.5,
  OTHER: 0.5,
};

const TOP_JOURNALS = [
  "Nature",
  "Cell",
  "Science",
  "Lancet",
  "NEJM",
  "Nature Medicine",
  "Cell Host",
];

export function scoreEvidence(study: ProcessedStudy, raw: { journal: string; isPeerReviewed: boolean; isPreprint: boolean }): number {
  let score = 0;

  // Study design (0-4 points)
  score += DESIGN_SCORES[study.studyDesign] || 0.5;

  // Sample size (0-2 points)
  if (study.sampleSize) {
    if (study.sampleSize >= 1000) score += 2;
    else if (study.sampleSize >= 200) score += 1.5;
    else if (study.sampleSize >= 50) score += 1;
    else score += 0.3;
  }

  // Sequencing method (0-1 point)
  if (study.sequencingMethod?.includes("WGS")) score += 1;
  else if (study.sequencingMethod?.includes("16S")) score += 0.6;

  // Human study (0-1 point)
  if (study.cohortType === "Human") score += 1;

  // Peer review (0-1 point)
  if (raw.isPeerReviewed && !raw.isPreprint) score += 1;

  // Journal prestige (+0.5 for top journals)
  if (TOP_JOURNALS.some((j) => raw.journal.includes(j))) score += 0.5;

  return Math.min(10, Math.round(score * 10) / 10);
}
