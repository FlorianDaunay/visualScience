import { Component, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DataService } from "../../core/api/data.service";
import { EmptyStateComponent } from "../../shared/components/empty-state/empty-state.component";
import { LoadingStateComponent } from "../../shared/components/loading-state/loading-state.component";
import { DiscoveryCardComponent } from "./discovery-card.component";

type SortMode = "newest" | "most-cited";

/** The home feed: every tracked discovery, searchable, filterable by field, sortable. */
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
  protected readonly concept = signal<string | null>(null);
  protected readonly openAccessOnly = signal(false);
  protected readonly sort = signal<SortMode>("newest");

  protected readonly concepts = computed(() => {
    const list = this.resource().value ?? [];
    const counts = new Map<string, number>();
    for (const d of list) {
      const top = d.concepts[0];
      if (top) counts.set(top.name, (counts.get(top.name) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([name]) => name);
  });

  protected readonly filtered = computed(() => {
    const list = this.resource().value ?? [];
    const query = this.query().trim().toLowerCase();
    const concept = this.concept();
    const oaOnly = this.openAccessOnly();

    let result = list.filter((d) => {
      if (oaOnly && !d.isOpenAccess) return false;
      if (concept && !d.concepts.some((c) => c.name === concept)) return false;
      if (!query) return true;
      const haystack = `${d.title} ${d.venueName ?? ""} ${d.authors.map((a) => a.name).join(" ")}`.toLowerCase();
      return haystack.includes(query);
    });

    result = [...result].sort((a, b) =>
      this.sort() === "most-cited" ? b.citedByCount - a.citedByCount : b.publishedDate.localeCompare(a.publishedDate),
    );
    return result;
  });
}
