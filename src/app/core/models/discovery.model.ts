/** A concept/topic OpenAlex attaches to a work, with its relevance score (0..1). */
export interface ConceptTag {
  id: string;
  name: string;
  score: number;
}

/** One author of a discovery, as embedded in the work record (no extra fetch needed). */
export interface DiscoveryAuthor {
  id: string;
  name: string;
  institutionId?: string;
  institutionName?: string;
}

/** A single institution credited on a discovery. */
export interface DiscoveryInstitution {
  id: string;
  name: string;
  countryCode?: string;
}

/**
 * A recent scientific discovery (an OpenAlex "work"): a paper, preprint or dataset record.
 * Mirrors what `scripts/fetch-data.mts` writes to `data/discoveries.json`.
 */
export interface Discovery {
  id: string;
  title: string;
  abstractText: string | null;
  publishedDate: string;
  doi: string | null;
  /** Best link to read the source: the open-access link when there is one, else the landing page. */
  sourceUrl: string | null;
  isOpenAccess: boolean;
  venueName: string | null;
  citedByCount: number;
  concepts: ConceptTag[];
  authors: DiscoveryAuthor[];
  institutions: DiscoveryInstitution[];
  openAlexUrl: string;
}
