import axios from "axios";
import { parseStringPromise } from "xml2js";
import type { RawStudy } from "@/types";

// xml2js vrací někdy string, někdy { _: "text", $: {...} } — tato funkce extrahuje čistý text
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function text(val: any): string {
  if (typeof val === "string") return val;
  if (val && typeof val === "object" && typeof val._ === "string") return val._;
  return "";
}

const PUBMED_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

export async function fetchPubMed(): Promise<RawStudy[]> {
  try {
    // 1. Search for recent microbiome studies (pouze včerejší)
    const searchUrl = `${PUBMED_BASE}/esearch.fcgi`;
    const searchRes = await axios.get(searchUrl, {
      params: {
        db: "pubmed",
        term: 'microbiome[Title/Abstract] NOT "Nature"[Journal] NOT "Cell Host Microbe"[Journal] NOT "Gut"[Journal] NOT "bioRxiv"[Journal]',
        reldate: 1,           // pouze včerejší studie
        datetype: "pdat",     // podle data publikace
        retmax: 50,
        retmode: "json",
        sort: "relevance",
        usehistory: "y",
      },
      timeout: 15000,
    });

    const idList: string[] = searchRes.data?.esearchresult?.idlist || [];
    if (idList.length === 0) return [];

    // 2. Fetch metadata ve várkách po 50 (PubMed limit)
    const metadata: Array<Record<string, unknown>> = [];
    for (let i = 0; i < idList.length; i += 50) {
      const batch = idList.slice(i, i + 50);
      const fetchUrl = `${PUBMED_BASE}/efetch.fcgi`;
      const fetchRes = await axios.get(fetchUrl, {
        params: {
          db: "pubmed",
          id: batch.join(","),
          rettype: "xml",
          retmode: "xml",
        },
        timeout: 30000,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parsed = (await parseStringPromise(fetchRes.data)) as any;
      const articles = parsed?.PubmedArticleSet?.PubmedArticle || [];
      metadata.push(...articles);
    }

    return metadata.map((article: any) => {  // eslint-disable-line @typescript-eslint/no-explicit-any
      const a = article.MedlineCitation?.[0];
      const art = a?.Article?.[0];
      const title = text(art?.ArticleTitle?.[0]) || "Neznámý název";
      const abstract = (art?.Abstract?.[0]?.AbstractText || []).map(text).join(" ") || "Abstrakt není k dispozici";
      const journal = text(art?.Journal?.[0]?.Title?.[0]) || text(art?.Journal?.[0]?.ISOAbbreviation?.[0]) || "Neznámý časopis";

      // Datum publikace
      const dateObj = a?.DateCompleted?.[0] || art?.ArticleDate?.[0] || a?.DateRevised?.[0];
      const pubYear = parseInt(text(dateObj?.Year?.[0]) || String(new Date().getFullYear()));
      const pubMonth = parseInt(text(dateObj?.Month?.[0]) || "1");
      const pubDay = parseInt(text(dateObj?.Day?.[0]) || "1");
      const publishedAt = new Date(Date.UTC(pubYear, pubMonth - 1, pubDay)).toISOString();

      const pmid = text(a?.PMID?.[0]) || a?.PMID?.[0]?._ || "";
      const doi =
        art?.ELocationID?.find((e: any) => e.$.EIdType === "doi")?._  // eslint-disable-line @typescript-eslint/no-explicit-any
        || null;
      const authorList = art?.AuthorList?.[0]?.Author || [];
      const authors = authorList.map((auth: any) => {  // eslint-disable-line @typescript-eslint/no-explicit-any
        const last = text(auth.LastName?.[0]);
        const fore = text(auth.ForeName?.[0]);
        return `${last} ${fore}`;
      });

      return {
        title,
        abstract,
        authors: authors.length > 0 ? authors : ["Neznámý autor"],
        journal,
        year: pubYear,
        publishedAt,
        pmid: String(pmid),
        doi: typeof doi === "string" ? doi : undefined,
        url: doi ? `https://doi.org/${doi}` : `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
        source: "PUBMED" as const,
        isPeerReviewed: true,
        isPreprint: false,
      };
    });
  } catch (err) {
    console.error("[PubMed] Chyba při fetchování:", (err as Error).message);
    return [];
  }
}
