import axios from "axios";
import { load } from "cheerio";
import type { RawStudy } from "@/types";

function resolveUrl(base: string, href: string | undefined): string {
  if (!href) return base;
  if (href.startsWith("http://") || href.startsWith("https://")) return href;
  return base + (href.startsWith("/") ? "" : "/") + href;
}

function extractDoi(href: string | undefined): string | null {
  if (!href) return null;
  const doiMatch = href.match(/10\.\d{4,}\/[^\s?#]+/);
  return doiMatch ? doiMatch[0] : null;
}

export async function fetchNature(): Promise<RawStudy[]> {
  try {
    const res = await axios.get(
      "https://www.nature.com/search?q=microbiome&order=date_desc&date_range=last_7_days&article_type=research",
      { timeout: 15000, headers: { "User-Agent": "MicrobiomeOS/1.0" } }
    );
    const $ = load(res.data);
    const studies: RawStudy[] = [];

    $("article").each((_, el) => {
      const title = $(el).find("h3 a").text().trim();
      if (!title) return;
      const href = $(el).find("h3 a").attr("href");
      const doi = extractDoi(href);
      const year = new Date().getFullYear();

      studies.push({
        title,
        abstract: "Abstrakt bude doplněn po stažení plného textu.",
        authors: [],
        journal: "Nature",
        year,
        doi: doi || undefined,
        url: resolveUrl("https://www.nature.com", href),
        source: "NATURE" as const,
        isPeerReviewed: true,
        isPreprint: false,
      });
    });

    return studies.slice(0, 20);
  } catch (err) {
    console.error("[Nature] Chyba:", (err as Error).message);
    return [];
  }
}
