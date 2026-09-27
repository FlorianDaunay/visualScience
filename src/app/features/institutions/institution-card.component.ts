import { Component, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { Institution } from "../../core/models";
import { countryName, institutionTypeLabel } from "../../shared/utils/format";

/** One institution in a grid — links to its profile. */
@Component({
  selector: "app-institution-card",
  standalone: true,
  imports: [RouterLink],
  templateUrl: "./institution-card.component.html",
})
export class InstitutionCardComponent {
  readonly institution = input.required<Institution>();
  protected readonly countryName = countryName;
  protected readonly institutionTypeLabel = institutionTypeLabel;
}
