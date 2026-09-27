import { Component, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DataService } from "../../core/api/data.service";
import { EmptyStateComponent } from "../../shared/components/empty-state/empty-state.component";
import { LoadingStateComponent } from "../../shared/components/loading-state/loading-state.component";
import { ResearcherCardComponent } from "./researcher-card.component";

type SortMode = "citations" | "discoveries" | "h-index";

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
  protected readonly sort = signal<SortMode>("citations");

  protected readonly filtered = computed(() => {
    const list = this.resource().value ?? [];
    const query = this.query().trim().toLowerCase();
    const filtered = query
      ? list.filter((r) => r.name.toLowerCase().includes(query) || (r.institutionName ?? "").toLowerCase().includes(query))
      : list;

    const sort = this.sort();
    return [...filtered].sort((a, b) => {
      if (sort === "discoveries") return b.discoveryIds.length - a.discoveryIds.length;
      if (sort === "h-index") return (b.hIndex ?? -1) - (a.hIndex ?? -1);
      return b.citedByCount - a.citedByCount;
    });
  });
}
