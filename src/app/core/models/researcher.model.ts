/** A researcher featured because they authored one of the tracked discoveries. */
export interface Researcher {
  id: string;
  name: string;
  institutionId: string | null;
  institutionName: string | null;
  worksCount: number;
  citedByCount: number;
  hIndex: number | null;
  orcid: string | null;
  openAlexUrl: string;
  /** Ids into `discoveries.json`, newest first. */
  discoveryIds: string[];
}
