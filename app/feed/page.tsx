import { getStudiesList } from "@/lib/db/queries";
import { StudyCard } from "@/components/studies/StudyCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Microscope } from "lucide-react";
import { FeedFilters } from "./FeedFilters";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: {
    page?: string;
    tag?: string;
    source?: string;
    minEvidence?: string;
    search?: string;
  };
};

function buildQuery(params: Record<string, string | undefined>): string {
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) usp.set(key, String(value));
  }
  return usp.toString();
}

export default async function FeedPage({ searchParams }: Props) {
  const page = parseInt(searchParams.page || "1");
  const tag = searchParams.tag;
  const source = searchParams.source;
  const minEvidence = searchParams.minEvidence ? parseFloat(searchParams.minEvidence) : undefined;
  const search = searchParams.search;

  const data = await getStudiesList({
    page,
    limit: 20,
    tag,
    source,
    minEvidence,
    search,
  });

  const totalPages = Math.ceil(data.total / 20);

  const q = (overrides: Record<string, string | undefined>) =>
    buildQuery({ tag, source, minEvidence: minEvidence?.toString(), search, ...overrides });

  return (
    <div className="max-w-7xl mx-auto">
      <SectionHeader
        eyebrow="Všechny studie"
        title="Přehled studií"
        description={
          search
            ? `Výsledky vyhledávání: "${search}" (${data.total} studií)`
            : `Celkem ${data.total} indexovaných studií`
        }
      />

      <FeedFilters currentTag={tag} currentSearch={search} />

      {data.studies.length === 0 ? (
        <div className="text-center py-24 text-text3">
          <Microscope className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p className="font-mono text-sm">Žádné studie k zobrazení</p>
          <p className="text-text3 text-xs mt-1">Zkuste změnit filtry</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {data.studies.map((study) => (
              <StudyCard key={study.id} study={study} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {page > 1 && (
                <Link
                  href={`/feed?${q({ page: String(page - 1) })}`}
                  className="px-3 py-1.5 rounded-md border border-border text-text-secondary font-mono text-xs hover:bg-card2 transition-colors"
                >
                  Předchozí
                </Link>
              )}
              <span className="font-mono text-xs text-text3">
                {page} / {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={`/feed?${q({ page: String(page + 1) })}`}
                  className="px-3 py-1.5 rounded-md border border-border text-text-secondary font-mono text-xs hover:bg-card2 transition-colors"
                >
                  Další
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
