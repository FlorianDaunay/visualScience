import { DecimalPipe } from "@angular/common";
import { Component, computed, inject } from "@angular/core";
import { ChartConfiguration } from "chart.js";
import { BaseChartDirective } from "ng2-charts";
import { DataService } from "../../core/api/data.service";
import { ThemeService } from "../../core/theme";
import { EmptyStateComponent } from "../../shared/components/empty-state/empty-state.component";
import { LoadingStateComponent } from "../../shared/components/loading-state/loading-state.component";
import { StatTileComponent } from "../../shared/components/stat-tile/stat-tile.component";
import { themeColor } from "../../shared/utils/chart-colors";
import { countryName, formatCompactNumber, formatDate } from "../../shared/utils/format";

/**
 * Aggregate stats and trends derived from the tracked discoveries. Every chart plots one
 * magnitude series, so it draws from the active theme's accent color rather than a fixed
 * categorical palette (see the dataviz guidance) — it recolors instantly when the theme changes.
 */
@Component({
  selector: "app-stats",
  standalone: true,
  imports: [BaseChartDirective, StatTileComponent, LoadingStateComponent, EmptyStateComponent, DecimalPipe],
  templateUrl: "./stats.component.html",
})
export class StatsComponent {
  private readonly dataService = inject(DataService);
  private readonly themeService = inject(ThemeService);
  protected readonly resource = this.dataService.stats;

  /** Grid/tick colors shared by every chart, re-read whenever the active theme changes. */
  private readonly scaleColors = computed(() => {
    this.themeService.active();
    return { grid: themeColor("border", 0.5), ticks: themeColor("text-secondary") };
  });

  protected readonly trendData = computed<ChartConfiguration<"line">["data"]>(() => {
    const series = this.resource().value?.weeklySeries ?? [];
    const accent = themeColor("accent");
    return {
      labels: series.map((p) => formatDate(p.weekStart)),
      datasets: [
        {
          data: series.map((p) => p.count),
          borderColor: accent,
          backgroundColor: themeColor("accent", 0.12),
          pointBackgroundColor: accent,
          pointRadius: 3,
          borderWidth: 2,
          tension: 0.3,
          fill: true,
        },
      ],
    };
  });

  protected readonly trendOptions = computed<ChartConfiguration<"line">["options"]>(() => {
    const { grid, ticks } = this.scaleColors();
    return {
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: grid }, ticks: { color: ticks } },
        y: { grid: { color: grid }, ticks: { color: ticks }, beginAtZero: true },
      },
    };
  });

  protected readonly conceptsData = this.horizontalBar(() => this.resource().value?.topConcepts ?? []);
  protected readonly institutionsData = this.horizontalBar(() => this.resource().value?.topInstitutions ?? []);
  protected readonly countriesData = this.horizontalBar(() => this.resource().value?.topCountries ?? [], true);
  protected readonly researchersData = this.horizontalBar(() => this.resource().value?.topResearchers ?? []);
  protected readonly institutionTypesData = this.horizontalBar(() => this.resource().value?.institutionTypes ?? []);

  protected readonly barOptions = computed<ChartConfiguration<"bar">["options"]>(() => {
    const { grid, ticks } = this.scaleColors();
    return {
      indexAxis: "y",
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: grid }, ticks: { color: ticks }, beginAtZero: true },
        y: { grid: { color: grid }, ticks: { color: ticks } },
      },
    };
  });

  protected readonly formatCompactNumber = formatCompactNumber;

  private horizontalBar(points: () => { label: string; count: number }[], resolveCountryName = false) {
    return computed<ChartConfiguration<"bar">["data"]>(() => {
      const list = [...points()].sort((a, b) => a.count - b.count);
      const accent = themeColor("accent", 0.85);
      return {
        labels: list.map((p) => (resolveCountryName ? (countryName(p.label) ?? p.label) : p.label)),
        datasets: [{ data: list.map((p) => p.count), backgroundColor: accent, borderRadius: 4, barThickness: 18 }],
      };
    });
  }
}
