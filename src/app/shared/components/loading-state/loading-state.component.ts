import { Component } from "@angular/core";

/** A theme-aware skeleton/spinner shown while a `Loadable` resource is still pending. */
@Component({
  selector: "app-loading-state",
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center gap-3 py-16 text-text-secondary" role="status">
      <svg class="size-6 animate-spin text-accent" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" />
        <path class="opacity-90" fill="currentColor" d="M22 12a10 10 0 0 0-10-10v3a7 7 0 0 1 7 7h3Z" />
      </svg>
      <p class="text-sm">Loading…</p>
    </div>
  `,
})
export class LoadingStateComponent {}
