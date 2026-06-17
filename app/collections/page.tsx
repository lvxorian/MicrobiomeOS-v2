import { getCollections } from "@/lib/db/queries";
import { getSession } from "@/lib/auth";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { StudyCard } from "@/components/studies/StudyCard";
import { FolderHeart } from "lucide-react";

export default async function CollectionsPage() {
  const session = await getSession();
  const userId = session?.user?.email || "seed-user";
  const collections = await getCollections(userId);

  return (
    <div className="max-w-7xl mx-auto">
      <SectionHeader
        eyebrow="Organizace výzkumu"
        title="Sbírky"
        description="Tematické kolekce studií pro váš výzkum. Ukládejte a organizujte studie do vlastních sbírek."
      />

      {collections.length === 0 ? (
        <div className="text-center py-24 text-text3">
          <FolderHeart className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p className="font-mono text-sm">Žádné sbírky</p>
          <p className="text-text3 text-xs mt-1">Vytvořte svou první sbírku</p>
        </div>
      ) : (
        <div className="space-y-8">
          {collections.map((col) => (
            <div key={col.id}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{col.emoji}</span>
                <div>
                  <h2 className="font-heading text-lg font-semibold text-text">{col.name}</h2>
                  {col.description && (
                    <p className="text-text-secondary text-xs">{col.description}</p>
                  )}
                </div>
                <span className="ml-auto font-mono text-[10px] text-text3">
                  {col.studies.length} studií
                </span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {col.studies.map((cs) => (
                  <StudyCard key={cs.id} study={cs.study} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
