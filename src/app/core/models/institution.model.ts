/** OpenAlex's institution types: universities, companies, government labs, hospitals, etc. */
export type InstitutionType =
  | "education"
  | "healthcare"
  | "company"
  | "archive"
  | "nonprofit"
  | "government"
  | "facility"
  | "other";

/** An institution (school, lab, university, company...) credited on a tracked discovery. */
export interface Institution {
  id: string;
  name: string;
  type: InstitutionType;
  countryCode: string | null;
  homepage: string | null;
  ror: string | null;
  openAlexUrl: string;
  researcherIds: string[];
  /** Ids into `discoveries.json`, newest first. */
  discoveryIds: string[];
}
