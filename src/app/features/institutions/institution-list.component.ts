import { Component, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DataService } from "../../core/api/data.service";
import { InstitutionType } from "../../core/models";
import { EmptyStateComponent } from "../../shared/components/empty-state/empty-state.component";
import { LoadingStateComponent } from "../../shared/components/loading-state/loading-state.component";
import { countryName, institutionTypeLabel } from "../../shared/utils/format";
import { InstitutionCardComponent } from "./institution-card.component";

type SortMode = "discoveries" | "researchers" | "name";

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
  protected readonly type = signal<InstitutionType | null>(null);
  protected readonly country = signal<string | null>(null);
  protected readonly sort = signal<SortMode>("discoveries");
  protected readonly institutionTypeLabel = institutionTypeLabel;

  protected readonly types = computed(() => {
    const list = this.resource().value ?? [];
    return [...new Set(list.map((i) => i.type))].sort((a, b) => institutionTypeLabel(a).localeCompare(institutionTypeLabel(b)));
  });

  protected readonly countries = computed(() => {
    const list = this.resource().value ?? [];
    const codes = new Set(list.map((i) => i.countryCode).filter((c): c is string => !!c));
    return [...codes].map((code) => ({ code, name: countryName(code) ?? code })).sort((a, b) => a.name.localeCompare(b.name));
  });

  protected readonly filtered = computed(() => {
    const list = this.resource().value ?? [];
    const query = this.query().trim().toLowerCase();
    const type = this.type();
    const country = this.country();

    let result = list.filter((i) => {
      if (type && i.type !== type) return false;
      if (country && i.countryCode !== country) return false;
      if (!query) return true;
      return i.name.toLowerCase().includes(query);
    });

    result = [...result].sort((a, b) => {
      switch (this.sort()) {
        case "researchers":
          return b.researcherIds.length - a.researcherIds.length;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return b.discoveryIds.length - a.discoveryIds.length;
      }
    });
    return result;
  });

  protected readonly hasActiveFilters = computed(() => this.query() !== "" || this.type() !== null || this.country() !== null);

  protected clearFilters(): void {
    this.query.set("");
    this.type.set(null);
    this.country.set(null);
  }
}
