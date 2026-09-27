/**
 * Tailwind is wired to the theme system's CSS custom properties, not fixed colors, so every
 * utility class (`bg-surface`, `text-text-primary`, `rounded-card`, ...) repaints automatically
 * when `ThemeService` swaps the active theme. The token *names* here must stay in sync with
 * `src/app/core/theme/tokens.ts` (the single source of truth) — the `kebab-case` here is what
 * `tailwindName()` in that file produces from each camelCase token.
 *
 * A color channel is stored as `R G B` in `--color-<token>` (see `themeToCssVars` in `css.ts`),
 * which is why each color below reads it with Tailwind's `rgb(var(...) / <alpha-value>)`
 * pattern: that lets `bg-accent/50` etc. still work.
 */
const colorToken = (name) => `rgb(var(--color-${name}) / var(--alpha-${name}, 1))`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  darkMode: ["selector", '[data-scheme="dark"]'],
  theme: {
    extend: {
      colors: {
        canvas: colorToken("canvas"),
        surface: colorToken("surface"),
        "surface-hover": colorToken("surface-hover"),
        border: colorToken("border"),
        "text-primary": colorToken("text-primary"),
        "text-secondary": colorToken("text-secondary"),
        "text-muted": colorToken("text-muted"),
        accent: colorToken("accent"),
        "accent-hover": colorToken("accent-hover"),
        "accent-foreground": colorToken("accent-foreground"),
        success: colorToken("success"),
        warning: colorToken("warning"),
        danger: colorToken("danger"),
        sidebar: colorToken("sidebar"),
        "sidebar-border": colorToken("sidebar-border"),
        "sidebar-text": colorToken("sidebar-text"),
        "sidebar-text-strong": colorToken("sidebar-text-strong"),
        "sidebar-text-active": colorToken("sidebar-text-active"),
        "sidebar-hover": colorToken("sidebar-hover"),
        "sidebar-active": colorToken("sidebar-active"),
      },
      borderRadius: {
        control: "var(--radius-control)",
        tile: "var(--radius-tile)",
        card: "var(--radius-card)",
        pill: "var(--radius-pill)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        overlay: "var(--shadow-overlay)",
        control: "var(--shadow-control)",
        inset: "var(--shadow-inset)",
      },
      borderWidth: { DEFAULT: "var(--border-width)" },
      fontFamily: {
        sans: "var(--font-sans)",
        mono: "var(--font-mono)",
      },
    },
  },
  plugins: [],
};
