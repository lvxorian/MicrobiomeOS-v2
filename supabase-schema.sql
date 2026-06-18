-- CreateTable
CREATE TABLE "Study" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "indexedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),
    "title" TEXT NOT NULL,
    "authors" TEXT NOT NULL DEFAULT '[]',
    "journal" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "doi" TEXT,
    "pmid" TEXT,
    "url" TEXT,
    "source" TEXT NOT NULL DEFAULT 'OTHER',
    "isPeerReviewed" BOOLEAN NOT NULL DEFAULT true,
    "isPreprint" BOOLEAN NOT NULL DEFAULT false,
    "plainSummary" TEXT NOT NULL,
    "keyFindings" TEXT NOT NULL DEFAULT '[]',
    "limitations" TEXT NOT NULL,
    "clinicalRelevance" TEXT,
    "evidenceScore" DOUBLE PRECISION NOT NULL,
    "studyDesign" TEXT NOT NULL DEFAULT 'OTHER',
    "sampleSize" INTEGER,
    "sequencingMethod" TEXT,
    "cohortType" TEXT,
    "duration" TEXT,

    CONSTRAINT "Study_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Taxon" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "genus" TEXT NOT NULL,
    "species" TEXT,
    "phylum" TEXT NOT NULL,
    "color" TEXT NOT NULL,

    CONSTRAINT "Taxon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyTaxon" (
    "id" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,
    "taxonId" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "magnitude" DOUBLE PRECISION,
    "pValue" DOUBLE PRECISION,
    "note" TEXT,

    CONSTRAINT "StudyTaxon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "color" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collection" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "emoji" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollectionStudy" (
    "id" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,

    CONSTRAINT "CollectionStudy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keywords" TEXT NOT NULL DEFAULT '[]',
    "minEvidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastTriggered" TIMESTAMP(3),

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertMatch" (
    "id" TEXT NOT NULL,
    "alertId" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,
    "matchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "seen" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AlertMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentRun" (
    "id" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "source" TEXT,
    "studiesFound" INTEGER NOT NULL DEFAULT 0,
    "studiesNew" INTEGER NOT NULL DEFAULT 0,
    "alertsFired" INTEGER NOT NULL DEFAULT 0,
    "errorMsg" TEXT,
    "logLines" TEXT NOT NULL DEFAULT '[]',

    CONSTRAINT "AgentRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyReport" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "summaryText" TEXT NOT NULL,
    "keyFindingsJson" TEXT NOT NULL DEFAULT '[]',
    "studiesCount" INTEGER NOT NULL,
    "studiesNew" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_StudyToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Study_doi_key" ON "Study"("doi");

-- CreateIndex
CREATE UNIQUE INDEX "Study_pmid_key" ON "Study"("pmid");

-- CreateIndex
CREATE INDEX "Study_evidenceScore_idx" ON "Study"("evidenceScore");

-- CreateIndex
CREATE INDEX "Study_source_idx" ON "Study"("source");

-- CreateIndex
CREATE INDEX "Study_indexedAt_idx" ON "Study"("indexedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Taxon_name_key" ON "Taxon"("name");

-- CreateIndex
CREATE UNIQUE INDEX "StudyTaxon_studyId_taxonId_key" ON "StudyTaxon"("studyId", "taxonId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_label_key" ON "Tag"("label");

-- CreateIndex
CREATE UNIQUE INDEX "CollectionStudy_collectionId_studyId_key" ON "CollectionStudy"("collectionId", "studyId");

-- CreateIndex
CREATE UNIQUE INDEX "AlertMatch_alertId_studyId_key" ON "AlertMatch"("alertId", "studyId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyReport_date_key" ON "DailyReport"("date");

-- CreateIndex
CREATE UNIQUE INDEX "_StudyToTag_AB_unique" ON "_StudyToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_StudyToTag_B_index" ON "_StudyToTag"("B");

-- AddForeignKey
ALTER TABLE "StudyTaxon" ADD CONSTRAINT "StudyTaxon_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyTaxon" ADD CONSTRAINT "StudyTaxon_taxonId_fkey" FOREIGN KEY ("taxonId") REFERENCES "Taxon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionStudy" ADD CONSTRAINT "CollectionStudy_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionStudy" ADD CONSTRAINT "CollectionStudy_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertMatch" ADD CONSTRAINT "AlertMatch_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "Alert"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertMatch" ADD CONSTRAINT "AlertMatch_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudyToTag" ADD CONSTRAINT "_StudyToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Study"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudyToTag" ADD CONSTRAINT "_StudyToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

