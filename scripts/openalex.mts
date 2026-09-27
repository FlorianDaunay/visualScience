/**
 * Minimal typed client for the bits of the OpenAlex API (https://docs.openalex.org) that
 * `fetch-data.mts` needs. No API key is required; OpenAlex asks polite callers to identify
 * themselves via `User-Agent` rather than a personal email, which is what we do here.
 */

const API_BASE = "https://api.openalex.org";
const USER_AGENT = "visualScience/1.0 (+https://github.com/FlorianDaunay/visualScience)";

export interface OpenAlexInstitution {
  id: string;
  display_name: string;
  ror: string | null;
  country_code: string | null;
  type: string | null;
}

export interface OpenAlexAuthorship {
  author: { id: string | null; display_name: string; orcid: string | null };
  institutions: OpenAlexInstitution[];
}

export interface OpenAlexConcept {
  id: string;
  display_name: string;
  level: number;
  score: number;
}

export interface OpenAlexWork {
  id: string;
  doi: string | null;
  title: string | null;
  publication_date: string;
  cited_by_count: number;
  abstract_inverted_index: Record<string, number[]> | null;
  authorships: OpenAlexAuthorship[];
  concepts: OpenAlexConcept[];
  open_access: { is_oa: boolean; oa_url: string | null };
  primary_location: { landing_page_url: string | null; source: { display_name: string | null } | null } | null;
}

export interface OpenAlexAuthorSummary {
  id: string;
  display_name: string;
  works_count: number;
  cited_by_count: number;
  orcid: string | null;
  summary_stats: { h_index: number } | null;
}

interface WorksResponse {
  meta: { count: number };
  results: OpenAlexWork[];
}

interface AuthorsResponse {
  results: OpenAlexAuthorSummary[];
}

async function getJson<T>(url: string, attempt = 1): Promise<T> {
  const response = await fetch(url, { headers: { "User-Agent": USER_AGENT, Accept: "application/json" } });
  if (!response.ok) {
    if (attempt < 5 && (response.status >= 500 || response.status === 429)) {
      await sleep(1500 * attempt);
      return getJson<T>(url, attempt + 1);
    }
    throw new Error(`OpenAlex request failed (${response.status}): ${url}`);
  }
  return (await response.json()) as T;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchWorks(filter: string, sort: string, perPage: number): Promise<OpenAlexWork[]> {
  const select = [
    "id",
    "doi",
    "title",
    "publication_date",
    "cited_by_count",
    "abstract_inverted_index",
    "authorships",
    "concepts",
    "open_access",
    "primary_location",
  ].join(",");
  const url = `${API_BASE}/works?filter=${filter}&sort=${sort}&per-page=${perPage}&select=${select}`;
  const data = await getJson<WorksResponse>(url);
  return data.results;
}

/** Batches author lookups (OpenAlex accepts an `id1|id2|...` OR filter), 50 ids per request. */
export async function fetchAuthors(ids: string[]): Promise<Map<string, OpenAlexAuthorSummary>> {
  const map = new Map<string, OpenAlexAuthorSummary>();
  const select = "id,display_name,works_count,cited_by_count,orcid,summary_stats";
  for (let i = 0; i < ids.length; i += 50) {
    const chunk = ids.slice(i, i + 50);
    const shortIds = chunk.map((id) => id.replace("https://openalex.org/", ""));
    const url = `${API_BASE}/authors?filter=ids.openalex:${shortIds.join("|")}&select=${select}&per-page=50`;
    const data = await getJson<AuthorsResponse>(url);
    for (const author of data.results) map.set(author.id, author);
    await sleep(150);
  }
  return map;
}
