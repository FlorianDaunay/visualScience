import { Component, input } from "@angular/core";

/** Shown for an empty result set or a failed fetch (`message` covers both — see call sites). */
@Component({
  selector: "app-empty-state",
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center gap-2 rounded-card border border-dashed py-16 text-center">
      <p class="text-sm font-medium text-text-primary">{{ title() }}</p>
      @if (message(); as message) {
        <p class="max-w-sm text-sm text-text-secondary">{{ message }}</p>
      }
      <ng-content />
    </div>
  `,
})
export class EmptyStateComponent {
  readonly title = input.required<string>();
  readonly message = input<string>();
}
