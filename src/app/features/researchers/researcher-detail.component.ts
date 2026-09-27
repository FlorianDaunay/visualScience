import { Component, computed, inject, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { DataService } from "../../core/api/data.service";
import { Discovery } from "../../core/models";
import { DiscoveryCardComponent } from "../discoveries/discovery-card.component";
import { EmptyStateComponent } from "../../shared/components/empty-state/empty-state.component";
import { ExternalLinkComponent } from "../../shared/components/external-link/external-link.component";
import { LoadingStateComponent } from "../../shared/components/loading-state/loading-state.component";
import { StatTileComponent } from "../../shared/components/stat-tile/stat-tile.component";
import { formatCompactNumber } from "../../shared/utils/format";

/** A researcher's profile: their stats and every tracked discovery they co-authored. */
@Component({
  selector: "app-researcher-detail",
  standalone: true,
  imports: [RouterLink, LoadingStateComponent, EmptyStateComponent, ExternalLinkComponent, StatTileComponent, DiscoveryCardComponent],
  templateUrl: "./researcher-detail.component.html",
})
export class ResearcherDetailComponent {
  private readonly dataService = inject(DataService);
  readonly id = input.required<string>();

  protected readonly state = computed(() => this.dataService.researcher(this.id())());
  protected readonly discoveriesState = this.dataService.discoveries;
  protected readonly formatCompactNumber = formatCompactNumber;

  protected readonly theirDiscoveries = computed<Discovery[]>(() => {
    const researcher = this.state().value;
    const all = this.discoveriesState().value ?? [];
    if (!researcher) return [];
    const ids = new Set(researcher.discoveryIds);
    return all.filter((d) => ids.has(d.id));
  });
}
