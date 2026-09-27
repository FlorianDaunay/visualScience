export interface CountPoint {
  label: string;
  count: number;
}

export interface WeeklyPoint {
  /** ISO date (Monday) the week starts on. */
  weekStart: string;
  count: number;
}

/** Aggregate stats derived from `discoveries.json`, for the Stats & Trends page. */
export interface StatsOverview {
  generatedAt: string;
  totalDiscoveries: number;
  totalResearchers: number;
  totalInstitutions: number;
  totalCitations: number;
  weeklySeries: WeeklyPoint[];
  topConcepts: CountPoint[];
  topInstitutions: CountPoint[];
  topCountries: CountPoint[];
}

/** Small manifest written alongside the data files, mostly for the About page and debugging. */
export interface DataMeta {
  generatedAt: string;
  source: string;
  windowDays: number;
  counts: {
    discoveries: number;
    researchers: number;
    institutions: number;
  };
}
