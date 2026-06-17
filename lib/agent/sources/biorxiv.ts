import axios from "axios";
import type { RawStudy } from "@/types";

export async function fetchBiorxiv(): Promise<RawStudy[]> {
  try {
    const res = await axios.get(
      "https://api.biorxiv.org/details/biorxiv/2024-01-01/2024-12-31/0/50",
      { timeout: 15000 }
    );
    const items = res.data?.collection || [];

    return items
      .filter((item: Record<string, unknown>) => {
        const title = String(item.title || "").toLowerCase();
        const abstract = String(item.abstract || "").toLowerCase();
        return title.includes("microbiom") || title.includes("microbiot") || abstract.includes("microbiom") || abstract.includes("microbiot");
      })
      .map((item: Record<string, unknown>) => ({
        title: item.title || "Neznámý název",
        abstract: item.abstract || "Abstrakt není k dispozici",
        authors: item.authors ? String(item.authors).split(";") : ["Neznámý autor"],
        journal: "bioRxiv",
        year: new Date(String(item.date || Date.now())).getFullYear(),
        publishedAt: String(item.date || new Date().toISOString()),
        doi: item.doi || null,
        url: `https://www.biorxiv.org/content/${item.doi || ""}`,
        source: "BIORXIV" as const,
        isPeerReviewed: false,
        isPreprint: true,
      }));
  } catch (err) {
    console.error("[bioRxiv] Chyba:", (err as Error).message);
    return [];
  }
}
