import { Routes } from "@angular/router";

/**
 * Flat, lazy-loaded routes rendered inside `AppShellComponent`'s `<router-outlet>`. `:id` params
 * bind straight to a matching component `input()` via `withComponentInputBinding()`
 * (see `app.config.ts`), so detail components need no `ActivatedRoute` wiring.
 */
export const routes: Routes = [
  { path: "", pathMatch: "full", redirectTo: "discoveries" },
  {
    path: "discoveries",
    loadComponent: () => import("./features/discoveries/discovery-list.component").then((m) => m.DiscoveryListComponent),
    title: "Discoveries · visualScience",
  },
  {
    path: "discoveries/:id",
    loadComponent: () => import("./features/discoveries/discovery-detail.component").then((m) => m.DiscoveryDetailComponent),
    title: "Discovery · visualScience",
  },
  {
    path: "researchers",
    loadComponent: () => import("./features/researchers/researcher-list.component").then((m) => m.ResearcherListComponent),
    title: "Researchers · visualScience",
  },
  {
    path: "researchers/:id",
    loadComponent: () => import("./features/researchers/researcher-detail.component").then((m) => m.ResearcherDetailComponent),
    title: "Researcher · visualScience",
  },
  {
    path: "institutions",
    loadComponent: () => import("./features/institutions/institution-list.component").then((m) => m.InstitutionListComponent),
    title: "Institutions · visualScience",
  },
  {
    path: "institutions/:id",
    loadComponent: () => import("./features/institutions/institution-detail.component").then((m) => m.InstitutionDetailComponent),
    title: "Institution · visualScience",
  },
  {
    path: "stats",
    loadComponent: () => import("./features/stats/stats.component").then((m) => m.StatsComponent),
    title: "Stats & trends · visualScience",
  },
  {
    path: "about",
    loadComponent: () => import("./features/about/about.component").then((m) => m.AboutComponent),
    title: "About · visualScience",
  },
  { path: "**", redirectTo: "discoveries" },
];
