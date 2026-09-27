import { Component, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DataService } from "../../core/api/data.service";
import { EmptyStateComponent } from "../../shared/components/empty-state/empty-state.component";
import { LoadingStateComponent } from "../../shared/components/loading-state/loading-state.component";
import { ResearcherCardComponent } from "./researcher-card.component";

type SortMode = "citations" | "discoveries" | "h-index" | "name";

/** Researchers behind the tracked discoveries, ranked by citations by default. */
@Component({
  selector: "app-researcher-list",
  standalone: true,
  imports: [FormsModule, ResearcherCardComponent, LoadingStateComponent, EmptyStateComponent],
  templateUrl: "./researcher-list.component.html",
})
export class ResearcherListComponent {
  private readonly dataService = inject(DataService);
  protected readonly resource = this.dataService.researchers;

  protected readonly query = signal("");
  protected readonly institution = signal<string | null>(null);
  protected readonly sort = signal<SortMode>("citations");

  /** Institutions with at least one researcher, for the filter dropdown — sorted alphabetically. */
  protected readonly institutions = computed(() => {
    const list = this.resource().value ?? [];
    const names = new Set(list.map((r) => r.institutionName).filter((n): n is string => !!n));
    return [...names].sort((a, b) => a.localeCompare(b));
  });

  protected readonly filtered = computed(() => {
    const list = this.resource().value ?? [];
    const query = this.query().trim().toLowerCase();
    const institution = this.institution();

    let result = list.filter((r) => {
      if (institution && r.institutionName !== institution) return false;
      if (!query) return true;
      return r.name.toLowerCase().includes(query) || (r.institutionName ?? "").toLowerCase().includes(query);
    });

    result = [...result].sort((a, b) => {
      switch (this.sort()) {
        case "discoveries":
          return b.discoveryIds.length - a.discoveryIds.length;
        case "h-index":
          return (b.hIndex ?? -1) - (a.hIndex ?? -1);
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return b.citedByCount - a.citedByCount;
      }
    });
    return result;
  });

  protected readonly hasActiveFilters = computed(() => this.query() !== "" || this.institution() !== null);

  protected clearFilters(): void {
    this.query.set("");
    this.institution.set(null);
  }
}
