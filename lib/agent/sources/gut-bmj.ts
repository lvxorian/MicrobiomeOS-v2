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

export async function fetchGutBMJ(): Promise<RawStudy[]> {
  try {
    const res = await axios.get(
      "https://gut.bmj.com/search/microbiome%20jcode%3Agutjnl%20numresults%3A20%20sort%3Apublication-date%20direction%3Adescending",
      { timeout: 15000, headers: { "User-Agent": "MicrobiomeOS/1.0" } }
    );
    const $ = load(res.data);
    const studies: RawStudy[] = [];

    $(".search-result").each((_, el) => {
      const title = $(el).find(".article-title a").text().trim();
      if (!title) return;
      const href = $(el).find(".article-title a").attr("href");
      const doi = extractDoi(href);
      const yearText = $(el).find(".publication-year").text().trim();
      const year = parseInt(yearText) || new Date().getFullYear();

      studies.push({
        title,
        abstract: "Abstrakt bude doplněn po stažení plného textu.",
        authors: [],
        journal: "Gut",
        year,
        doi: doi || undefined,
        url: resolveUrl("https://gut.bmj.com", href),
        source: "GUT_BMJ" as const,
        isPeerReviewed: true,
        isPreprint: false,
      });
    });

    return studies.slice(0, 10);
  } catch (err) {
    console.error("[Gut BMJ] Chyba:", (err as Error).message);
    return [];
  }
}
