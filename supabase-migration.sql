-- MicrobiomeOS — Audit migration
-- Spustit v Supabase SQL Editoru (Run without RLS)
-- Obsahuje jen nové indexy a změny ON DELETE CASCADE (přidáno 18. 6. 2026)

-- Nové indexy na Study (dedup + vyhledávání)
CREATE INDEX IF NOT EXISTS "Study_title_journal_year_idx" ON "Study"("title", "journal", "year");
CREATE INDEX IF NOT EXISTS "Study_title_idx" ON "Study"("title");
CREATE UNIQUE INDEX IF NOT EXISTS "Study_title_journal_year_key" ON "Study"("title", "journal", "year");

-- Index na userId pro Collection
CREATE INDEX IF NOT EXISTS "Collection_userId_idx" ON "Collection"("userId");

-- Index na userId pro Alert
CREATE INDEX IF NOT EXISTS "Alert_userId_idx" ON "Alert"("userId");

-- Indexy na AlertMatch (notifikace)
CREATE INDEX IF NOT EXISTS "AlertMatch_seen_idx" ON "AlertMatch"("seen");
CREATE INDEX IF NOT EXISTS "AlertMatch_matchedAt_idx" ON "AlertMatch"("matchedAt");

-- Indexy na AgentRun (monitoring)
CREATE INDEX IF NOT EXISTS "AgentRun_status_idx" ON "AgentRun"("status");
CREATE INDEX IF NOT EXISTS "AgentRun_startedAt_idx" ON "AgentRun"("startedAt");

-- Změna StudyTaxon_taxonId: RESTRICT → CASCADE (aby šlo mazat taxony bez chyby)
ALTER TABLE "StudyTaxon" DROP CONSTRAINT IF EXISTS "StudyTaxon_taxonId_fkey";
ALTER TABLE "StudyTaxon" ADD CONSTRAINT "StudyTaxon_taxonId_fkey"
  FOREIGN KEY ("taxonId") REFERENCES "Taxon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
