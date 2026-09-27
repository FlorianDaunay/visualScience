/**
 * Reads a theme color token straight off `<html>` (set by `ThemeService`/`applyTheme`) so chart
 * colors always match the active theme, including on the very next repaint after a switch.
 * Every chart in this app plots a single magnitude series (a count, a trend), so — per the
 * dataviz guidance — it needs one hue, not a categorical palette: the theme's own accent/success
 * colors are that hue.
 */
export function themeColor(token: "accent" | "success" | "text-secondary" | "border" | "text-muted", alpha = 1): string {
  if (typeof document === "undefined") return "rgb(100 116 139)";
  const rgb = getComputedStyle(document.documentElement).getPropertyValue(`--color-${token}`).trim();
  return alpha < 1 ? `rgb(${rgb} / ${alpha})` : `rgb(${rgb})`;
}
