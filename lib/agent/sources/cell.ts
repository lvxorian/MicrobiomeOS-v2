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

export async function fetchCell(): Promise<RawStudy[]> {
  try {
    const res = await axios.get(
      "https://www.cell.com/action/doSearch?text1=microbiome&field1=AllField&journalCode=chom",
      { timeout: 15000, headers: { "User-Agent": "MicrobiomeOS/1.0" } }
    );
    const $ = load(res.data);
    const studies: RawStudy[] = [];

    $(".search-result").each((_, el) => {
      const title = $(el).find(".article-title a").text().trim();
      if (!title) return;
      const href = $(el).find(".article-title a").attr("href");
      const doi = extractDoi(href);
      const yearText = $(el).find(".publication-date").text().trim();
      const year = parseInt(yearText) || new Date().getFullYear();

      studies.push({
        title,
        abstract: "Abstrakt bude doplněn po stažení plného textu.",
        authors: [],
        journal: "Cell Host & Microbe",
        year,
        doi: doi || undefined,
        url: resolveUrl("https://www.cell.com", href),
        source: "CELL" as const,
        isPeerReviewed: true,
        isPreprint: false,
      });
    });

    return studies.slice(0, 10);
  } catch (err) {
    console.error("[Cell] Chyba:", (err as Error).message);
    return [];
  }
}
