# Homepage

Source of https://steffen-roertgen.de, built with [Astro](https://astro.build).

## Content

- `src/content/posts/` — blog posts (markdown, `title` + `date` frontmatter).
- Long-form articles published on Nostr under `npub1r30l8j4vmppvq8w23umcyvd3vct4zmfpfkn4c7h2h057rmlfcrmq9xt9ma` are fetched at build time (`src/loaders/nostr-articles.ts`) and rendered under `/articles/`. A local post with the same title as a Nostr article is hidden in favour of the article.
- `src/data/portfolio.yaml` — Work page cards and committee roles.
- `src/data/publications.yaml` — Publications page.
- `src/content/projects/` — older tool write-ups, linked from the Work page.

## Develop

    npm install
    npm run dev        # http://localhost:4321
    npm test
    npm run build && npm run check:build

## Deploy

The site is served from the homelab (see `~/coding/homelab`, role `homepage`): a container on
`docker-host` clones this repository's `master` branch, runs `npm ci && npm run build` with Node 24,
and serves `dist/` with nginx behind Traefik. A systemd timer rebuilds it once a day so new Nostr
articles get static pages; a failed build keeps the previous image serving.

GitHub Actions (`.github/workflows/ci.yml`) only tests, type-checks, and builds on push and pull
requests. It does not deploy.

DNS for `steffen-roertgen.de` and `www.steffen-roertgen.de`: an A record to the homelab VPS
(89.58.9.7), no AAAA record. `www` redirects to the apex.
