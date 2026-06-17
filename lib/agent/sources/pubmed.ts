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
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dateStr = `${yesterday.getFullYear()}/${String(yesterday.getMonth() + 1).padStart(2, "0")}/${String(yesterday.getDate()).padStart(2, "0")}`;

  try {
    // 1. Search for recent microbiome studies
    const searchUrl = `${PUBMED_BASE}/esearch.fcgi`;
    const searchRes = await axios.get(searchUrl, {
      params: {
        db: "pubmed",
        term: `microbiome[Title/Abstract] AND ("${dateStr}"[Date - Publication] : "3000"[Date - Publication])`,
        retmax: 50,
        retmode: "json",
        sort: "relevance",
      },
      timeout: 15000,
    });

    const idList: string[] = searchRes.data?.esearchresult?.idlist || [];
    if (idList.length === 0) return [];

    // 2. Fetch metadata
    const fetchUrl = `${PUBMED_BASE}/efetch.fcgi`;
    const fetchRes = await axios.get(fetchUrl, {
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return articles.map((article: any) => {
      const a = article.MedlineCitation?.[0];
      const art = a?.Article?.[0];
      const title = text(art?.ArticleTitle?.[0]) || "Neznámý název";
      const abstract = (art?.Abstract?.[0]?.AbstractText || []).map(text).join(" ") || "Abstrakt není k dispozici";
      const journal = text(art?.Journal?.[0]?.Title?.[0]) || text(art?.Journal?.[0]?.ISOAbbreviation?.[0]) || "Neznámý časopis";

      // Datum publikace — z DateCompleted (YYYY, MM, DD) nebo ArticleDate
      const dateObj = a?.DateCompleted?.[0] || art?.ArticleDate?.[0] || a?.DateRevised?.[0];
      const pubYear = parseInt(text(dateObj?.Year?.[0]) || String(new Date().getFullYear()));
      const pubMonth = parseInt(text(dateObj?.Month?.[0]) || "1");
      const pubDay = parseInt(text(dateObj?.Day?.[0]) || "1");
      const publishedAt = new Date(Date.UTC(pubYear, pubMonth - 1, pubDay)).toISOString();

      const pmid = text(a?.PMID?.[0]) || a?.PMID?.[0]?._ || "";
      const doi =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        art?.ELocationID?.find((e: any) => e.$.EIdType === "doi")?._
        || null;
      const authorList = art?.AuthorList?.[0]?.Author || [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const authors = authorList.map((auth: any) => {
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
        doi,
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
