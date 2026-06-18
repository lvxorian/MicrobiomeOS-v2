# MicrobiomeOS — Stav projektu (18. 6. 2026)

## O projektu

MicrobiomeOS je SaaS platforma pro výzkumníky mikrobiomu. Agent denně prohledává PubMed, Nature, Cell Host & Microbe, bioRxiv a Gut BMJ, stahuje nové studie, přes DeepSeek API je zpracuje do strukturovaných výtahů v češtině a uloží do databáze. Uživatel pracuje s výtahy přes research dashboard.

## Tech stack

| Vrstva | Technologie |
|--------|------------|
| Frontend | Next.js 14 (App Router), Tailwind CSS, shadcn/ui |
| Databáze | PostgreSQL (produkce: Supabase), SQLite (lokální dev) |
| ORM | Prisma 5.22 |
| Auth | NextAuth.js (email magic link + GitHub OAuth) |
| AI | DeepSeek API (`deepseek-chat`) |
| Scraping | axios + cheerio + xml2js, PubMed E-utilities API |
| Vizualizace | Recharts (grafy), Canvas 2D (ColonyCanvas, Knowledge Graph) |
| Cron | node-cron (instrumentation.ts) |

## Co je hotovo a funkční

### Stránky (všechny české UI)
- `/` → redirect na `/dashboard`
- `/dashboard` — Hero panel "Live Intelligence" s denním AI reportem + stat karty + high-evidence studie
- `/feed` — přehled studií s filtry (tagy, search), paginace
- `/study/[id]` — detail studie: shrnutí, key findings, taxa chart, evidence score glow, DOI/PubMed odkazy
- `/graph` — Canvas force-directed knowledge graph taxonů (12 uzlů, zoom/pan, search, sidebar s odkazy na studie)
- `/collections` — sbírky studií (3 seed kolekce)
- `/comparator` — porovnání 2 studií vedle sebe (metriky s 🏆, taxa srovnání, rychlý verdikt)
- `/agent` — monitor agenta: 5 karet zdrojů, live log s DNA loading animací, "Spustit nyní" s pollingem
- `/alerts` — CRUD chytrých upozornění (vytvořit/editovat/smazat/toggle), zvoneček v topbaru s dropdownem
- `/login` — přihlašovací stránka (email magic link + GitHub)

### Agent
- 5 zdrojů: PubMed (E-utilities), Nature (scraper), Cell (PubMed API), bioRxiv (PubMed API), Gut BMJ (PubMed API)
- DeepSeek LLM processing: český překlad titulku, shrnutí, key findings, limitations, clinical relevance, taxa
- Anti-halucinace: striktní prompt (teplota 0.1), post-processing validace taxonů proti abstraktu
- Evidence scoring: design + sample size + WGS + human + peer review + journal prestige (0–10)
- Deduplikace: DOI → PMID → title+journal+year
- node-cron scheduler: denně v 05:00 SELČ (Europe/Prague)
- Daily Insight: po každém runu generuje expertní odstavec (DeepSeek, "Petr Ryšávka level")
- Live polling: AgentMonitor komponenta s sessionStorage pro background processing

### Design
- Dark theme (#07090F), bioluminiscenční teal akcenty, custom barevná paleta
- Fonty: Space Grotesk (headings), JetBrains Mono (data/badges), Inter (body)
- ColonyCanvas: 75 částic na pozadí, propojování do 110px, glow efekty
- Live Intelligence Hero: shimmer lesk (16s), bio-pulse tečka (6s), scan line (20s), hex grid, plovoucí částice
- Evidence Score: text-shadow glow, progress bar

### API
- `GET/POST /api/studies`, `GET /api/studies/[id]`
- `POST /api/agent/run`, `GET /api/agent/run/[id]`, `GET /api/agent/schedule`
- `GET/POST /api/alerts`, `PATCH/DELETE /api/alerts/[id]`, `PATCH /api/alerts/matches/[id]`
- `GET /api/taxa`, `GET /api/collections`

## Deployment — Vercel (ROZPRACOVÁNO)

### Konfigurace
- `package.json`: build = `node scripts/vercel-deploy.js && prisma generate && next build`
- `scripts/vercel-deploy.js`: safe prisma db push (chyba nezabije build)
- `schema.prisma`: provider = postgresql
- `.gitignore`: `.env` přidáno (byl commitnutý — způsobilo pád buildu)

### Vercel Environment Variables (nastavit v dashboardu)
```
DATABASE_URL=postgresql://postgres:<PASSWORD>@db.ratledxmxenifgmxmank.supabase.co:5432/postgres
DEEPSEEK_API_KEY=<your_deepseek_api_key>
NEXTAUTH_SECRET=<your_nextauth_secret>
NEXTAUTH_URL=https://tvoje-domena.vercel.app
```

### Supabase schéma
- SQL soubor: `supabase-schema.sql` (vygenerovaný z `prisma migrate diff`)
- Nutno spustit v Supabase SQL Editoru (Run without RLS)

### Problém Vercelu
- `.env` byl commitnutý s `DATABASE_URL=file:./dev.db` → přepsal Vercel env vars → build padal
- **OPRAVENO**: `.env` v `.gitignore`, odstraněn z Gitu, commit + push (91b0811)
- ~~Pending: ověřit že build prošel~~

## Známé problémy

1. **Vercel build — naposledy neprošel**. Po odstranění `.env` z Gitu by měl projít (commit 91b0811).
2. **Supabase IPv6** — lokálně nefunguje přímé připojení (chybí IPv6). Řešení: lokálně SQLite.
3. **API routy s `[id]`** — občasné build cache chyby na Windows. Všechny routy mají `force-dynamic`.
4. **Middlewarová auth** — dočasně vypnutá pro dev testování. Před produkcí zapnout.
5. **node-cron na Vercelu** — serverless funkce se periodicky restartují, cron nemusí být spolehlivý. Pro produkci zvážit Vercel Cron Jobs.

## Souborová struktura (klíčové soubory)

```
microbiome-os/
├── app/
│   ├── layout.tsx              # Root layout, fonty, ColonyCanvas, Sidebar, Topbar
│   ├── page.tsx                # redirect / → /dashboard
│   ├── dashboard/page.tsx      # Hero + stat karty + high-evidence grid
│   ├── feed/page.tsx           # Filtry, paginace
│   ├── study/[id]/page.tsx     # Detail studie
│   ├── graph/page.tsx          # Knowledge graph
│   ├── collections/page.tsx    # Sbírky
│   ├── comparator/page.tsx     # Porovnávač
│   ├── agent/page.tsx          # Monitor agenta
│   ├── alerts/page.tsx         # Chytré upozornění (CRUD)
│   ├── (auth)/login/page.tsx   # Login
│   └── api/                    # API routes
├── components/
│   ├── layout/                 # Sidebar, Topbar, ColonyCanvas, NotificationsBell
│   ├── shared/                 # TagBadge, StatCard, SectionHeader, DailyInsightHero
│   ├── studies/                # StudyCard, StudyBrief, StudyModal, MiniChart, TaxaBarChart, EvidenceScore, MethodFingerprint
│   ├── graph/                  # KnowledgeGraph (canvas force-directed)
│   └── agent/                  # AgentStatus, AgentMonitor (v app/agent/)
├── lib/
│   ├── agent/
│   │   ├── index.ts            # Hlavní orchestrátor
│   │   ├── processor.ts        # DeepSeek LLM zpracování + anti-halucinační validace
│   │   ├── scorer.ts           # Evidence scoring
│   │   ├── scheduler.ts        # node-cron (Europe/Prague)
│   │   ├── daily-insight.ts    # Generování Daily Reportu
│   │   └── sources/            # PubMed, Nature, Cell, bioRxiv, Gut BMJ
│   ├── db/
│   │   ├── prisma.ts           # Prisma singleton
│   │   ├── queries.ts          # DB queries
│   │   └── daily-report-queries.ts
│   ├── deepseek.ts             # DeepSeek API client
│   └── auth.ts                 # NextAuth config
├── prisma/
│   ├── schema.prisma           # Databázové schéma
│   └── seed.ts                 # 6 studií, 12 taxonů, 15 tagů, 3 kolekce, 2 alerty, 1 daily report
├── types/index.ts              # TypeScript typy
├── scripts/vercel-deploy.js    # Safe prisma db push pro Vercel
└── supabase-schema.sql         # SQL pro Supabase
```

## Aktuální cíl

1. **Dokončit Vercel deploy** — ověřit že build projde po odstranění `.env` z Gitu
2. **Zprovoznit auth middleware** — zapnout NextAuth middleware pro ochranu rout
3. **Test produkčního prostředí** — ověřit že Supabase + Vercel funguje end-to-end
4. **Případné bugfixy** — podle zpětné vazby z testování
