/**
 * Production environment: the site fetches data straight from GitHub at runtime via jsDelivr's
 * GitHub CDN, so a new `data/*.json` commit (pushed by the `fetch-data` workflow) reaches the
 * live site without rebuilding or redeploying it. `@main` tracks the default branch; jsDelivr
 * caches files for a few minutes.
 */
export const environment = {
  production: true,
  dataBaseUrl: "https://cdn.jsdelivr.net/gh/FlorianDaunay/visualScience@main/data",
};
