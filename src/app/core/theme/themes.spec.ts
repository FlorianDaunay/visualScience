import { contrast, mix, parseColor, readableOn } from './color';
import { COLOR_TOKENS, cssVar } from './tokens';
import { DEFAULT_THEME_IDS, findTheme, themes } from './registry';
import { themeToCssVars } from './css';

describe('theme registry', () => {
  it('registers every definition file, with unique ids', () => {
    expect(themes.length).toBeGreaterThanOrEqual(54);
    expect(new Set(themes.map((t) => t.id)).size).toBe(themes.length);
  });

  it('has the built-in light and dark themes', () => {
    expect(findTheme(DEFAULT_THEME_IDS.light)?.scheme).toBe('light');
    expect(findTheme(DEFAULT_THEME_IDS.dark)?.scheme).toBe('dark');
  });

  it('gives every theme a value for every token', () => {
    for (const theme of themes) {
      const vars = themeToCssVars(theme);
      for (const token of COLOR_TOKENS) {
        expect(vars[cssVar.color(token)]).withContext(`${theme.id}.${token}`).toMatch(/^\d+ \d+ \d+$/);
      }
      expect(Number(vars[cssVar.density])).withContext(theme.id).toBeGreaterThan(0);
    }
  });

  it('keeps the main text readable on the surface (WCAG AA for large text at least)', () => {
    for (const theme of themes) {
      const c = theme.colors;
      const surface = c.surface.length > 7 ? mix(c.surface, c.canvas, 0.5).slice(0, 7) : c.surface;
      expect(contrast(c.textPrimary.slice(0, 7), surface)).withContext(theme.id).toBeGreaterThanOrEqual(3);
    }
  });
});

describe('color helpers', () => {
  it('parses short, long and alpha hex colors', () => {
    expect(parseColor('#fff')).toEqual({ r: 255, g: 255, b: 255, a: 1 });
    expect(parseColor('#00000080').a).toBeCloseTo(0.5, 1);
    expect(() => parseColor('red')).toThrow();
  });

  it('picks a readable foreground', () => {
    expect(readableOn('#000000')).toBe('#FFFFFF');
    expect(readableOn('#FFFFFF')).toBe('#111111');
  });
});
