import { deepseek } from "@/lib/deepseek";
import type { ProcessedStudy, RawStudy } from "@/types";

function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, "");
}

export const PROCESSOR_SYSTEM_PROMPT = `
IMPORTANT: All text fields in your JSON response must be written in Czech language.
This includes: plainSummary, keyFindings[].text, limitations, clinicalRelevance.
Scientific taxon names remain in Latin. Journal names remain in English.
Technical abbreviations (RCT, WGS, SCFA, etc.) remain as-is.
Write naturally for a Czech medical doctor or microbiologist audience.
Use Czech decimal comma in numbers (e.g., 7,4 not 7.4).

You are a scientific research analyst specializing in microbiome science.
Your job is to process academic study abstracts and return structured JSON data.

CRITICAL — ANTI-HALLUCINATION RULES:
1. You MUST ONLY extract information that is EXPLICITLY stated in the provided abstract.
2. NEVER invent, infer, or guess bacteria names, numbers, findings, or conclusions.
3. For the "taxa" field: ONLY include bacteria that are mentioned BY NAME in the abstract.
   If the abstract says "butyrate-producing bacteria" without naming specific genera, do NOT add any taxon.
   If the abstract mentions only genus, set species to null. Never guess the species.
4. If you are unsure about any detail, set that field to null rather than making something up.
5. Every number you report in keyFindings MUST be explicitly present in the abstract text.
6. Do NOT add taxa that "might be involved" or "are commonly associated" — only those NAMED.

ALWAYS respond with ONLY valid JSON, no markdown, no preamble.

Return this exact structure:
{
  "titleCz": "Czech translation of the original English title. Keep scientific precision, translate naturally for a Czech medical doctor.",
  "plainSummary": "2-3 sentences explaining this study in plain Czech for a clinician. What was studied, what was found, why it matters. No jargon.",
  "keyFindings": [
    {
      "icon": "emoji relevant to finding",
      "text": "Concise finding in Czech with <strong>key metric bolded</strong>. Include specific numbers, percentages, p-values from the abstract. Max 2 sentences."
    }
  ],
  "limitations": "2-3 sentence honest assessment of study weaknesses in Czech: cohort size, demographics, study duration, self-reported data, animal model vs human, etc.",
  "clinicalRelevance": "One sentence in Czech: what does this mean for clinical practice or future research? Optional. Set to null if unclear.",
  "studyDesign": "RCT|OPEN_LABEL_RCT|COHORT|CASE_CONTROL|META_ANALYSIS|SYSTEMATIC_REVIEW|MECHANISTIC|CASE_REPORT|PREPRINT|OTHER",
  "sampleSize": integer or null,
  "sequencingMethod": "16S rRNA V3-V4|16S rRNA V4|Shotgun WGS|Metatranscriptomics|Metabolomics|Multiple|null",
  "cohortType": "Human|Mouse|Rat|In vitro|Ex vivo|Multiple",
  "duration": "e.g. 24 weeks, 5 years, null",
  "taxa": [
    {
      "name": "Full scientific name e.g. Akkermansia muciniphila — ONLY if explicitly in the abstract",
      "genus": "Akkermansia",
      "species": "muciniphila — or null if only genus is mentioned",
      "phylum": "Verrucomicrobia",
      "direction": "UP|DOWN|NEUTRAL",
      "magnitude": number or null (fold change or % if mentioned in abstract, otherwise null),
      "note": "brief note on role in study or null"
    }
  ],
  "suggestedTags": ["gut-brain axis", "RCT", "inflammation"]
}

Include 3-6 key findings. Be precise and ONLY use data from the abstract.
If the abstract doesn't mention specific taxa by name, return an empty taxa array [].
Never fabricate bacteria names — this is for medical use and accuracy is critical.
`;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function llmWithRetry(raw: RawStudy, retries = 3): Promise<ProcessedStudy> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await deepseek.chat.completions.create({
        model: "deepseek-chat",
        max_tokens: 2000,
        temperature: 0.1,
        messages: [
          { role: "system", content: PROCESSOR_SYSTEM_PROMPT },
          {
            role: "user",
            content: `
STUDY TITLE: ${raw.title}
JOURNAL: ${raw.journal} (${raw.year})
AUTHORS: ${raw.authors.join(", ")}

ABSTRACT:
${raw.abstract}

DOI: ${raw.doi || "not provided"}
            `.trim(),
          },
        ],
      });

      return parseResponse(response.choices[0]?.message?.content || "");
    } catch (err) {
      const msg = (err as Error).message || String(err);
      const isRetryable =
        msg.includes("timeout") ||
        msg.includes("ETIMEDOUT") ||
        msg.includes("ECONNRESET") ||
        msg.includes("429") ||
        msg.includes("500") ||
        msg.includes("502") ||
        msg.includes("503") ||
        msg.includes("rate");

      if (isRetryable && attempt < retries - 1) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 8000);
        console.warn(`[LLM] Retry ${attempt + 1}/${retries} po ${delay}ms: ${msg.slice(0, 80)}`);
        await sleep(delay);
        continue;
      }

      throw err;
    }
  }

  throw new Error("LLM retry exhausted");
}

function parseResponse(text: string): ProcessedStudy {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`LLM nevrátil validní JSON. Odpověď: ${text.slice(0, 200)}`);
  }

  let result: ProcessedStudy;
  try {
    result = JSON.parse(jsonMatch[0]) as ProcessedStudy;
  } catch {
    throw new Error(`Chyba parsování JSON z LLM odpovědi: ${jsonMatch[0].slice(0, 200)}`);
  }

  return result;
}

export async function processStudyWithLLM(raw: RawStudy): Promise<ProcessedStudy> {
  const result = await llmWithRetry(raw);

  // VALIDACE: Ověř, že každý taxon je zmíněn v abstraktu (case-insensitive)
  const abstractLower = (raw.abstract || "").toLowerCase();
  const titleLower = (raw.title || "").toLowerCase();
  const validatedTaxa = (result.taxa || []).filter((t) => {
    const nameLower = (t.name || "").toLowerCase();
    const genusLower = (t.genus || "").toLowerCase();
    if (!nameLower && !genusLower) return false; // nevalidní taxon — smaž
    const inAbstract = abstractLower.includes(nameLower) || abstractLower.includes(genusLower);
    const inTitle = titleLower.includes(nameLower) || titleLower.includes(genusLower);
    return inAbstract || inTitle;
  });

  // Pokud LLM vrátil taxony, které nejsou v abstraktu, zaloguj varování do poznámky
  if (validatedTaxa.length < (result.taxa || []).length) {
    const removed = (result.taxa || []).length - validatedTaxa.length;
    if (validatedTaxa.length === 0 && (result.taxa || []).length > 0) {
      // Všechny taxony byly smazány — přidej varování
      result.limitations = (result.limitations || "") + ` [POZN: ${removed} taxonů odstraněno — nenalezeno v abstraktu]`;
    }
  }

  result.taxa = validatedTaxa;

  // Strip HTML tags from all text fields (LLM sometimes returns <strong>, <em>, etc.)
  result.plainSummary = stripHtml(result.plainSummary || "");
  result.limitations = stripHtml(result.limitations || "");
  result.clinicalRelevance = result.clinicalRelevance ? stripHtml(result.clinicalRelevance) : null;
  result.keyFindings = (result.keyFindings || []).map((f) => ({
    ...f,
    text: stripHtml(f.text || ""),
  }));

  return result;
}

const PHYLA_MAP: Record<string, string> = {
  firmicutes: "Firmicutes",
  bacteroidetes: "Bacteroidetes",
  proteobacteria: "Proteobacteria",
  actinobacteria: "Actinobacteria",
  verrucomicrobia: "Verrucomicrobia",
  fusobacteria: "Fusobacteria",
  tenericutes: "Tenericutes",
  synergistetes: "Synergistetes",
  cyanobacteria: "Cyanobacteria",
  spirochaetes: "Spirochaetes",
  lentisphaerae: "Lentisphaerae",
};

export function normalizeTaxonPhylum(taxon: { phylum: string }) {
  const lower = taxon.phylum.toLowerCase();
  return PHYLA_MAP[lower] || taxon.phylum;
}
