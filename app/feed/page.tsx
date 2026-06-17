import { getStudiesList } from "@/lib/db/queries";
import { StudyCard } from "@/components/studies/StudyCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Microscope } from "lucide-react";
import { FeedFilters } from "./FeedFilters";

type Props = {
  searchParams: {
    page?: string;
    tag?: string;
    source?: string;
    minEvidence?: string;
    search?: string;
  };
};

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
                <a
                  href={`/feed?page=${page - 1}${tag ? `&tag=${tag}` : ""}`}
                  className="px-3 py-1.5 rounded-md border border-border text-text-secondary font-mono text-xs hover:bg-card2 transition-colors"
                >
                  Předchozí
                </a>
              )}
              <span className="font-mono text-xs text-text3">
                {page} / {totalPages}
              </span>
              {page < totalPages && (
                <a
                  href={`/feed?page=${page + 1}${tag ? `&tag=${tag}` : ""}`}
                  className="px-3 py-1.5 rounded-md border border-border text-text-secondary font-mono text-xs hover:bg-card2 transition-colors"
                >
                  Další
                </a>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
