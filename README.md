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

GitHub Actions builds and deploys to GitHub Pages on every push to `master`, once a day at 04:00 UTC (so new Nostr articles get static pages), and on manual dispatch.

Custom domain: `public/CNAME` holds `steffen-roertgen.de`. DNS must point at GitHub Pages:

| Type  | Name | Value |
|-------|------|-------|
| A     | @    | 185.199.108.153 |
| A     | @    | 185.199.109.153 |
| A     | @    | 185.199.110.153 |
| A     | @    | 185.199.111.153 |
| CNAME | www  | sroertgen.github.io |

Then in the repository settings under Pages: source "GitHub Actions", custom domain `steffen-roertgen.de`, and enable "Enforce HTTPS" once the certificate is issued.
