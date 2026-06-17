import { KnowledgeGraph as Graph } from "@/components/graph/KnowledgeGraph";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { getTaxaWithStudyCounts, getTaxonEdges } from "@/lib/db/queries";
import type { TaxonNode } from "@/types";

export default async function GraphPage() {
  const [taxa, edges] = await Promise.all([getTaxaWithStudyCounts(), getTaxonEdges()]);

  const nodes: TaxonNode[] = taxa.map((t) => ({
    id: t.id,
    name: t.name,
    genus: t.genus,
    species: t.species,
    phylum: t.phylum,
    color: t.color,
    studyCount: t.studies.length,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
  }));

  // Map taxon ID → studies for sidebar
  const taxonStudies: Record<string, { id: string; title: string; evidenceScore: number }[]> = {};
  for (const t of taxa) {
    taxonStudies[t.id] = t.studies.map((st) => ({
      id: st.study.id,
      title: st.study.title,
      evidenceScore: st.study.evidenceScore,
    }));
  }

  return (
    <div className="max-w-7xl mx-auto">
      <SectionHeader
        eyebrow="Vizualizace dat"
        title="Síť taxonů"
        description="Interaktivní znalostní graf taxonů. Uzly = taxony (velikost dle počtu studií), hrany = ko-výskyt ve stejném výzkumu. Klikni na uzel pro detail. Zoom: kolečko myši, Pan: táhni."
      />
      <Graph nodes={nodes} edges={edges} taxonStudies={taxonStudies} />
    </div>
  );
}
