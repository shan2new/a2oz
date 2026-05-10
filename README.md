# A2OJ Reimagined

An editorial, dark-first dashboard for tracking Codeforces ladder progress. Pulls real Codeforces data via the public API and overlays it on the curated A2OJ ladders (32 decks, 4,297 problems).

- **Stack** — Vite + React + TypeScript, Tailwind v4, shadcn/ui, Zustand, IndexedDB (`idb-keyval`).
- **Data** — A2OJ ladders are scraped once into `src/data/a2oj-ladders.json`; user profile + submissions + rating history come live from the Codeforces API and are cached to IndexedDB.
- **No backend** — direct browser calls to `codeforces.com/api/*` (CORS-enabled, public).

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Re-scrape A2OJ ladders

```bash
node scripts/scrape-a2oj.mjs
```

Writes `src/data/a2oj-ladders.json`. Rerun whenever A2OJ updates upstream.

## Deploy

Vercel: zero config. The bundled `vercel.json` rewrites all paths to `index.html` so React Router deep links work.
