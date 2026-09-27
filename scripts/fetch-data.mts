#!/usr/bin/env tsx
/**
 * Populates `/data` from OpenAlex (see `openalex.mts`). Run via `npm run fetch-data`, and by the
 * `fetch-data` GitHub Actions workflow on a daily cron. Idempotent: re-running with the same
 * window just overwrites the files with a fresh snapshot.
 *
 * Curated to hard sciences + health (see CONCEPT_IDS) so the feed doesn't fill up with
 * humanities/social-science works that also happen to carry a science-adjacent tag.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchAuthors, fetchWorks, OpenAlexAuthorship, OpenAlexWork } from "./openalex.mts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data");
const PUBLIC_DATA_DIR = join(__dirname, "..", "public", "data");

// OpenAlex's level-0 ("top level") concepts for hard sciences, health, engineering and math.
// Deliberately excludes the humanities/social-science top concepts (history, philosophy, art,
// business, sociology, economics, political science, geography).
const CONCEPT_IDS = [
  "C41008148", // Computer science
  "C121332964", // Physics
  "C71924100", // Medicine
  "C86803240", // Biology
  "C192562407", // Materials science
  "C127413603", // Engineering
  "C185592680", // Chemistry
  "C33923547", // Mathematics
  "C15744967", // Psychology
  "C127313418", // Geology
  "C39432304", // Environmental science
];

const WINDOW_DAYS = 30;
const MAX_DISCOVERIES = 160;
const TOP_AUTHORS_TO_ENRICH = 40;
const TOP_INSTITUTIONS_IN_STATS = 10;
const TOP_CONCEPTS_IN_STATS = 10;
const TOP_COUNTRIES_IN_STATS = 10;

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function baseFilter(fromDate: string, toDate: string): string {
  return [
    `concepts.id:${CONCEPT_IDS.join("|")}`,
    `from_publication_date:${fromDate}`,
    `to_publication_date:${toDate}`,
    "type:article",
    "is_retracted:false",
    "is_paratext:false",
    "primary_location.source.type:journal",
  ].join(",");
}

/** OpenAlex stores an abstract as a word -> [positions] inverted index; this rebuilds the text. */
function reconstructAbstract(index: Record<string, number[]> | null): string | null {
  if (!index) return null;
  const words: string[] = [];
  for (const [word, positions] of Object.entries(index)) {
    for (const position of positions) words[position] = word;
  }
  const text = words.filter(Boolean).join(" ").trim();
  return text.length > 0 ? text : null;
}

const shortId = (openAlexUrl: string) => openAlexUrl.replace("https://openalex.org/", "");

function bestSourceUrl(work: OpenAlexWork): { url: string | null; isOpenAccess: boolean } {
  const oaUrl = work.open_access?.oa_url ?? null;
  if (oaUrl) return { url: oaUrl, isOpenAccess: true };
  const landing = work.primary_location?.landing_page_url ?? null;
  if (landing) return { url: landing, isOpenAccess: work.open_access?.is_oa ?? false };
  if (work.doi) return { url: work.doi, isOpenAccess: false };
  return { url: null, isOpenAccess: false };
}

function mapAuthors(authorships: OpenAlexAuthorship[]) {
  return authorships
    .filter((a) => a.author.id)
    .map((a) => {
      const institution = a.institutions[0] ?? null;
      return {
        id: shortId(a.author.id!),
        name: a.author.display_name,
        institutionId: institution ? shortId(institution.id) : undefined,
        institutionName: institution?.display_name,
      };
    });
}

function mapInstitutions(authorships: OpenAlexAuthorship[]) {
  const seen = new Map<string, { id: string; name: string; countryCode?: string }>();
  for (const authorship of authorships) {
    for (const inst of authorship.institutions) {
      const id = shortId(inst.id);
      if (!seen.has(id)) {
        seen.set(id, { id, name: inst.display_name, countryCode: inst.country_code ?? undefined });
      }
    }
  }
  return [...seen.values()];
}

async function main() {
  const now = new Date();
  const toDate = isoDate(now);
  const fromDate = isoDate(new Date(now.getTime() - WINDOW_DAYS * 86_400_000));
  const filter = baseFilter(fromDate, toDate);

  console.log(`Fetching OpenAlex works from ${fromDate} to ${toDate}...`);
  const recent = await fetchWorks(filter, "publication_date:desc", 200);
  const notable = await fetchWorks(filter, "cited_by_count:desc", 60);

  const byId = new Map<string, OpenAlexWork>();
  for (const work of [...recent, ...notable]) byId.set(work.id, work);
  const works = [...byId.values()]
    .filter((w) => w.title && w.authorships.length > 0)
    .sort((a, b) => b.publication_date.localeCompare(a.publication_date))
    .slice(0, MAX_DISCOVERIES);

  console.log(`Kept ${works.length} discoveries after de-duplication and filtering.`);

  // --- discoveries.json ---
  const discoveries = works.map((work) => {
    const { url, isOpenAccess } = bestSourceUrl(work);
    return {
      id: shortId(work.id),
      title: work.title!,
      abstractText: reconstructAbstract(work.abstract_inverted_index),
      publishedDate: work.publication_date,
      doi: work.doi,
      sourceUrl: url,
      isOpenAccess,
      venueName: work.primary_location?.source?.display_name ?? null,
      citedByCount: work.cited_by_count,
      concepts: work.concepts
        .filter((c) => c.level <= 2)
        .sort((a, b) => b.score - a.score)
        .slice(0, 6)
        .map((c) => ({ id: shortId(c.id), name: c.display_name, score: c.score })),
      authors: mapAuthors(work.authorships),
      institutions: mapInstitutions(work.authorships),
      openAlexUrl: work.id,
    };
  });

  // --- aggregate researchers (every author appearing in the kept discoveries) ---
  interface ResearcherAcc {
    id: string;
    name: string;
    institutionId: string | null;
    institutionName: string | null;
    orcid: string | null;
    discoveryIds: string[];
    citedByCountInSet: number;
  }
  const researcherAcc = new Map<string, ResearcherAcc>();
  for (const work of works) {
    for (const authorship of work.authorships) {
      if (!authorship.author.id) continue;
      const id = shortId(authorship.author.id);
      const institution = authorship.institutions[0] ?? null;
      const existing = researcherAcc.get(id);
      if (existing) {
        existing.discoveryIds.push(shortId(work.id));
        existing.citedByCountInSet += work.cited_by_count;
        existing.institutionId ??= institution ? shortId(institution.id) : null;
        existing.institutionName ??= institution?.display_name ?? null;
      } else {
        researcherAcc.set(id, {
          id,
          name: authorship.author.display_name,
          institutionId: institution ? shortId(institution.id) : null,
          institutionName: institution?.display_name ?? null,
          orcid: authorship.author.orcid,
          discoveryIds: [shortId(work.id)],
          citedByCountInSet: work.cited_by_count,
        });
      }
    }
  }

  const rankedResearchers = [...researcherAcc.values()].sort(
    (a, b) => b.citedByCountInSet - a.citedByCountInSet || b.discoveryIds.length - a.discoveryIds.length,
  );
  const toEnrich = rankedResearchers.slice(0, TOP_AUTHORS_TO_ENRICH).map((r) => r.id);
  console.log(`Enriching ${toEnrich.length} researcher profiles...`);
  const authorSummaries = await fetchAuthors(toEnrich.map((id) => `https://openalex.org/${id}`));

  const researchers = rankedResearchers.map((r) => {
    const summary = authorSummaries.get(`https://openalex.org/${r.id}`);
    return {
      id: r.id,
      name: r.name,
      institutionId: r.institutionId,
      institutionName: r.institutionName,
      worksCount: summary?.works_count ?? r.discoveryIds.length,
      citedByCount: summary?.cited_by_count ?? r.citedByCountInSet,
      hIndex: summary?.summary_stats?.h_index ?? null,
      orcid: r.orcid,
      openAlexUrl: `https://openalex.org/${r.id}`,
      discoveryIds: r.discoveryIds,
    };
  });

  // --- aggregate institutions ---
  interface InstitutionAcc {
    id: string;
    name: string;
    countryCode: string | null;
    researcherIds: Set<string>;
    discoveryIds: Set<string>;
  }
  const institutionAcc = new Map<string, InstitutionAcc>();
  for (const researcher of researchers) {
    if (!researcher.institutionId) continue;
    const acc = institutionAcc.get(researcher.institutionId) ?? {
      id: researcher.institutionId,
      name: researcher.institutionName ?? researcher.institutionId,
      countryCode: null,
      researcherIds: new Set<string>(),
      discoveryIds: new Set<string>(),
    };
    acc.researcherIds.add(researcher.id);
    for (const discoveryId of researcher.discoveryIds) acc.discoveryIds.add(discoveryId);
    institutionAcc.set(researcher.institutionId, acc);
  }
  // Country codes live on the work-level institution objects, not on the researcher aggregate.
  for (const work of works) {
    for (const authorship of work.authorships) {
      for (const inst of authorship.institutions) {
        const acc = institutionAcc.get(shortId(inst.id));
        if (acc) acc.countryCode ??= inst.country_code;
      }
    }
  }

  const institutionTypeById = new Map<string, string>();
  for (const work of works) {
    for (const authorship of work.authorships) {
      for (const inst of authorship.institutions) institutionTypeById.set(shortId(inst.id), inst.type ?? "other");
    }
  }

  const institutions = [...institutionAcc.values()]
    .sort((a, b) => b.discoveryIds.size - a.discoveryIds.size)
    .map((acc) => ({
      id: acc.id,
      name: acc.name,
      type: institutionTypeById.get(acc.id) ?? "other",
      countryCode: acc.countryCode,
      homepage: null,
      ror: null,
      openAlexUrl: `https://openalex.org/${acc.id}`,
      researcherIds: [...acc.researcherIds],
      discoveryIds: [...acc.discoveryIds],
    }));

  // --- stats.json ---
  const conceptCounts = new Map<string, number>();
  for (const d of discoveries) for (const c of d.concepts.slice(0, 1)) conceptCounts.set(c.name, (conceptCounts.get(c.name) ?? 0) + 1);
  const countryCounts = new Map<string, number>();
  for (const inst of institutions) if (inst.countryCode) countryCounts.set(inst.countryCode, (countryCounts.get(inst.countryCode) ?? 0) + inst.discoveryIds.length);

  const weekStart = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00Z");
    const day = date.getUTCDay();
    const diff = (day === 0 ? -6 : 1) - day; // Monday as the start of the week
    date.setUTCDate(date.getUTCDate() + diff);
    return isoDate(date);
  };
  const weekCounts = new Map<string, number>();
  for (const d of discoveries) {
    const week = weekStart(d.publishedDate);
    weekCounts.set(week, (weekCounts.get(week) ?? 0) + 1);
  }

  const topN = (map: Map<string, number>, n: number) =>
    [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([label, count]) => ({ label, count }));

  const stats = {
    generatedAt: now.toISOString(),
    totalDiscoveries: discoveries.length,
    totalResearchers: researchers.length,
    totalInstitutions: institutions.length,
    totalCitations: discoveries.reduce((sum, d) => sum + d.citedByCount, 0),
    weeklySeries: [...weekCounts.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([weekStart, count]) => ({ weekStart, count })),
    topConcepts: topN(conceptCounts, TOP_CONCEPTS_IN_STATS),
    topInstitutions: institutions.slice(0, TOP_INSTITUTIONS_IN_STATS).map((i) => ({ label: i.name, count: i.discoveryIds.length })),
    topCountries: topN(countryCounts, TOP_COUNTRIES_IN_STATS),
  };

  const meta = {
    generatedAt: now.toISOString(),
    source: "OpenAlex (api.openalex.org)",
    windowDays: WINDOW_DAYS,
    counts: { discoveries: discoveries.length, researchers: researchers.length, institutions: institutions.length },
  };

  for (const dir of [DATA_DIR, PUBLIC_DATA_DIR]) {
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, "meta.json"), JSON.stringify(meta, null, 2));
    await writeFile(join(dir, "discoveries.json"), JSON.stringify(discoveries, null, 2));
    await writeFile(join(dir, "researchers.json"), JSON.stringify(researchers, null, 2));
    await writeFile(join(dir, "institutions.json"), JSON.stringify(institutions, null, 2));
    await writeFile(join(dir, "stats.json"), JSON.stringify(stats, null, 2));
  }

  console.log(
    `Wrote ${discoveries.length} discoveries, ${researchers.length} researchers, ${institutions.length} institutions to /data and /public/data.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
