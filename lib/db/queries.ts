import { prisma } from "@/lib/db/prisma";

export async function getStudiesCount() {
  return prisma.study.count();
}

export async function getTaxaCount() {
  return prisma.taxon.count();
}

export async function getAverageEvidenceScore(days = 30) {
  const result = await prisma.study.aggregate({
    _avg: { evidenceScore: true },
    where: {
      indexedAt: { gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) },
    },
  });
  return result._avg.evidenceScore || 0;
}

export async function getStudiesList({
  page = 1,
  limit = 20,
  tag,
  source,
  minEvidence,
  search,
  isNew,
}: {
  page?: number;
  limit?: number;
  tag?: string;
  source?: string;
  minEvidence?: number;
  search?: string;
  isNew?: boolean;
}) {
  const where: Record<string, unknown> = {};

  if (tag) {
    where.tags = { some: { label: tag } };
  }
  if (source) {
    where.source = source;
  }
  if (minEvidence !== undefined) {
    where.evidenceScore = { gte: minEvidence };
  }
  if (isNew) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    where.indexedAt = { gte: today };
  }
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { plainSummary: { contains: search } },
    ];
  }

  const [studies, total] = await Promise.all([
    prisma.study.findMany({
      where,
      include: {
        taxa: { include: { taxon: true } },
        tags: true,
      },
      orderBy: { indexedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.study.count({ where }),
  ]);

  return { studies, total, page };
}

export async function getStudyById(id: string) {
  return prisma.study.findUnique({
    where: { id },
    include: {
      taxa: { include: { taxon: true } },
      tags: true,
    },
  });
}

export async function getTaxaWithStudyCounts() {
  return prisma.taxon.findMany({
    include: {
      studies: {
        include: {
          study: { select: { id: true, title: true, evidenceScore: true } },
        },
      },
    },
  });
}

export async function getCollections(userId: string) {
  return prisma.collection.findMany({
    where: { userId },
    include: {
      studies: {
        include: {
          study: {
            include: {
              taxa: { include: { taxon: true } },
              tags: true,
            },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getAlerts(userId: string) {
  return prisma.alert.findMany({
    where: { userId },
    include: {
      matches: {
        include: { study: true },
        orderBy: { matchedAt: "desc" },
        take: 5,
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getLatestAgentRun() {
  return prisma.agentRun.findFirst({
    orderBy: { startedAt: "desc" },
  });
}

export async function getAgentRuns(limit = 5) {
  return prisma.agentRun.findMany({
    orderBy: { startedAt: "desc" },
    take: limit,
  });
}

export async function getTaxonEdges() {
  const studyTaxa = await prisma.studyTaxon.findMany({
    include: {
      taxon: true,
      study: true,
    },
  });

  const cooccurrence = new Map<string, { weight: number; directions: string[] }>();

  const studyGroups = new Map<string, typeof studyTaxa>();
  for (const st of studyTaxa) {
    const list = studyGroups.get(st.studyId) || [];
    list.push(st);
    studyGroups.set(st.studyId, list);
  }

  for (const [, taxa] of Array.from(studyGroups)) {
    for (let i = 0; i < taxa.length; i++) {
      for (let j = i + 1; j < taxa.length; j++) {
        const a = taxa[i];
        const b = taxa[j];
        const key = [a.taxonId, b.taxonId].sort().join("::");
        const existing = cooccurrence.get(key) || { weight: 0, directions: [] };
        existing.weight += 1;
        existing.directions.push(a.direction, b.direction);
        cooccurrence.set(key, existing);
      }
    }
  }

  const edges = Array.from(cooccurrence.entries()).map(([key, val]) => {
    const [source, target] = key.split("::");
    const upCount = val.directions.filter((d) => d === "UP").length;
    const downCount = val.directions.filter((d) => d === "DOWN").length;
    return {
      source,
      target,
      weight: val.weight,
      correlation:
        upCount > downCount ? ("positive" as const) : downCount > upCount ? ("negative" as const) : ("neutral" as const),
    };
  });

  return edges;
}
