import { Component, inject } from "@angular/core";
import { DataService } from "../../core/api/data.service";
import { ExternalLinkComponent } from "../../shared/components/external-link/external-link.component";
import { formatDate } from "../../shared/utils/format";

/** Explains where the data comes from, how often it refreshes, and how the site is built. */
@Component({
  selector: "app-about",
  standalone: true,
  imports: [ExternalLinkComponent],
  templateUrl: "./about.component.html",
})
export class AboutComponent {
  protected readonly meta = inject(DataService).meta;
  protected readonly formatDate = formatDate;
}
