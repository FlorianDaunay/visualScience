import { Component, computed, inject, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { DataService } from "../../core/api/data.service";
import { EmptyStateComponent } from "../../shared/components/empty-state/empty-state.component";
import { ExternalLinkComponent } from "../../shared/components/external-link/external-link.component";
import { LoadingStateComponent } from "../../shared/components/loading-state/loading-state.component";
import { TagComponent } from "../../shared/components/tag/tag.component";
import { formatCompactNumber, formatDate } from "../../shared/utils/format";

/** Full record for one discovery: abstract, every author/institution, and links to the source. */
@Component({
  selector: "app-discovery-detail",
  standalone: true,
  imports: [RouterLink, LoadingStateComponent, EmptyStateComponent, ExternalLinkComponent, TagComponent],
  templateUrl: "./discovery-detail.component.html",
})
export class DiscoveryDetailComponent {
  private readonly dataService = inject(DataService);
  readonly id = input.required<string>();

  protected readonly state = computed(() => this.dataService.discovery(this.id())());
  protected readonly formatDate = formatDate;
  protected readonly formatCompactNumber = formatCompactNumber;
}
