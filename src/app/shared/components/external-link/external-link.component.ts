import { Component, input } from "@angular/core";

/**
 * The one way every "go read the source" link in the app is rendered: always a new tab, always
 * `rel="noopener"`, always with a small arrow so it's visually obvious it leaves the site.
 */
@Component({
  selector: "app-external-link",
  standalone: true,
  template: `
    <a
      [href]="href()"
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex items-center gap-1 text-accent hover:text-accent-hover hover:underline underline-offset-2"
    >
      <ng-content />
      <svg viewBox="0 0 20 20" fill="currentColor" class="size-3.5 shrink-0">
        <path
          d="M12.5 3a.75.75 0 0 0 0 1.5h2.19l-6.72 6.72a.75.75 0 1 0 1.06 1.06l6.72-6.72v2.19a.75.75 0 0 0 1.5 0V3.75A.75.75 0 0 0 16.5 3h-4Z"
        />
        <path d="M4.75 4A1.75 1.75 0 0 0 3 5.75v9.5c0 .966.784 1.75 1.75 1.75h9.5A1.75 1.75 0 0 0 16 15.25v-4a.75.75 0 0 0-1.5 0v4a.25.25 0 0 1-.25.25h-9.5a.25.25 0 0 1-.25-.25v-9.5a.25.25 0 0 1 .25-.25h4a.75.75 0 0 0 0-1.5h-4Z" />
      </svg>
    </a>
  `,
})
export class ExternalLinkComponent {
  readonly href = input.required<string>();
}
