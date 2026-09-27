import { Component, computed, inject, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { DataService } from "../../core/api/data.service";
import { Discovery, Researcher } from "../../core/models";
import { DiscoveryCardComponent } from "../discoveries/discovery-card.component";
import { ResearcherCardComponent } from "../researchers/researcher-card.component";
import { EmptyStateComponent } from "../../shared/components/empty-state/empty-state.component";
import { ExternalLinkComponent } from "../../shared/components/external-link/external-link.component";
import { LoadingStateComponent } from "../../shared/components/loading-state/loading-state.component";
import { StatTileComponent } from "../../shared/components/stat-tile/stat-tile.component";
import { countryName, institutionTypeLabel } from "../../shared/utils/format";

/** An institution's profile: its researchers and tracked discoveries. */
@Component({
  selector: "app-institution-detail",
  standalone: true,
  imports: [
    RouterLink,
    LoadingStateComponent,
    EmptyStateComponent,
    ExternalLinkComponent,
    StatTileComponent,
    ResearcherCardComponent,
    DiscoveryCardComponent,
  ],
  templateUrl: "./institution-detail.component.html",
})
export class InstitutionDetailComponent {
  private readonly dataService = inject(DataService);
  readonly id = input.required<string>();

  protected readonly state = computed(() => this.dataService.institution(this.id())());
  protected readonly countryName = countryName;
  protected readonly institutionTypeLabel = institutionTypeLabel;

  protected readonly researchers = computed<Researcher[]>(() => {
    const institution = this.state().value;
    const all = this.dataService.researchers().value ?? [];
    if (!institution) return [];
    const ids = new Set(institution.researcherIds);
    return all.filter((r) => ids.has(r.id)).sort((a, b) => b.citedByCount - a.citedByCount);
  });

  protected readonly discoveries = computed<Discovery[]>(() => {
    const institution = this.state().value;
    const all = this.dataService.discoveries().value ?? [];
    if (!institution) return [];
    const ids = new Set(institution.discoveryIds);
    return all.filter((d) => ids.has(d.id));
  });
}
