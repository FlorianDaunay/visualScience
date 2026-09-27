import { Component, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { Discovery } from "../../core/models";
import { TagComponent } from "../../shared/components/tag/tag.component";
import { formatCompactNumber, formatRelativeDate } from "../../shared/utils/format";

/** One discovery in a grid/list — the card links to the full detail page. */
@Component({
  selector: "app-discovery-card",
  standalone: true,
  imports: [RouterLink, TagComponent],
  templateUrl: "./discovery-card.component.html",
})
export class DiscoveryCardComponent {
  readonly discovery = input.required<Discovery>();
  protected readonly formatRelativeDate = formatRelativeDate;
  protected readonly formatCompactNumber = formatCompactNumber;
}
