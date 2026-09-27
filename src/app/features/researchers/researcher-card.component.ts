import { Component, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { Researcher } from "../../core/models";
import { formatCompactNumber } from "../../shared/utils/format";

/** One researcher in a grid — links to their profile. */
@Component({
  selector: "app-researcher-card",
  standalone: true,
  imports: [RouterLink],
  templateUrl: "./researcher-card.component.html",
})
export class ResearcherCardComponent {
  readonly researcher = input.required<Researcher>();
  protected readonly formatCompactNumber = formatCompactNumber;
}
