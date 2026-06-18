import axios from "axios";
import { parseStringPromise } from "xml2js";
import type { RawStudy } from "@/types";

// bioRxiv — přes PubMed API (preprint filtr)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function text(val: any): string {
  if (typeof val === "string") return val;
  if (val && typeof val === "object" && typeof val._ === "string") return val._;
  return "";
}

const PUBMED_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

export async function fetchBiorxiv(): Promise<RawStudy[]> {
  try {
    const searchRes = await axios.get(`${PUBMED_BASE}/esearch.fcgi`, {
      params: {
        db: "pubmed",
        term: 'microbiome AND ("bioRxiv"[Journal] OR preprint[ptyp])',
        reldate: 14,
        datetype: "pdat",
        retmax: 20,
        retmode: "json",
        sort: "date",
      },
      timeout: 15000,
    });

    const idList: string[] = searchRes.data?.esearchresult?.idlist || [];
    if (idList.length === 0) return [];

    const fetchRes = await axios.get(`${PUBMED_BASE}/efetch.fcgi`, {
      params: {
        db: "pubmed",
        id: idList.join(","),
        rettype: "xml",
        retmode: "xml",
      },
      timeout: 30000,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parsed = (await parseStringPromise(fetchRes.data)) as any;
    const articles = parsed?.PubmedArticleSet?.PubmedArticle || [];

    return articles.map((article: any) => {  // eslint-disable-line @typescript-eslint/no-explicit-any
      const a = article.MedlineCitation?.[0];
      const art = a?.Article?.[0];
      const title = text(art?.ArticleTitle?.[0]) || "Neznámý název";
      const abstract = (art?.Abstract?.[0]?.AbstractText || []).map(text).join(" ") || "Abstrakt není k dispozici";
      const pmid = text(a?.PMID?.[0]) || a?.PMID?.[0]?._ || "";
      const doi = art?.ELocationID?.find((e: any) => e.$.EIdType === "doi")?._ || null;  // eslint-disable-line @typescript-eslint/no-explicit-any
      const dateObj = a?.DateCompleted?.[0] || art?.ArticleDate?.[0];
      const pubYear = parseInt(text(dateObj?.Year?.[0]) || String(new Date().getFullYear()));

      return {
        title,
        abstract,
        authors: ["bioRxiv"],
        journal: "bioRxiv",
        year: pubYear,
        isPeerReviewed: false,
        isPreprint: true,
        pmid: String(pmid),
        doi: typeof doi === "string" ? doi : undefined,
        url: doi ? `https://doi.org/${doi}` : `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
        source: "BIORXIV" as const,
      };
    });
  } catch (err) {
    console.error("[bioRxiv] Chyba:", (err as Error).message);
    return [];
  }
}
