import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const J = JSON.stringify;

async function main() {
  console.log("Seeding MicrobiomeOS...");

  // ── TAXA ──────────────────────────────────────────────
  const taxaData = [
    { name: "Akkermansia muciniphila", genus: "Akkermansia", species: "muciniphila", phylum: "Verrucomicrobia", color: "#36B8F5" },
    { name: "Faecalibacterium prausnitzii", genus: "Faecalibacterium", species: "prausnitzii", phylum: "Firmicutes", color: "#00D4AA" },
    { name: "Bacteroides thetaiotaomicron", genus: "Bacteroides", species: "thetaiotaomicron", phylum: "Bacteroidetes", color: "#7B61FF" },
    { name: "Lactobacillus rhamnosus", genus: "Lactobacillus", species: "rhamnosus", phylum: "Firmicutes", color: "#00D4AA" },
    { name: "Bifidobacterium longum", genus: "Bifidobacterium", species: "longum", phylum: "Actinobacteria", color: "#FF4D6A" },
    { name: "Roseburia intestinalis", genus: "Roseburia", species: "intestinalis", phylum: "Firmicutes", color: "#00D4AA" },
    { name: "Escherichia coli", genus: "Escherichia", species: "coli", phylum: "Proteobacteria", color: "#F5A623" },
    { name: "Prevotella copri", genus: "Prevotella", species: "copri", phylum: "Bacteroidetes", color: "#7B61FF" },
    { name: "Clostridium butyricum", genus: "Clostridium", species: "butyricum", phylum: "Firmicutes", color: "#00D4AA" },
    { name: "Enterococcus faecalis", genus: "Enterococcus", species: "faecalis", phylum: "Firmicutes", color: "#00D4AA" },
    { name: "Ruminococcus bromii", genus: "Ruminococcus", species: "bromii", phylum: "Firmicutes", color: "#00D4AA" },
    { name: "Desulfovibrio piger", genus: "Desulfovibrio", species: "piger", phylum: "Proteobacteria", color: "#F5A623" },
  ];

  for (const t of taxaData) {
    await prisma.taxon.upsert({ where: { name: t.name }, update: {}, create: t });
  }
  console.log(`  ✓ ${taxaData.length} taxonů`);

  // ── TAGS ──────────────────────────────────────────────
  const tagData = [
    { label: "inzulinová rezistence", color: "teal" },
    { label: "střevní bariéra", color: "teal" },
    { label: "diabetes 2. typu", color: "amber" },
    { label: "gut-brain axis", color: "purple" },
    { label: "deprese", color: "purple" },
    { label: "probiotika", color: "teal" },
    { label: "IBD", color: "red" },
    { label: "SCFA", color: "teal" },
    { label: "zánět", color: "red" },
    { label: "vláknina", color: "teal" },
    { label: "diverzita mikrobioty", color: "purple" },
    { label: "FMT", color: "amber" },
    { label: "RCT", color: "teal" },
    { label: "metabolomika", color: "purple" },
    { label: "mukózní imunita", color: "purple" },
  ];

  for (const t of tagData) {
    await prisma.tag.upsert({ where: { label: t.label }, update: {}, create: t });
  }
  console.log(`  ✓ ${tagData.length} tagů`);

  // ── STUDIE ────────────────────────────────────────────
  const allTaxa = await prisma.taxon.findMany();
  const allTags = await prisma.tag.findMany();
  const tl = (label: string) => allTags.find((t) => t.label === label)!;
  const tx = (name: string) => allTaxa.find((t) => t.name === name)!;

  const makeStudy = async (data: any) => {
    await prisma.study.upsert({
      where: { doi: data.doi },
      update: {},
      create: data,
    });
  };

  // Studie 1
  await makeStudy({
    title: "Pasteurizovaná Akkermansia muciniphila zlepšuje inzulinovou rezistenci: dvojitě zaslepená RCT u pacientů s diabetem 2. typu",
    authors: J(["Depommier C", "Everard A", "Druart C", "Maiter D", "Cani PD"]),
    journal: "Nature Medicine",
    year: 2024,
    doi: "10.1038/s41591-024-02932-5",
    pmid: "38528321",
    url: "https://www.nature.com/articles/s41591-024-02932-5",
    source: "NATURE",
    publishedAt: new Date("2024-03-18"),
    indexedAt: new Date(),
    plainSummary: "Tato 24týdenní randomizovaná kontrolovaná studie prokázala, že pasteurizovaná Akkermansia muciniphila výrazně snižuje inzulinovou rezistenci u pacientů s diabetem 2. typu. Intervence obnovila integritu střevní sliznice a snížila systémový zánět. Výsledky naznačují klinický potenciál cílené modulace mukózní mikrobioty.",
    keyFindings: J([
      { icon: "📉", text: "<strong>34% snížení HOMA-IR</strong> po 12 týdnech, efekt přetrvával při kontrole ve 24. týdnu (p<0,001)" },
      { icon: "🔬", text: "<strong>Snížení sérového LPS o 28 %</strong> signalizuje obnovu střevní bariéry (p=0,002)" },
      { icon: "🧬", text: "<strong>Zvýšení butyrátu ve stolici o 42 %</strong> (p<0,01), korelace se zlepšením inzulinové senzitivity" },
      { icon: "⚖️", text: "<strong>Snížení CRP o 21 %</strong> — systémový protizánětlivý účinek nezávislý na změně hmotnosti" },
    ]),
    limitations: "Jednocentrová studie (Belgie), převážně kavkazská populace. Velikost vzorku 148 účastníků je dostatečná pro primární endpoint, ale nemusí zachytit vzácné nežádoucí účinky. Mechanismus účinku nebyl plně objasněn — není jasné, zda efekt zprostředkovávají bakteriální proteiny, metabolity nebo modulace imunitní odpovědi.",
    clinicalRelevance: "Pasteurizovaná A. muciniphila představuje potenciálně bezpečnou a účinnou intervenci pro pacienty s metabolickým syndromem, kterou lze kombinovat se standardní antidiabetickou léčbou.",
    evidenceScore: 9.2,
    studyDesign: "RCT",
    sampleSize: 148,
    sequencingMethod: "Shotgun WGS",
    cohortType: "Human",
    duration: "24 týdnů",
    taxa: {
      create: [
        { taxonId: tx("Akkermansia muciniphila").id, direction: "UP", magnitude: 2.8, pValue: 0.001, note: "Suplementace vedla k 2,8násobnému zvýšení abundance" },
        { taxonId: tx("Faecalibacterium prausnitzii").id, direction: "UP", magnitude: 1.5, pValue: 0.01, note: "Komenzální zvýšení v důsledku protizánětlivého prostředí" },
        { taxonId: tx("Roseburia intestinalis").id, direction: "UP", magnitude: 1.8, pValue: 0.005, note: "Producent butyrátu, zvýšená abundance" },
        { taxonId: tx("Clostridium butyricum").id, direction: "UP", magnitude: 1.3, pValue: 0.03, note: "Mírné zvýšení produkce butyrátu" },
      ],
    },
    tags: { connect: [{ id: tl("inzulinová rezistence").id }, { id: tl("střevní bariéra").id }, { id: tl("diabetes 2. typu").id }, { id: tl("RCT").id }, { id: tl("SCFA").id }] },
  });

  // Studie 2
  await makeStudy({
    title: "Mikrobiální signatura deprese: multi-omická kohortová studie identifikující specifické taxony spojené s osou střevo-mozek",
    authors: J(["Valles-Colomer M", "Falony G", "Darzi Y", "Tigchelaar EF", "Raes J"]),
    journal: "Cell Host & Microbe",
    year: 2024,
    doi: "10.1016/j.chom.2024.05.007",
    pmid: "38823456",
    url: "https://www.cell.com/cell-host-microbe/fulltext/S1931-3128(24)00123-4",
    source: "CELL",
    publishedAt: new Date("2024-05-12"),
    indexedAt: new Date(),
    plainSummary: "Rozsáhlá kohortová studie analyzovala střevní mikrobiom 2 340 účastníků a identifikovala specifické bakteriální signatury spojené s depresí. Deprese byla spojena s nižší abundancí butyrát-produkujících bakterií a zvýšenou abundancí prozánětlivých taxonů. Tyto změny byly nezávislé na užívání antidepresiv.",
    keyFindings: J([
      { icon: "🧠", text: "<strong>Snížení Faecalibacterium o 37 %</strong> u pacientů s depresí oproti kontrolám (FDR<0,01)" },
      { icon: "📊", text: "<strong>Depresivní pacienti měli o 28 % nižší diverzitu mikrobioty</strong> (Shannonův index, p<0,001)" },
      { icon: "🦠", text: "<strong>Zvýšení Bacteroidetes:Firmicutes poměru o 15 %</strong> u osob s těžkou depresí (p=0,003)" },
      { icon: "🧪", text: "<strong>Snížení fekálního butyrátu o 23 %</strong>, negativní korelace se skóre deprese (r=−0,41)" },
      { icon: "💊", text: "Efekt <strong>nezávislý na antidepresivní medikaci</strong> — mikrobiota depresivních neléčených pacientů se lišila od léčených i kontrol" },
    ]),
    limitations: "Observační design neumožňuje určit kauzalitu — není jasné, zda změna mikrobioty depresi způsobuje, nebo je jejím důsledkem. Studie nezahrnovala metabolomiku séra. Dietní návyky byly sbírány dotazníkem (FFQ), který je zatížen recall bias.",
    clinicalRelevance: "Identifikace mikrobiální signatury deprese otevírá cestu k vývoji psychobiotik — cílených probiotických intervencí pro adjuvantní léčbu deprese.",
    evidenceScore: 7.8,
    studyDesign: "COHORT",
    sampleSize: 2340,
    sequencingMethod: "Shotgun WGS",
    cohortType: "Human",
    duration: "průřezová",
    taxa: {
      create: [
        { taxonId: tx("Faecalibacterium prausnitzii").id, direction: "DOWN", magnitude: 0.63, pValue: 0.001, note: "Výrazné snížení u depresivních pacientů" },
        { taxonId: tx("Bacteroides thetaiotaomicron").id, direction: "UP", magnitude: 1.4, pValue: 0.01, note: "Zvýšená abundance, součást posunu B:F poměru" },
        { taxonId: tx("Prevotella copri").id, direction: "DOWN", magnitude: 0.55, pValue: 0.005, note: "Snížení, souvisí s dietními změnami" },
        { taxonId: tx("Escherichia coli").id, direction: "UP", magnitude: 1.6, pValue: 0.02, note: "Zvýšení prozánětlivých kmenů" },
        { taxonId: tx("Bifidobacterium longum").id, direction: "DOWN", magnitude: 0.7, pValue: 0.03, note: "Mírné snížení" },
      ],
    },
    tags: { connect: [{ id: tl("gut-brain axis").id }, { id: tl("deprese").id }, { id: tl("zánět").id }] },
  });

  // Studie 3
  await makeStudy({
    title: "Účinnost probiotik v léčbě zánětlivých střevních onemocnění: systematický přehled a meta-analýza 47 RCT",
    authors: J(["Khor B", "Gardet A", "Xavier RJ"]),
    journal: "Gut",
    year: 2024,
    doi: "10.1136/gutjnl-2024-328975",
    pmid: "39123456",
    url: "https://gut.bmj.com/content/early/2024/08/01/gutjnl-2024-328975",
    source: "GUT_BMJ",
    publishedAt: new Date("2024-08-01"),
    indexedAt: new Date(),
    plainSummary: "Tato komplexní meta-analýza shrnuje výsledky 47 randomizovaných kontrolovaných studií zkoumajících účinnost probiotik u pacientů s ulcerózní kolitidou a Crohnovou chorobou. Probiotika významně zvyšují míru remise u ulcerózní kolitidy, ale efekt u Crohnovy choroby je omezený. Nejsilnější důkazy byly nalezeny pro VSL#3 a E. coli Nissle 1917.",
    keyFindings: J([
      { icon: "✅", text: "<strong>Zvýšení remise o 27 %</strong> u ulcerózní kolitidy při podávání probiotik (RR 1,27; 95% CI 1,12-1,44, p<0,001)" },
      { icon: "❌", text: "<strong>Bez signifikantního účinku na Crohnovu chorobu</strong> (RR 1,05; 95% CI 0,89-1,24, p=0,57)" },
      { icon: "🥇", text: "<strong>VSL#3 a E. coli Nissle 1917</strong> vykázaly nejkonzistentnější benefit napříč studiemi" },
      { icon: "📋", text: "<strong>Kombinovaná probiotika účinnější než monokmeny</strong> (efekt o 18 % vyšší, p=0,004)" },
      { icon: "🛡️", text: "<strong>Nízké riziko nežádoucích účinků</strong> — výskyt srovnatelný s placebem (3,2 % vs. 3,8 %)" },
    ]),
    limitations: "Výrazná heterogenita mezi studiemi (I²=62 %), rozdíly v dávkování, kmenech a délce intervence. Většina studií byla krátkodobá (8-12 týdnů). Publikační bias nelze zcela vyloučit, ač Eggerův test nebyl signifikantní. Jen 4 studie používaly WGS pro ověření engraftmentu.",
    clinicalRelevance: "Probiotika by měla být zvažována jako adjuvantní léčba pro udržení remise u ulcerózní kolitidy. U Crohnovy choroby současné důkazy nepodporují rutinní preskripci.",
    evidenceScore: 9.5,
    studyDesign: "META_ANALYSIS",
    sampleSize: 4890,
    sequencingMethod: "Multiple",
    cohortType: "Human",
    duration: "různá (8-52 týdnů)",
    taxa: {
      create: [
        { taxonId: tx("Lactobacillus rhamnosus").id, direction: "UP", magnitude: null, pValue: 0.001, note: "Nejčastější probiotický kmen, zvýšení abundance" },
        { taxonId: tx("Bifidobacterium longum").id, direction: "UP", magnitude: null, pValue: 0.005, note: "Častá součást probiotických směsí" },
        { taxonId: tx("Escherichia coli").id, direction: "UP", magnitude: null, pValue: 0.01, note: "Kmen Nissle 1917 — probiotický efekt" },
        { taxonId: tx("Faecalibacterium prausnitzii").id, direction: "UP", magnitude: null, pValue: 0.02, note: "Nepřímé zvýšení po probiotické intervenci" },
      ],
    },
    tags: { connect: [{ id: tl("probiotika").id }, { id: tl("IBD").id }, { id: tl("SCFA").id }] },
  });

  // Studie 4
  await makeStudy({
    title: "Butyrát-produkující Clostridium butyricum tlumí střevní zánět prostřednictvím modulace Treg buněk: studie na myším modelu kolitidy",
    authors: J(["Chen L", "Wang Y", "Zhang H", "Liu J"]),
    journal: "bioRxiv",
    year: 2024,
    doi: "10.1101/2024.06.12.598765",
    url: "https://www.biorxiv.org/content/10.1101/2024.06.12.598765",
    source: "BIORXIV",
    isPeerReviewed: false,
    isPreprint: true,
    publishedAt: new Date("2024-06-12"),
    indexedAt: new Date(),
    plainSummary: "Tato preklinická studie na myším modelu dextran-sulfátové kolitidy zkoumala účinky suplementace Clostridium butyricum na střevní zánět. Léčba významně snížila histologické skóre kolitidy a zvýšila populaci regulačních T lymfocytů v lamina propria. Klíčovým mechanismem byla produkce butyrátu a následná aktivace GPR109a receptoru.",
    keyFindings: J([
      { icon: "🐭", text: "<strong>Snížení histologického skóre kolitidy o 58 %</strong> oproti kontrolám (p<0,001)" },
      { icon: "🧬", text: "<strong>Zvýšení populace Treg buněk o 2,3násobek</strong> v lamina propria tlustého střeva (p<0,001)" },
      { icon: "🧪", text: "<strong>Zvýšení fekálního butyrátu o 89 %</strong>, pozitivní korelace s Treg expanzí (r=0,78)" },
      { icon: "⚛️", text: "Mechanismus zprostředkován <strong>GPR109a receptorem</strong> — u GPR109a KO myší efekt vymizel" },
    ]),
    limitations: "Jedná se o preprint, data neprošla peer review. Studie byla provedena pouze na myším modelu — přenos na lidskou fyziologii je nejistý. Malý počet zvířat na skupinu (n=8). Použitý chemický model kolitidy (DSS) neodpovídá plně lidské IBD. Délka intervence 14 dní je krátká.",
    clinicalRelevance: "C. butyricum představuje slibného kandidáta pro vývoj nové generace probiotik cílených na střevní zánět, ale před klinickými studiemi je nutná replikace a validace mechanismu.",
    evidenceScore: 5.2,
    studyDesign: "MECHANISTIC",
    sampleSize: 32,
    sequencingMethod: "16S rRNA V4",
    cohortType: "Mouse",
    duration: "14 dní",
    taxa: {
      create: [
        { taxonId: tx("Clostridium butyricum").id, direction: "UP", magnitude: 4.5, pValue: 0.001, note: "Suplementace vedla k masivnímu zvýšení abundance" },
        { taxonId: tx("Roseburia intestinalis").id, direction: "UP", magnitude: 1.6, pValue: 0.01, note: "Komenzální zvýšení" },
        { taxonId: tx("Enterococcus faecalis").id, direction: "DOWN", magnitude: 0.4, pValue: 0.005, note: "Snížení prozánětlivého Enterococcus" },
      ],
    },
    tags: { connect: [{ id: tl("SCFA").id }, { id: tl("zánět").id }, { id: tl("IBD").id }] },
  });

  // Studie 5
  await makeStudy({
    title: "Vysokovláknová dieta zvyšuje diverzitu střevní mikrobioty a produkci mastných kyselin s krátkým řetězcem: 12týdenní RCT",
    authors: J(["Wastyk HC", "Fragiadakis GK", "Perelman D", "Sonnenburg JL"]),
    journal: "Nature",
    year: 2023,
    doi: "10.1038/s41586-023-06950-2",
    pmid: "37812345",
    url: "https://www.nature.com/articles/s41586-023-06950-2",
    source: "NATURE",
    publishedAt: new Date("2023-10-15"),
    indexedAt: new Date(),
    plainSummary: "Tato 12týdenní randomizovaná kontrolovaná studie porovnávala účinky vysokovláknové diety (40 g/den) a fermentovaných potravin na složení střevní mikrobioty u 124 zdravých dospělých. Vysokovláknová dieta významně zvýšila diverzitu mikrobioty a produkci mastných kyselin s krátkým řetězcem, ale efekt byl vysoce individuální a závisel na výchozím složení mikrobioty.",
    keyFindings: J([
      { icon: "🌾", text: "<strong>Zvýšení Shannonova indexu diverzity o 18 %</strong> ve vysokovláknové skupině (p<0,001)" },
      { icon: "🧪", text: "<strong>Zvýšení fekálního acetátu o 31 %, propionátu o 24 %, butyrátu o 19 %</strong> (vše p<0,01)" },
      { icon: "🦠", text: "<strong>Respondéři (62 % účastníků) vykázali 3× větší nárůst SCFA</strong> než non-respondéři" },
      { icon: "📈", text: "<strong>Výchozí diverzita predikovala odpověď</strong> — účastníci s nízkou diverzitou profitovali nejvíce" },
      { icon: "🫙", text: "Fermentované potraviny <strong>nezvýšily diverzitu, ale snížily 11 prozánětlivých cytokinů</strong> (p<0,05)" },
    ]),
    limitations: "Relativně malý vzorek pro personalizovanou analýzu (n=124). Krátká doba intervence (12 týdnů). Účastníci byli zdraví dospělí, výsledky nelze přímo aplikovat na pacienty s onemocněním. Dietní compliance byla hodnocena dotazníkem, nikoliv kontrolovaným krmením.",
    clinicalRelevance: "Personalizovaný přístup k dietním intervencím založený na výchozím mikrobiomu může významně zvýšit účinnost. Vysokovláknová dieta je účinnější u jedinců s nízkou výchozí diverzitou.",
    evidenceScore: 8.7,
    studyDesign: "RCT",
    sampleSize: 124,
    sequencingMethod: "Shotgun WGS",
    cohortType: "Human",
    duration: "12 týdnů",
    taxa: {
      create: [
        { taxonId: tx("Ruminococcus bromii").id, direction: "UP", magnitude: 3.2, pValue: 0.001, note: "Klíčový degradátor rezistentního škrobu" },
        { taxonId: tx("Prevotella copri").id, direction: "UP", magnitude: 2.1, pValue: 0.01, note: "Zvýšení u respondérů na vlákninu" },
        { taxonId: tx("Bacteroides thetaiotaomicron").id, direction: "UP", magnitude: 1.5, pValue: 0.02, note: "Generalistický degradátor polysacharidů" },
        { taxonId: tx("Desulfovibrio piger").id, direction: "DOWN", magnitude: 0.45, pValue: 0.03, note: "Snížení prozánětlivého sulfát-redukujícího taxonu" },
      ],
    },
    tags: { connect: [{ id: tl("vláknina").id }, { id: tl("SCFA").id }, { id: tl("diverzita mikrobioty").id }, { id: tl("RCT").id }] },
  });

  // Studie 6
  await makeStudy({
    title: "Fekální mikrobiální transplantace u rekurentní infekce Clostridioides difficile a mimo ni: systematický přehled zahrnující 12 400 pacientů",
    authors: J(["Allegretti JR", "Fisher M", "Kassam Z", "Kelly CR"]),
    journal: "Lancet Gastroenterology & Hepatology",
    year: 2023,
    doi: "10.1016/S2468-1253(23)00345-X",
    pmid: "37945678",
    url: "https://www.thelancet.com/journals/langas/article/PIIS2468-1253(23)00345-X",
    source: "PUBMED",
    publishedAt: new Date("2023-12-05"),
    indexedAt: new Date(),
    plainSummary: "Tento systematický přehled analyzoval 187 studií s celkem 12 400 pacienty, kteří podstoupili fekální mikrobiální transplantaci (FMT). FMT dosahuje vynikající účinnosti 92 % u rekurentní C. difficile infekce. Přehled dále mapuje nové indikace včetně IBD, metabolického syndromu a onkologické imunoterapie, kde je účinnost zatím omezená a variabilní.",
    keyFindings: J([
      { icon: "🏆", text: "<strong>92% úspěšnost FMT u rekurentní C. difficile</strong> napříč všemi studiemi (95% CI 90-94 %)" },
      { icon: "🔬", text: "<strong>Jednorázová FMT účinná v 86 %</strong>, druhá FMT zvyšuje úspěšnost na 96 %" },
      { icon: "💊", text: "<strong>Kapslová FMT non-inferiorní vůči kolonoskopické</strong> (non-inferiority margin 10 %, p<0,001)" },
      { icon: "⚠️", text: "<strong>U IBD jen 37% klinická odpověď</strong> — indikace off-label, nutný výběr pacientů" },
      { icon: "🧬", text: "<strong>Engraftment donorové mikrobioty</strong> detekován u 78 % respondérů vs. 12 % non-respondérů (p<0,001)" },
      { icon: "🛡️", text: "<strong>Závažné nežádoucí účinky u 2,3 %</strong>, převážně související s aplikační cestou, nikoliv s FMT per se" },
    ]),
    limitations: "Výrazná heterogenita v metodologii FMT napříč studiemi — různé dávkování, příprava, cesta podání. Dlouhodobá bezpečnostní data (>5 let) jsou omezená. U non-C. difficile indikací je evidence slabá, většinou z nerandomizovaných studií. Standardizace donorového screeningu a přípravy materiálu je stále nevyřešená.",
    clinicalRelevance: "FMT by měla být standardem péče u rekurentní C. difficile infekce po selhání antibiotické léčby. Rozšíření indikací vyžaduje výsledky probíhajících RCT.",
    evidenceScore: 8.9,
    studyDesign: "SYSTEMATIC_REVIEW",
    sampleSize: 12400,
    sequencingMethod: "Multiple",
    cohortType: "Human",
    duration: "různá",
    taxa: {
      create: [
        { taxonId: tx("Faecalibacterium prausnitzii").id, direction: "UP", magnitude: 2.1, pValue: 0.001, note: "Konzistentní zvýšení po úspěšné FMT" },
        { taxonId: tx("Bacteroides thetaiotaomicron").id, direction: "UP", magnitude: 1.8, pValue: 0.005, note: "Obnova komenzálních Bacteroidetes" },
        { taxonId: tx("Clostridium butyricum").id, direction: "UP", magnitude: 1.9, pValue: 0.003, note: "Zvýšení produkce butyrátu" },
        { taxonId: tx("Escherichia coli").id, direction: "DOWN", magnitude: 0.3, pValue: 0.001, note: "Snížení patogenních Enterobacteriaceae" },
        { taxonId: tx("Enterococcus faecalis").id, direction: "DOWN", magnitude: 0.35, pValue: 0.01, note: "Pokles po obnově zdravé mikrobioty" },
      ],
    },
    tags: { connect: [{ id: tl("FMT").id }, { id: tl("diverzita mikrobioty").id }, { id: tl("SCFA").id }] },
  });

  console.log("  ✓ 6 studií");

  // ── KOLEKCE ───────────────────────────────────────────
  const studies = await prisma.study.findMany();
  const sd = (doi: string) => studies.find((s) => s.doi === doi)!;

  for (const col of [
    {
      id: "col-gut-brain",
      name: "Osa střevo–mozek",
      description: "Studie zkoumající vztah mezi střevní mikrobiotou a duševním zdravím — deprese, úzkost, kognitivní funkce.",
      emoji: "🧠",
      studyDois: ["10.1016/j.chom.2024.05.007", "10.1038/s41586-023-06950-2"],
    },
    {
      id: "col-inflammation",
      name: "Zánět a IBD",
      description: "Probiotické a mikrobiální intervence u zánětlivých střevních onemocnění.",
      emoji: "🔥",
      studyDois: ["10.1136/gutjnl-2024-328975", "10.1101/2024.06.12.598765"],
    },
    {
      id: "col-scfa",
      name: "Mastné kyseliny s krátkým řetězcem",
      description: "Produkce a účinky SCFA — butyrát, acetát, propionát — na lidské zdraví.",
      emoji: "🧪",
      studyDois: ["10.1038/s41591-024-02932-5", "10.1038/s41586-023-06950-2", "10.1101/2024.06.12.598765"],
    },
  ]) {
    await prisma.collection.upsert({
      where: { id: col.id },
      update: {},
      create: {
        id: col.id,
        name: col.name,
        description: col.description,
        emoji: col.emoji,
        userId: "seed-user",
        studies: {
          create: col.studyDois.map((doi) => ({ studyId: sd(doi).id })),
        },
      },
    });
  }

  console.log("  ✓ 3 kolekce");

  // ── ALERTY ────────────────────────────────────────────
  const alertsData = [
    {
      id: "alert-akkermansia",
      name: "Akkermansia + metabolický syndrom",
      keywords: J(["Akkermansia", "metabolický", "inzulin", "diabetes", "obezita"]),
      minEvidence: 6.0,
      doi: "10.1038/s41591-024-02932-5",
    },
    {
      id: "alert-probiotics",
      name: "Probiotika a klinické studie",
      keywords: J(["probiotik", "RCT", "remise", "Lactobacillus", "Bifidobacterium", "klinick"]),
      minEvidence: 7.0,
      doi: "10.1136/gutjnl-2024-328975",
    },
  ];

  for (const a of alertsData) {
    await prisma.alert.upsert({
      where: { id: a.id },
      update: {},
      create: {
        id: a.id,
        userId: "seed-user",
        name: a.name,
        keywords: a.keywords,
        minEvidence: a.minEvidence,
        isActive: true,
        lastTriggered: new Date(),
        matches: { create: [{ studyId: sd(a.doi).id, seen: false }] },
      },
    });
  }

  console.log("  ✓ 2 alerty");

  // ── AGENT RUN ──────────────────────────────────────────
  await prisma.agentRun.create({
    data: {
      startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      finishedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      status: "SUCCESS",
      studiesFound: 47,
      studiesNew: 6,
      alertsFired: 2,
      logLines: J([
        { timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(), type: "INFO", message: "Agent spuštěn — zahajuji denní sken" },
        { timestamp: new Date(Date.now() - 119 * 60 * 1000).toISOString(), type: "FETCH", message: "PubMed: hledání posledních 24h..." },
        { timestamp: new Date(Date.now() - 118 * 60 * 1000).toISOString(), type: "FETCH", message: "PubMed: nalezeno 23 studií" },
        { timestamp: new Date(Date.now() - 117 * 60 * 1000).toISOString(), type: "PARSE", message: "Zpracování: Akkermansia muciniphila zlepšuje inzulinovou rezistenci..." },
        { timestamp: new Date(Date.now() - 116 * 60 * 1000).toISOString(), type: "STORE", message: "Uloženo: Akkermansia muciniphila zlepšuje inzulinovou rezistenci (DOI: 10.1038/s41591-024-02932-5)" },
        { timestamp: new Date(Date.now() - 115 * 60 * 1000).toISOString(), type: "ALERT", message: "Upozornění: 'Akkermansia + metabolický syndrom' — 1 nová studie" },
        { timestamp: new Date(Date.now() - 95 * 60 * 1000).toISOString(), type: "FETCH", message: "Nature: RSS feed — nalezeno 8 studií" },
        { timestamp: new Date(Date.now() - 94 * 60 * 1000).toISOString(), type: "PARSE", message: "Zpracování: Vysokovláknová dieta zvyšuje diverzitu střevní mikrobioty..." },
        { timestamp: new Date(Date.now() - 93 * 60 * 1000).toISOString(), type: "STORE", message: "Uloženo: Vysokovláknová dieta zvyšuje diverzitu střevní mikrobioty (DOI: 10.1038/s41586-023-06950-2)" },
        { timestamp: new Date(Date.now() - 75 * 60 * 1000).toISOString(), type: "FETCH", message: "Cell: nalezeno 5 studií" },
        { timestamp: new Date(Date.now() - 74 * 60 * 1000).toISOString(), type: "PARSE", message: "Zpracování: Mikrobiální signatura deprese..." },
        { timestamp: new Date(Date.now() - 73 * 60 * 1000).toISOString(), type: "STORE", message: "Uloženo: Mikrobiální signatura deprese (DOI: 10.1016/j.chom.2024.05.007)" },
        { timestamp: new Date(Date.now() - 55 * 60 * 1000).toISOString(), type: "FETCH", message: "Gut BMJ: nalezeno 6 studií" },
        { timestamp: new Date(Date.now() - 54 * 60 * 1000).toISOString(), type: "PARSE", message: "Zpracování: Účinnost probiotik v léčbě IBD..." },
        { timestamp: new Date(Date.now() - 53 * 60 * 1000).toISOString(), type: "STORE", message: "Uloženo: Účinnost probiotik v léčbě IBD (DOI: 10.1136/gutjnl-2024-328975)" },
        { timestamp: new Date(Date.now() - 52 * 60 * 1000).toISOString(), type: "ALERT", message: "Upozornění: 'Probiotika a klinické studie' — 1 nová studie" },
        { timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(), type: "FETCH", message: "bioRxiv: nalezeno 3 studie" },
        { timestamp: new Date(Date.now() - 34 * 60 * 1000).toISOString(), type: "PARSE", message: "Zpracování: Clostridium butyricum tlumí střevní zánět..." },
        { timestamp: new Date(Date.now() - 33 * 60 * 1000).toISOString(), type: "STORE", message: "Uloženo: Clostridium butyricum tlumí střevní zánět (DOI: 10.1101/2024.06.12.598765)" },
        { timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(), type: "FETCH", message: "PubMed: nalezeno 5 studií" },
        { timestamp: new Date(Date.now() - 19 * 60 * 1000).toISOString(), type: "PARSE", message: "Zpracování: FMT u rekurentní C. difficile..." },
        { timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(), type: "STORE", message: "Uloženo: FMT u rekurentní C. difficile (DOI: 10.1016/S2468-1253(23)00345-X)" },
        { timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), type: "INFO", message: "Denní sken dokončen — 47 studií nalezeno, 6 nově uloženo, 2 upozornění" },
      ]),
    },
  });

  console.log("  ✓ 1 agent run\n");

  // ── DAILY REPORT ──────────────────────────────────────
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  await prisma.dailyReport.upsert({
    where: { date: todayStart },
    update: {},
    create: {
      date: todayStart,
      summaryText:
        "Dnešní sken přinesl 47 studií, z toho 6 nových indexovaných. Nejvýznamnějším nálezem je potvrzení účinnosti pasteurizované Akkermansia muciniphila na inzulinovou rezistenci u diabetiků 2. typu — studie s EV 9,2 v Nature Medicine posiluje důkazy pro klinické využití cílené modulace mikrobioty. V oblasti osy střevo–mozek přibyla rozsáhlá kohortová studie identifikující mikrobiální signaturu deprese. Meta-analýza 47 RCT v Gut potvrzuje benefit probiotik u ulcerózní kolitidy, zatímco u Crohnovy choroby efekt zůstává neprůkazný. Celkově pozorujeme trend k personalizované mikrobiomové intervenci — od dietních vláken přes probiotika až po FMT — s důrazem na výchozí složení mikrobioty jako prediktor odpovědi.",
      keyFindingsJson: J([
        { title: "Akkermansia muciniphila a inzulinová rezistence — RCT, EV 9,2", studyId: sd("10.1038/s41591-024-02932-5").id },
        { title: "Mikrobiální signatura deprese — kohorta 2 340 osob", studyId: sd("10.1016/j.chom.2024.05.007").id },
        { title: "Probiotika u IBD — meta-analýza 47 RCT, EV 9,5", studyId: sd("10.1136/gutjnl-2024-328975").id },
        { title: "Butyrát a Treg modulace — mechanistická studie", studyId: sd("10.1101/2024.06.12.598765").id },
        { title: "Vláknina a diverzita mikrobioty — RCT, EV 8,7", studyId: sd("10.1038/s41586-023-06950-2").id },
        { title: "FMT u C. difficile — systematický přehled 12 400 pacientů, EV 8,9", studyId: sd("10.1016/S2468-1253(23)00345-X").id },
      ]),
      studiesCount: 47,
      studiesNew: 6,
    },
  });
  console.log("  ✓ 1 daily report\n");
  console.log("Seed dokončen!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
