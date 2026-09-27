# `/data`

Written by [`scripts/fetch-data.mts`](../scripts/fetch-data.mts), run daily by
[`.github/workflows/fetch-data.yml`](../.github/workflows/fetch-data.yml). The production app
reads these files at runtime straight from GitHub via jsDelivr's CDN
(`https://cdn.jsdelivr.net/gh/<owner>/<repo>@main/data/...json`) — see
`src/environments/environment.prod.ts` — so a new commit here updates the live site without a
rebuild.

Source: [OpenAlex](https://openalex.org), covering journal articles from the last 30 days across
physics, biology, medicine, chemistry, computer science, mathematics, psychology, geology,
environmental science, materials science and engineering.

| File                 | Shape                                              | TypeScript model                                      |
| -------------------- | --------------------------------------------------- | ------------------------------------------------------ |
| `meta.json`          | `DataMeta`                                          | `src/app/core/models/stats.model.ts`                    |
| `discoveries.json`   | `Discovery[]`, newest first                         | `src/app/core/models/discovery.model.ts`                |
| `researchers.json`   | `Researcher[]`, ranked by citations in this window   | `src/app/core/models/researcher.model.ts`               |
| `institutions.json`  | `Institution[]`, ranked by discovery count           | `src/app/core/models/institution.model.ts`              |
| `stats.json`         | `StatsOverview`                                     | `src/app/core/models/stats.model.ts`                    |

To regenerate locally: `npm run fetch-data` (writes here **and** to `public/data`, which is what
`ng serve` reads in development — see `src/environments/environment.ts`).
