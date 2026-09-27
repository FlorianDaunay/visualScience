import { Component, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DataService } from "../../core/api/data.service";
import { EmptyStateComponent } from "../../shared/components/empty-state/empty-state.component";
import { LoadingStateComponent } from "../../shared/components/loading-state/loading-state.component";
import { InstitutionCardComponent } from "./institution-card.component";

/** Universities, labs, companies and other institutions behind the tracked discoveries. */
@Component({
  selector: "app-institution-list",
  standalone: true,
  imports: [FormsModule, InstitutionCardComponent, LoadingStateComponent, EmptyStateComponent],
  templateUrl: "./institution-list.component.html",
})
export class InstitutionListComponent {
  private readonly dataService = inject(DataService);
  protected readonly resource = this.dataService.institutions;
  protected readonly query = signal("");

  protected readonly filtered = computed(() => {
    const list = this.resource().value ?? [];
    const query = this.query().trim().toLowerCase();
    const filtered = query ? list.filter((i) => i.name.toLowerCase().includes(query)) : list;
    return [...filtered].sort((a, b) => b.discoveryIds.length - a.discoveryIds.length);
  });
}
