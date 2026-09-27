import { Component, input } from "@angular/core";

/** A small rounded label for a concept/field tag, an institution type, etc. */
@Component({
  selector: "app-tag",
  standalone: true,
  template: `
    <span
      class="inline-flex items-center rounded-pill border bg-surface-hover px-2.5 py-0.5 text-xs font-medium text-text-secondary"
    >
      {{ text() }}
    </span>
  `,
})
export class TagComponent {
  readonly text = input.required<string>();
}
