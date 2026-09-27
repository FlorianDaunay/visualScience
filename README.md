# visualScience

A frontend-only Angular site that tracks recent, peer-reviewed scientific discoveries — with
direct links to the source, and profiles for the researchers, universities, labs and companies
behind them. Data comes from the free [OpenAlex](https://openalex.org) API and refreshes daily;
the site itself is a static build on GitHub Pages with no backend.

## How it fits together

```
scripts/fetch-data.mts  ──▶  /data/*.json  ──▶  committed to main  ──▶  served via jsDelivr CDN
                                                                              │
                                                                              ▼
                                                        Angular app (GitHub Pages) reads it live
```

Two independent GitHub Actions workflows:

- **`.github/workflows/fetch-data.yml`** — runs daily (+ manual dispatch), queries OpenAlex, and
  commits the refreshed JSON to `/data` if it changed. See `data/README.md` for the file shapes.
- **`.github/workflows/deploy.yml`** — builds the Angular app and deploys it to GitHub Pages on
  every push to `main` that touches app code (it ignores data-only commits, since the site
  fetches `/data` at runtime and needs no rebuild for a data refresh).

The theme system lives at `src/app/core/theme` — 59 hand-authored themes on one token/CSS-variable
system, picked from the "Appearance" panel in the sidebar.

## Getting started

```bash
npm install
npm run fetch-data   # populates /data and public/data from OpenAlex (a few seconds)
npm start            # ng serve
```

Other scripts: `npm run build:prod` (production build, GitHub Pages base-href), `npm test`
(unit tests), `npm run lint` (type-check).

## One-time repository setup

- **Pages source**: repo Settings → Pages → Source → **GitHub Actions**.
- Both workflows need no secrets — `fetch-data.yml` uses the default `GITHUB_TOKEN` to push, and
  OpenAlex needs no API key.
