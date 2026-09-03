# Homepage relaunch: Astro, Nostr articles, portfolio, publications

Date: 2026-09-03
Status: approved in brainstorming, awaiting implementation plan

## Goal

Bring the personal site at steffen-roertgen.de back to life on a maintained
stack and add three kinds of content that are currently missing:

1. Long-form articles published on Nostr (kind 30023) under
   `npub1r30l8j4vmppvq8w23umcyvd3vct4zmfpfkn4c7h2h057rmlfcrmq9xt9ma`
   (hex `1c5ff3caacd842c01dca8f378231b16617516d214da75c7aeabbe9e1efe9c0f6`).
2. Academic publications (Springer chapter and the BIRD metadata-standards paper).
3. A portfolio page that tells potential customers what they can hire
   Steffen for, with short project summaries.

Every page ships full SEO metadata (Open Graph, Twitter card, schema.org
JSON-LD), a sitemap, and an RSS feed.

## Decisions made during brainstorming

| Topic | Decision |
|---|---|
| Framework | Migrate from Gatsby 4 to Astro 7. Gatsby is in maintenance mode. |
| Nostr articles | Pre-rendered at build time for SEO, plus a client-side applesauce island that shows articles newer than the build. |
| Blog list | One merged chronological list of local posts and Nostr articles. Duplicates by normalized title, Nostr version wins. |
| Publications | Hand-maintained YAML, seeded with two entries. |
| Language | English everywhere, including the portfolio. |
| Old project write-ups | Kept as a compact "older tools" list at the bottom of the Work page. |
| Hosting | GitHub Pages on the custom domain steffen-roertgen.de, no base path. |

## Stack

- Astro 7 with content collections and the official sitemap and RSS
  integrations.
- React only for the one browser island on the blog index, via `@astrojs/react`.
- applesauce (`applesauce-core`, `applesauce-relay`, and helpers) for all
  Nostr access, build time and browser.
- Plain CSS in one stylesheet. The existing self-hosted fonts (Fira Sans for
  body, Playfair Display 700 for headings) are kept. Emotion, the Typography
  plugin, Font Awesome, and react-icons are dropped.
- Node 24. Vitest for unit tests.

## Pages and routes

| Route | Content |
|---|---|
| `/` | Blog: merged list of local posts and Nostr articles, newest first. Each entry shows title, date, excerpt, and an "on Nostr" badge for Nostr articles. Contains the live island. |
| `/posts/<slug>/` | One page per local markdown post. Slug is the existing folder or file name. |
| `/articles/<d-tag>/` | One page per Nostr article, rendered from the event's markdown. Includes a link "Read on Nostr" to `https://njump.me/<naddr>`. |
| `/work/` | Portfolio: services blurb, project cards, committee roles, then "Older tools" list linking to `/projects/<slug>/`. |
| `/projects/<slug>/` | The 11 existing project write-ups, unchanged. |
| `/publications/` | Publication list. |
| `/about/` | Refreshed about text, photo, links to GitHub, email, and the npub on njump. Twitter link removed. |
| `/rss.xml` | RSS of the merged blog list. |
| `/sitemap-index.xml` | From the sitemap integration. |

Navigation: Blog, Work, Publications, About.

## Content sources

All content lives in the repo. The private knowledge base at
`~/coding/laocs_brain` is used once to seed the public-safe text; it is not
read at build time.

```
src/content/posts/        existing markdown posts, moved with their images
src/content/projects/     the 11 old write-ups, moved as they are
src/data/portfolio.yaml   project cards
src/data/publications.yaml
src/data/site.ts          name, npub, hex pubkey, relay list, social links, build-time constants
```

### Local posts

Frontmatter stays `title` and `date`. Excerpt is the first paragraph.
Images referenced relatively keep working through Astro's markdown image
handling.

### Portfolio entries (`portfolio.yaml`)

Fields: `title`, `client`, `period`, `role`, `summary` (about three
sentences), `url` (optional), `tags` (list). Seeded entries: INdex, MEM,
SkoHub / metadaten.nrw, BIRD / Nationale Bildungsplattform, WirLernenOnline
and JOINTLY, ComCal. A separate `roles` list holds DINI-AG-KIM and the BMBF
OER-Beirat membership. Contract amounts and hour counts are never included.

The services blurb at the top of the Work page is prose in the page itself,
three or four lines: metadata infrastructure for education, Nostr and
protocol-based systems, SKOS vocabularies and linked data, workshops and
consulting.

### Publications (`publications.yaml`)

Fields: `title`, `authors` (list), `venue`, `publisher`, `year`, `doi`,
`url`, `type` (`chapter` | `article` | `talk`). Seeded with:

- "Data Spaces in Education Infrastructure" (Springer chapter).
- "Metadata Standards in National Education Infrastructure: Development of
  Evaluation Criteria and Their Exemplary Application".

Exact author lists, venues, years, and DOIs are looked up during
implementation and filled in; if a DOI cannot be found the entry keeps a
`url` only.

## Nostr article pipeline

### Build time: the `nostrArticles` content loader

An Astro content loader defined in `src/loaders/nostr-articles.ts`:

1. Create an applesauce `RelayPool` and request
   `{ kinds: [30023], authors: [PUBKEY] }` from every relay in
   `site.relays`.
2. Collect events until EOSE from all relays or a 15 second timeout,
   whichever comes first. A relay that errors is logged and ignored.
3. Reduce to the newest event per `d` tag (`created_at`, tie broken by id).
4. For each event produce an entry with id = d-tag, and data: `title`,
   `summary`, `image`, `publishedAt` (the `published_at` tag, falling back to
   `created_at`), `dTag`, `naddr`, `eventId`, `createdAt`, and `body` = the
   markdown content. Rendering to HTML uses Astro's markdown pipeline so code
   blocks and images match local posts.
5. If zero events were received from all relays combined, throw. The build
   must not silently publish a site without articles.

Default relay list, shared with the browser island:
`wss://relay.damus.io`, `wss://nos.lol`, `wss://relay.nostr.band`,
`wss://relay.primal.net`, `wss://relay.edufeed.org`.

### Merging with local posts

`src/lib/blog.ts` exports `mergeBlog(posts, articles)`:

- Normalize titles: lowercase, strip punctuation and emoji, collapse
  whitespace.
- If a local post and an article share a normalized title, keep the article
  and drop the post from the list. The dropped post is also not built as a
  page (its route is omitted), but its folder stays in the repo.
- Sort by date descending.
- Each list entry carries `source: "local" | "nostr"`, `href`, `title`,
  `date`, `excerpt`.

### Browser: the live island

`src/components/LiveArticles.tsx`, a React island with `client:idle` on the
blog index. Props: `pubkey`, `relays`, `since` (the build timestamp as unix
seconds, embedded at build).

- Opens one `RelayPool`, requests `{ kinds: [30023], authors, since }`.
- Reduces to newest per d-tag, ignores any d-tag that already exists in the
  pre-rendered list (the island receives the list of known d-tags as a prop).
- Renders matching entries at the top of the list with a "new on Nostr"
  badge, linking to `https://njump.me/<naddr>`.
- Renders nothing while waiting and nothing on error. No spinner, no error
  message. The static page is the fallback in every failure case.
- Closes the pool on unmount.

### Freshness

`.github/workflows/deploy.yml` builds and deploys on push to `master`, on a
daily cron (`0 4 * * *`), and on `workflow_dispatch`. New articles therefore
get a static page within a day; the island bridges the gap in between.

## SEO metadata

### `Head.astro`

Used by every page through the base layout. Props: `title`, `description`,
`path` (for the canonical URL), `image` (optional, absolute URL), `type`
(`website` | `article`), `jsonLd` (object or array of objects).

Emits: `<title>`, meta description, canonical link, Open Graph
(`og:title`, `og:description`, `og:url`, `og:type`, `og:image`,
`og:site_name`, `og:locale` = `en`), Twitter card (`summary_large_image` when
an image exists, else `summary`), and one
`<script type="application/ld+json">` block.

Fallback image: `public/og-default.png`, a static image with the site name.
No per-page image generation.

### JSON-LD per page type (`src/lib/jsonld.ts`)

- `person()` — `Person` with name, jobTitle, url, `sameAs` (GitHub, njump
  profile URL, ORCID if configured in `site.ts`).
- Home and about: `WebSite` plus `person()`.
- Local posts and Nostr articles: `BlogPosting` with headline,
  datePublished, dateModified, author = `person()`, image when present,
  mainEntityOfPage = canonical URL. Nostr articles add `sameAs` = njump URL.
- Publications page: an `ItemList` of `ScholarlyArticle` objects with
  headline, author list, publisher, datePublished (year), `identifier` and
  `url` = DOI URL when present.
- Work page: `person()` extended with `hasOccupation` and an `ItemList` of
  `CreativeWork` per project, each with `name`, `description`,
  `sourceOrganization` = `Organization` with the client name, and `url` when
  present.

### Site-wide

Sitemap via `@astrojs/sitemap`. `public/robots.txt` allows everything and
points at the sitemap index. RSS at `/rss.xml` via `@astrojs/rss` over the
merged blog list.

## Deployment

- `astro.config.mjs`: `site: "https://steffen-roertgen.de"`, no `base`.
- `public/CNAME` containing `steffen-roertgen.de`.
- Workflow: checkout, Node 24, `npm ci`, `npm run build`, run the build
  checks, upload `dist/`, deploy with `actions/deploy-pages`.
- README documents the DNS records needed: four A records for
  steffen-roertgen.de to GitHub Pages IPs (185.199.108.153,
  185.199.109.153, 185.199.110.153, 185.199.111.153) and a CNAME for `www`
  to `sroertgen.github.io`, plus enabling "Enforce HTTPS" in the repository
  settings. The DNS change is done by the site owner.
- The old `gh-pages` npm deploy script and the `/homepage` path prefix are
  removed.

## Error handling summary

| Situation | Behaviour |
|---|---|
| One relay down at build | Logged, build continues with the others. |
| All relays down at build | Build fails with a clear message. |
| Article markdown fails to render | Build fails, naming the d-tag. |
| Island cannot reach relays | Static page stays as is, nothing rendered. |
| Duplicate d-tags across relays | Newest `created_at` wins. |
| Local post title matches an article | Article shown, post hidden. |

## Testing

Unit tests (Vitest):

- `normalizeTitle` and `mergeBlog`: duplicate detection, Nostr wins, sort
  order, entries carry the right `source` and `href`.
- `newestPerDTag`: two versions of one d-tag, ties.
- naddr encoding for a known event matches the expected string.
- JSON-LD builders produce the expected shapes, including `sameAs` for Nostr
  articles and DOI handling for publications with and without a DOI.
- The loader with a mocked pool: two relays, one returns two versions of the
  same d-tag, one errors; result has one entry with the newer content. A
  second case with all relays erroring throws.

Build check (`scripts/check-build.mjs`, run in CI after `astro build`):

- Every expected route exists in `dist/` (home, about, work, publications,
  every post, every project, every article, `rss.xml`, `sitemap-index.xml`,
  `robots.txt`, `CNAME`).
- Every HTML file has exactly one JSON-LD block that parses as JSON.
- Every HTML file has `og:title`, `og:description`, `og:url`, and a
  canonical link.

Manual:

- Local build served and clicked through, including the island showing a
  newer article (verified by temporarily lowering `since`).
- One post page validated with Google's Rich Results test.

## Out of scope

- Publishing the old local posts to Nostr.
- Bilingual site or language switch.
- Per-page OG image generation.
- Comments, zaps, or any Nostr write access from the site.
- Serving the site from the homelab.
