import { Component, input } from "@angular/core";

/** A single "big number + label" tile used on stats/overview panels. */
@Component({
  selector: "app-stat-tile",
  standalone: true,
  template: `
    <div class="rounded-card border bg-surface p-5 shadow-card">
      <p class="text-sm text-text-secondary">{{ label() }}</p>
      <p class="mt-1 text-3xl font-semibold tracking-tight text-text-primary">{{ value() }}</p>
      @if (hint(); as hint) {
        <p class="mt-1 text-xs text-text-muted">{{ hint }}</p>
      }
    </div>
  `,
})
export class StatTileComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly hint = input<string>();
}
