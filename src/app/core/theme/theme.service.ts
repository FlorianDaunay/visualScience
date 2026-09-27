import { DOCUMENT } from "@angular/common";
import { Injectable, computed, effect, inject, signal } from "@angular/core";
import { applyTheme } from "./css";
import { DEFAULT_THEME_IDS, findTheme } from "./registry";
import type { Theme } from "./types";

const STORAGE_KEY = "visualscience-appearance";
const DARK_QUERY = "(prefers-color-scheme: dark)";

interface StoredAppearance {
  themeId: string;
  followSystem: boolean;
  lightId: string;
  darkId: string;
}

/**
 * Owns the appearance choice: a hand-picked theme, or "follow the system" with one theme per
 * OS mode. Applies the resolved theme to the document and persists the choice.
 */
@Injectable({ providedIn: "root" })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly media = this.document.defaultView?.matchMedia(DARK_QUERY);
  private readonly stored = this.read();

  /** Live OS setting; not persisted. */
  readonly systemDark = signal(this.media?.matches ?? false);
  /** Theme chosen by hand (used when not following the system). */
  readonly themeId = signal(this.stored.themeId);
  readonly followSystem = signal(this.stored.followSystem);
  /** Themes used when following the system, for its light and dark modes. */
  readonly lightId = signal(this.stored.lightId);
  readonly darkId = signal(this.stored.darkId);

  /** The theme currently in effect. */
  readonly active = computed<Theme>(() => {
    const dark = this.systemDark();
    const id = this.followSystem() ? (dark ? this.darkId() : this.lightId()) : this.themeId();
    return findTheme(id) ?? findTheme(DEFAULT_THEME_IDS[dark ? "dark" : "light"])!;
  });

  constructor() {
    this.media?.addEventListener("change", (event) => this.systemDark.set(event.matches));
    effect(() => {
      applyTheme(this.active(), this.document);
      this.write();
    });
  }

  /** Picking a theme is an explicit choice: it applies right away and stops following the system. */
  select(id: string): void {
    if (!findTheme(id)) return;
    this.themeId.set(id);
    this.followSystem.set(false);
  }

  setFollowSystem(follow: boolean): void {
    const current = this.active();
    if (follow) {
      (current.scheme === "dark" ? this.darkId : this.lightId).set(current.id);
      this.followSystem.set(true);
    } else {
      this.themeId.set(current.id);
      this.followSystem.set(false);
    }
  }

  private read(): StoredAppearance {
    const dark = this.media?.matches ?? false;
    const fallback: StoredAppearance = {
      themeId: DEFAULT_THEME_IDS[dark ? "dark" : "light"],
      followSystem: true,
      lightId: DEFAULT_THEME_IDS.light,
      darkId: DEFAULT_THEME_IDS.dark,
    };
    try {
      const raw = this.document.defaultView?.localStorage.getItem(STORAGE_KEY);
      return raw ? { ...fallback, ...(JSON.parse(raw) as Partial<StoredAppearance>) } : fallback;
    } catch {
      return fallback;
    }
  }

  private write(): void {
    const value: StoredAppearance = {
      themeId: this.themeId(),
      followSystem: this.followSystem(),
      lightId: this.lightId(),
      darkId: this.darkId(),
    };
    try {
      this.document.defaultView?.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {
      /* storage unavailable (private mode): the choice just isn't remembered */
    }
  }
}
