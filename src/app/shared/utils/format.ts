import { InstitutionType } from "../../core/models";

const dateFormatter = new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" });
const relativeFormatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const compactNumberFormatter = new Intl.NumberFormat("en", { notation: "compact" });
let countryNames: Intl.DisplayNames | null = null;

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

/** "3 days ago", "2 weeks ago"... falls back to a plain date once it's more than ~2 months old. */
export function formatRelativeDate(iso: string): string {
  const diffMs = new Date(iso).getTime() - Date.now();
  const diffDays = Math.round(diffMs / 86_400_000);
  if (Math.abs(diffDays) < 1) return "today";
  if (Math.abs(diffDays) < 14) return relativeFormatter.format(diffDays, "day");
  if (Math.abs(diffDays) < 60) return relativeFormatter.format(Math.round(diffDays / 7), "week");
  return formatDate(iso);
}

export function formatCompactNumber(value: number): string {
  return compactNumberFormatter.format(value);
}

export function countryName(code: string | null | undefined): string | null {
  if (!code) return null;
  countryNames ??= new Intl.DisplayNames(["en"], { type: "region" });
  try {
    return countryNames.of(code) ?? code;
  } catch {
    return code;
  }
}

const INSTITUTION_TYPE_LABELS: Record<InstitutionType, string> = {
  education: "University / school",
  healthcare: "Hospital / healthcare",
  company: "Company",
  government: "Government",
  facility: "Research facility",
  nonprofit: "Nonprofit / institute",
  archive: "Archive",
  other: "Organization",
};

export function institutionTypeLabel(type: string | null | undefined): string {
  return INSTITUTION_TYPE_LABELS[(type as InstitutionType) ?? "other"] ?? INSTITUTION_TYPE_LABELS.other;
}
