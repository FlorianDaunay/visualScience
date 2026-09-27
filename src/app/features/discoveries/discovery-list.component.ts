import { Component, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DataService } from "../../core/api/data.service";
import { EmptyStateComponent } from "../../shared/components/empty-state/empty-state.component";
import { LoadingStateComponent } from "../../shared/components/loading-state/loading-state.component";
import { DiscoveryCardComponent } from "./discovery-card.component";

type SortMode = "newest" | "oldest" | "most-cited" | "title";
type PeriodFilter = "all" | "7" | "30";

const DAY_MS = 86_400_000;

/** The home feed: every tracked discovery, searchable, filterable by field/period, sortable. */
@Component({
  selector: "app-discovery-list",
  standalone: true,
  imports: [FormsModule, DiscoveryCardComponent, LoadingStateComponent, EmptyStateComponent],
  templateUrl: "./discovery-list.component.html",
})
export class DiscoveryListComponent {
  private readonly dataService = inject(DataService);
  protected readonly resource = this.dataService.discoveries;

  protected readonly query = signal("");
  protected readonly selectedFields = signal<ReadonlySet<string>>(new Set());
  protected readonly period = signal<PeriodFilter>("all");
  protected readonly openAccessOnly = signal(false);
  protected readonly sort = signal<SortMode>("newest");

  /** Every field (top concept) present in the data, with how many discoveries carry it. */
  protected readonly fields = computed(() => {
    const list = this.resource().value ?? [];
    const counts = new Map<string, number>();
    for (const d of list) {
      const top = d.concepts[0];
      if (top) counts.set(top.name, (counts.get(top.name) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));
  });

  protected readonly filtered = computed(() => {
    const list = this.resource().value ?? [];
    const query = this.query().trim().toLowerCase();
    const fields = this.selectedFields();
    const oaOnly = this.openAccessOnly();
    const periodDays = this.period();
    const cutoff = periodDays === "all" ? null : Date.now() - Number(periodDays) * DAY_MS;

    let result = list.filter((d) => {
      if (oaOnly && !d.isOpenAccess) return false;
      if (fields.size > 0 && !d.concepts.some((c) => fields.has(c.name))) return false;
      if (cutoff !== null && new Date(d.publishedDate).getTime() < cutoff) return false;
      if (!query) return true;
      const haystack = `${d.title} ${d.venueName ?? ""} ${d.authors.map((a) => a.name).join(" ")}`.toLowerCase();
      return haystack.includes(query);
    });

    result = [...result].sort((a, b) => {
      switch (this.sort()) {
        case "most-cited":
          return b.citedByCount - a.citedByCount;
        case "oldest":
          return a.publishedDate.localeCompare(b.publishedDate);
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return b.publishedDate.localeCompare(a.publishedDate);
      }
    });
    return result;
  });

  protected toggleField(name: string): void {
    const next = new Set(this.selectedFields());
    if (next.has(name)) next.delete(name);
    else next.add(name);
    this.selectedFields.set(next);
  }

  protected clearFilters(): void {
    this.query.set("");
    this.selectedFields.set(new Set());
    this.period.set("all");
    this.openAccessOnly.set(false);
  }

  protected readonly hasActiveFilters = computed(
    () => this.query() !== "" || this.selectedFields().size > 0 || this.period() !== "all" || this.openAccessOnly(),
  );
}
