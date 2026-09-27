import { NgStyle } from "@angular/common";
import { Component, computed, inject, output, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ThemeService, Theme, ThemeScheme, themeToStyle, themes } from "../../../core/theme";

type SchemeFilter = "all" | ThemeScheme;

/**
 * The "Appearance" modal: a searchable grid of every theme, each rendered with its own colors,
 * plus a follow-system toggle. Mirrors the reference design's card grid. Opened from
 * `AppShellComponent`; closes on Escape, backdrop click, or picking a theme.
 */
@Component({
  selector: "app-theme-picker",
  standalone: true,
  imports: [FormsModule, NgStyle],
  templateUrl: "./theme-picker.component.html",
})
export class ThemePickerComponent {
  protected readonly themeService = inject(ThemeService);
  readonly closed = output<void>();

  protected readonly allThemes = themes;
  protected readonly query = signal("");
  protected readonly filter = signal<SchemeFilter>("all");
  protected readonly themeToStyle = themeToStyle;

  protected readonly filtered = computed(() => {
    const query = this.query().trim().toLowerCase();
    const scheme = this.filter();
    return this.allThemes.filter((theme) => {
      if (scheme !== "all" && theme.scheme !== scheme) return false;
      if (!query) return true;
      return theme.name.toLowerCase().includes(query) || theme.description.toLowerCase().includes(query);
    });
  });

  protected isActive(theme: Theme): boolean {
    return !this.themeService.followSystem() && this.themeService.active().id === theme.id;
  }

  protected select(theme: Theme): void {
    this.themeService.select(theme.id);
  }

  protected toggleFollowSystem(follow: boolean): void {
    this.themeService.setFollowSystem(follow);
  }

  protected close(): void {
    this.closed.emit();
  }
}
