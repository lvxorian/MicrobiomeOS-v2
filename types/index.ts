import type { Study, Taxon, StudyTaxon, Tag, Collection, CollectionStudy, Alert, AlertMatch, AgentRun } from "@prisma/client";

export type {
  Study,
  Taxon,
  StudyTaxon,
  Tag,
  Collection,
  CollectionStudy,
  Alert,
  AlertMatch,
  AgentRun,
};

export type FindingItem = {
  icon: string;
  text: string;
};

export type LogLine = {
  timestamp: string;
  type: "FETCH" | "PARSE" | "STORE" | "ALERT" | "INFO" | "ERROR";
  message: string;
};

export type StudyWithTaxa = Study & {
  taxa: (StudyTaxon & { taxon: Taxon })[];
  tags: Tag[];
};

export type StudyCardData = Pick<
  Study,
  | "id"
  | "title"
  | "plainSummary"
  | "evidenceScore"
  | "studyDesign"
  | "sampleSize"
  | "journal"
  | "year"
  | "source"
  | "isPeerReviewed"
  | "isPreprint"
  | "indexedAt"
> & {
  taxa: (StudyTaxon & { taxon: Taxon })[];
  tags: Tag[];
};

export type ProcessedStudy = {
  plainSummary: string;
  keyFindings: FindingItem[];
  limitations: string;
  clinicalRelevance: string | null;
  studyDesign: string;
  sampleSize: number | null;
  sequencingMethod: string | null;
  cohortType: string | null;
  duration: string | null;
  taxa: {
    name: string;
    genus: string;
    species: string | null;
    phylum: string;
    direction: "UP" | "DOWN" | "NEUTRAL";
    magnitude: number | null;
    note: string | null;
  }[];
  suggestedTags: string[];
};

export type RawStudy = {
  title: string;
  abstract: string;
  authors: string[];
  journal: string;
  year: number;
  pmid?: string;
  doi?: string;
  url?: string;
  source: "PUBMED" | "NATURE" | "CELL" | "BIORXIV" | "GUT_BMJ" | "OTHER";
  isPeerReviewed: boolean;
  isPreprint: boolean;
};

export type AgentSourceConfig = {
  key: string;
  name: string;
  cadence: string;
  query: string;
  lastRunAt?: string;
  lastStudiesFound?: number;
};

export type TaxonNode = {
  id: string;
  name: string;
  genus: string;
  species: string | null;
  phylum: string;
  color: string;
  studyCount: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
};

export type TaxonEdge = {
  source: string;
  target: string;
  weight: number;
  correlation: "positive" | "negative" | "neutral";
};
