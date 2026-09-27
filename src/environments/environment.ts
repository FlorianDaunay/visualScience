/**
 * Development environment: reads `/data/*.json` from `public/data`, a local copy of whatever
 * `npm run fetch-data` last produced (see `public/data/README.md`). Swapped for
 * `environment.prod.ts` in production builds via `angular.json`'s `fileReplacements`.
 */
export const environment = {
  production: false,
  dataBaseUrl: "/data",
};
