# Homepage Relaunch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Gatsby 4 site with an Astro 7 site that merges local posts with Nostr long-form articles, adds a portfolio and a publications page, ships full SEO metadata, and deploys to GitHub Pages on steffen-roertgen.de.

**Architecture:** Astro static site with content collections. Local markdown posts and old project write-ups are `glob` collections; Nostr articles come from a custom content loader that uses applesauce at build time; portfolio and publications are YAML `file` collections. One React island on the blog index re-queries relays in the browser for articles newer than the build. A single `Head.astro` emits OG, Twitter, and JSON-LD for every page.

**Tech Stack:** Astro 7.2, @astrojs/react, @astrojs/sitemap, @astrojs/rss, React 19, applesauce-core / applesauce-common / applesauce-relay 6.x, rxjs, Vitest, Node 24, GitHub Actions + GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-09-03-homepage-relaunch-design.md`

## Global Constraints

- Node 24, npm. Astro 7.x. React 19. applesauce 6.x.
- Site URL is `https://steffen-roertgen.de`, no `base` path.
- Nostr identity: npub `npub1r30l8j4vmppvq8w23umcyvd3vct4zmfpfkn4c7h2h057rmlfcrmq9xt9ma`, hex `1c5ff3caacd842c01dca8f378231b16617516d214da75c7aeabbe9e1efe9c0f6`.
- Relay list (build and browser): `wss://relay.damus.io`, `wss://nos.lol`, `wss://relay.nostr.band`, `wss://relay.primal.net`, `wss://relay.edufeed.org`.
- All site text in English. No contract amounts or hour counts anywhere in the repo.
- The knowledge base `~/coding/laocs_brain` is read by the implementer for seeding text only; it is never referenced by code.
- Fonts: Fira Sans 400 (body), Playfair Display 700 (headings), self-hosted from `public/fonts/`.
- Every page renders exactly one JSON-LD block, `og:title`, `og:description`, `og:url`, and a canonical link.
- Commit after every task. Commit messages end with:
  ```
  Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01BAdcK52SQQNUUhxw4DVh1Y
  ```
- Verification uses `npm test` (Vitest) and `npm run build` followed by `node scripts/check-build.mjs`.

---

## File structure

```
package.json                     Astro scripts and deps (replaces Gatsby)
astro.config.mjs                 site URL, react + sitemap integrations
tsconfig.json                    extends astro/tsconfigs/strict, jsx react
vitest.config.ts                 plain Vitest, node env, tests/**
.github/workflows/deploy.yml     build + check + deploy to Pages
scripts/check-build.mjs          post-build assertions over dist/
public/CNAME                     steffen-roertgen.de
public/robots.txt
public/favicon.ico               moved from static/
public/og-default.png            default social image
public/fonts/                    moved from static/fonts/
public/{peanut.ttl,peanut_query.rq,peanut_star_query.rq,webid.ttl}  moved from static/
src/data/site.ts                 name, npub, pubkey, relays, links, description
src/data/portfolio.yaml          project cards + roles
src/data/publications.yaml
src/content.config.ts            collections: posts, projects, articles, portfolio, publications
src/content/posts/               moved from posts/
src/content/projects/            moved from projects/
src/loaders/nostr-articles.ts    Astro loader wrapping fetchArticles
src/lib/nostr.ts                 pure Nostr helpers + fetchArticles(request, …)
src/lib/blog.ts                  normalizeTitle, excerptFrom, mergeBlog
src/lib/jsonld.ts                JSON-LD builders
src/lib/content.ts               getBlog(): reads collections, calls mergeBlog
src/layouts/Base.astro           html shell, nav, Head
src/components/Head.astro        SEO head
src/components/BlogList.astro    renders BlogEntry[]
src/components/LiveArticles.tsx  browser island
src/styles/global.css
src/assets/photo.png, nostr_logo_blk.svg   kept
src/pages/index.astro
src/pages/about.astro
src/pages/work.astro
src/pages/publications.astro
src/pages/posts/[id].astro
src/pages/articles/[id].astro
src/pages/projects/[id].astro
src/pages/rss.xml.ts
tests/blog.test.ts
tests/nostr.test.ts
tests/jsonld.test.ts
tests/loader.test.ts
```

Deleted at the end: `gatsby-*.js`, `src/pages/*.js`, `src/templates/`, `src/utils/`, `src/components/layout.*`, `public/` (Gatsby build output), `static/`, `posts/`, `projects/`, `.jsbeautifyrc`, `.vscode/`, `TODOs.org`, `package-lock.json` (regenerated).

---

### Task 1: Astro scaffold with fonts, base layout, and test runner

**Files:**
- Modify: `package.json` (replace entirely)
- Create: `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `src/data/site.ts`, `src/styles/global.css`, `src/layouts/Base.astro`, `src/components/Head.astro` (minimal, extended in Task 8), `src/pages/index.astro` (placeholder, replaced in Task 5)
- Move: `static/fonts/` → `public/fonts/`, `static/favicon.ico` → `public/favicon.ico`, `static/*.ttl`, `static/*.rq` → `public/`
- Modify: `.gitignore` (add `dist/`, `.astro/`)
- Test: `tests/site.test.ts`

**Interfaces:**
- Produces `src/data/site.ts`:
  ```ts
  export const site = {
    name: "Steffen Rörtgen",
    title: "Hacking for Open Education",
    url: "https://steffen-roertgen.de",
    description: "...",
    npub: "npub1r30l8j4vmppvq8w23umcyvd3vct4zmfpfkn4c7h2h057rmlfcrmq9xt9ma",
    pubkey: "1c5ff3caacd842c01dca8f378231b16617516d214da75c7aeabbe9e1efe9c0f6",
    relays: string[],
    github: "sroertgen",
    email: "kontakt@steffen-roertgen.de",
    orcid: "" as string,
    njumpProfile: "https://njump.me/npub1r30l8j4vmppvq8w23umcyvd3vct4zmfpfkn4c7h2h057rmlfcrmq9xt9ma",
  }
  ```
- Produces `Base.astro` with props `{ title, description, path, image?, type?, jsonLd }` passed through to `Head.astro`.

- [ ] **Step 1: Replace package.json**

```json
{
  "name": "homepage",
  "private": true,
  "type": "module",
  "version": "1.0.0",
  "license": "MIT",
  "engines": { "node": ">=24" },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test": "vitest run",
    "test:watch": "vitest",
    "check:build": "node scripts/check-build.mjs"
  },
  "dependencies": {
    "@astrojs/react": "^6.0.5",
    "@astrojs/rss": "^4.0.19",
    "@astrojs/sitemap": "^3.7.4",
    "applesauce-common": "^6.2.0",
    "applesauce-core": "^6.2.0",
    "applesauce-relay": "^6.2.1",
    "astro": "^7.2.10",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "rxjs": "^7.8.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.6.0",
    "vitest": "^4.1.0"
  }
}
```

Then:

```bash
rm -f package-lock.json
rm -rf node_modules
npm install
```

If npm rejects a version range, run `npm view <package> version` and use the latest published version.

- [ ] **Step 2: Create astro.config.mjs, tsconfig.json, vitest.config.ts**

`astro.config.mjs`:
```js
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://steffen-roertgen.de",
  trailingSlash: "always",
  integrations: [react(), sitemap()],
  markdown: {
    shikiConfig: { theme: "solarized-light" },
  },
});
```

`tsconfig.json`:
```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "types": ["vitest/globals"]
  },
  "include": [".astro/types.d.ts", "src/**/*", "tests/**/*", "scripts/**/*"],
  "exclude": ["dist"]
}
```

`vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    globals: true,
  },
});
```

- [ ] **Step 3: Write the failing site test**

`tests/site.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { normalizeToPubkey } from "applesauce-core/helpers";
import { site } from "../src/data/site";

describe("site config", () => {
  it("pubkey matches the npub", () => {
    expect(normalizeToPubkey(site.npub)).toBe(site.pubkey);
  });
  it("has five relays, all wss", () => {
    expect(site.relays).toHaveLength(5);
    for (const r of site.relays) expect(r.startsWith("wss://")).toBe(true);
  });
  it("site url has no trailing slash", () => {
    expect(site.url).toBe("https://steffen-roertgen.de");
  });
});
```

Run: `npm test`
Expected: FAIL, cannot find module `../src/data/site`.

- [ ] **Step 4: Create src/data/site.ts**

```ts
export const site = {
  name: "Steffen Rörtgen",
  title: "Hacking for Open Education",
  url: "https://steffen-roertgen.de",
  description:
    "Steffen Rörtgen builds metadata infrastructure for open education: linked data, SKOS vocabularies, and Nostr-based systems. Blog, work, and publications.",
  npub: "npub1r30l8j4vmppvq8w23umcyvd3vct4zmfpfkn4c7h2h057rmlfcrmq9xt9ma",
  pubkey: "1c5ff3caacd842c01dca8f378231b16617516d214da75c7aeabbe9e1efe9c0f6",
  relays: [
    "wss://relay.damus.io",
    "wss://nos.lol",
    "wss://relay.nostr.band",
    "wss://relay.primal.net",
    "wss://relay.edufeed.org",
  ],
  github: "sroertgen",
  email: "kontakt@steffen-roertgen.de",
  orcid: "",
  njumpProfile:
    "https://njump.me/npub1r30l8j4vmppvq8w23umcyvd3vct4zmfpfkn4c7h2h057rmlfcrmq9xt9ma",
} as const;

export type Site = typeof site;
```

Run: `npm test`
Expected: PASS (3 tests).

- [ ] **Step 5: Move static assets and write global.css**

```bash
mkdir -p public
git mv static/fonts public/fonts
git mv static/favicon.ico public/favicon.ico
git mv static/peanut.ttl static/peanut_query.rq static/peanut_star_query.rq static/webid.ttl public/
rmdir static
```

Edit `public/fonts/fonts.css`: in the Fira Sans block replace `url('/fonts/fira-sans-v16-latin-regular.eot')` with `url('fira-sans-v16-latin-regular.eot')` so every URL is relative to the css file. Leave the rest.

`src/styles/global.css`:
```css
:root {
  --text: #1a1a1a;
  --muted: #777;
  --line: #ddd;
  --accent: #6b2d5c;
  --bg: #fff;
  --font-body: "Fira Sans", system-ui, sans-serif;
  --font-head: "Playfair Display", Georgia, serif;
}

* { box-sizing: border-box; }
html { line-height: 1.6; font-size: 18px; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-body);
}
.layout { max-width: 42rem; margin: 0 auto; padding: 1.5rem 1.25rem 3rem; }

h1, h2, h3, h4 { font-family: var(--font-head); font-weight: 700; line-height: 1.2; margin: 1.5em 0 0.5em; }
h1 { font-size: 2rem; }
h2 { font-size: 1.5rem; }
h3 { font-size: 1.2rem; }
a { color: var(--text); }
a:hover { color: var(--accent); }
img { max-width: 100%; height: auto; }
pre { padding: 1rem; overflow-x: auto; border-radius: 4px; font-size: 0.85rem; }
code { font-size: 0.9em; }
blockquote { margin: 1em 0; padding-left: 1em; border-left: 3px solid var(--line); color: var(--muted); }
table { border-collapse: collapse; width: 100%; display: block; overflow-x: auto; }
th, td { border: 1px solid var(--line); padding: 0.4rem 0.6rem; text-align: left; }

header.topnav { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0.5rem 1.25rem; margin-bottom: 2rem; }
header.topnav .brand { font-family: var(--font-head); font-size: 1.5rem; text-decoration: none; margin-right: auto; }
header.topnav nav a { text-decoration: none; }
header.topnav nav a.active { text-decoration: underline; }
header.topnav nav a + a { margin-left: 1rem; }

.section-title { display: inline-block; border-bottom: 1px solid var(--text); margin-bottom: 1.5rem; }
.entry { margin-bottom: 1.75rem; }
.entry h3 { margin: 0 0 0.25rem; }
.entry a { text-decoration: none; }
.entry .meta { color: var(--muted); font-size: 0.9rem; }
.entry p { margin: 0.25rem 0 0; }
.badge { display: inline-block; font-size: 0.7rem; padding: 0.1rem 0.4rem; border: 1px solid var(--accent); color: var(--accent); border-radius: 3px; vertical-align: middle; margin-left: 0.4rem; font-family: var(--font-body); }
.badge.new { background: var(--accent); color: #fff; }

.card { border: 1px solid var(--line); border-radius: 6px; padding: 1rem 1.25rem; margin-bottom: 1.25rem; }
.card h3 { margin-top: 0; }
.card .meta { color: var(--muted); font-size: 0.9rem; margin-bottom: 0.5rem; }
.tags { margin-top: 0.5rem; }
.tags span { display: inline-block; font-size: 0.75rem; background: #f2f2f2; padding: 0.1rem 0.5rem; border-radius: 3px; margin: 0 0.3rem 0.3rem 0; }

.social { display: flex; justify-content: center; gap: 1.25rem; align-items: center; margin: 1rem 0; }
.social img, .social svg { width: 32px; height: 32px; }
.portrait { display: block; margin: 1rem auto; width: 50%; border-radius: 50%; }
.center { text-align: center; }
footer { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid var(--line); color: var(--muted); font-size: 0.85rem; }

@media (max-width: 600px) {
  html { font-size: 17px; }
  .portrait { width: 70%; }
}
```

- [ ] **Step 6: Create a minimal Head.astro and Base.astro**

`src/components/Head.astro` (minimal; Task 8 replaces it):
```astro
---
import { site } from "../data/site";
interface Props {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  jsonLd: object | object[];
}
const { title, description, path, jsonLd } = Astro.props;
const canonical = new URL(path, site.url).toString();
---
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>{title}</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonical} />
<link rel="icon" href="/favicon.ico" />
<link rel="stylesheet" href="/fonts/fonts.css" />
<script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />
```

`src/layouts/Base.astro`:
```astro
---
import Head from "../components/Head.astro";
import { site } from "../data/site";
import "../styles/global.css";

interface Props {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  jsonLd: object | object[];
}
const props = Astro.props;
const current = Astro.url.pathname;
const links = [
  { href: "/", label: "Blog" },
  { href: "/work/", label: "Work" },
  { href: "/publications/", label: "Publications" },
  { href: "/about/", label: "About" },
];
const isActive = (href: string) => (href === "/" ? current === "/" : current.startsWith(href));
---
<!doctype html>
<html lang="en">
  <head>
    <Head {...props} />
  </head>
  <body>
    <div class="layout">
      <header class="topnav">
        <a class="brand" href="/">{site.title}</a>
        <nav>
          {links.map((l) => (
            <a href={l.href} class:list={[{ active: isActive(l.href) }]}>{l.label}</a>
          ))}
        </nav>
      </header>
      <main><slot /></main>
      <footer>
        {site.name} · <a href={`mailto:${site.email}`}>{site.email}</a> · <a href="/rss.xml">RSS</a>
      </footer>
    </div>
  </body>
</html>
```

`src/pages/index.astro` (placeholder):
```astro
---
import Base from "../layouts/Base.astro";
import { site } from "../data/site";
---
<Base title={site.title} description={site.description} path="/" jsonLd={{ "@context": "https://schema.org", "@type": "WebSite", name: site.title, url: site.url }}>
  <h2 class="section-title">Blog</h2>
  <p>Coming back soon.</p>
</Base>
```

Append to `.gitignore`:
```
# Astro
dist/
.astro/
```

Remove the old Gatsby build output and config so Astro does not pick them up:
```bash
git rm -r -q --cached public 2>/dev/null; rm -rf public/page-data public/static public/*.js public/*.json public/*.html public/webpack.stats.json public/chunk-map.json 2>/dev/null
git rm -q gatsby-config.js gatsby-node.js gatsby-browser.js
```
(Keep `public/fonts`, `public/favicon.ico`, and the moved ttl/rq files. After this, `ls public` shows only: `CNAME` is not there yet, `favicon.ico`, `fonts`, `peanut.ttl`, `peanut_query.rq`, `peanut_star_query.rq`, `webid.ttl`.)

- [ ] **Step 7: Build and verify**

Run: `npm run build`
Expected: build succeeds, `dist/index.html` exists and contains `Hacking for Open Education` and `<link rel="stylesheet" href="/fonts/fonts.css">`.

Run: `npm test`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "Replace Gatsby scaffold with Astro 7 base layout, fonts, and Vitest"
```

---

### Task 2: Posts and projects collections with their pages

**Files:**
- Move: `posts/` → `src/content/posts/`, `projects/` → `src/content/projects/`
- Create: `src/content.config.ts`, `src/pages/posts/[id].astro`, `src/pages/projects/[id].astro`
- Delete: `src/templates/blog-post.js`, `src/pages/index.js`, `src/pages/about.js`, `src/pages/projects.js`, `src/utils/`, `src/components/layout.js`, `src/components/layout.css`

**Interfaces:**
- Produces collections `posts` (schema `{ title: string; date: Date; link?: string }`) and `projects` (same schema). Entry ids: folder name for `index.md` posts (e.g. `2023-06-30`, `rdf-reasoning-over-linked-curricula`), and the file name without the numeric prefix, underscores turned into dashes, for flat files (e.g. `5_linking_the_data.md` → `linking-the-data`, `1_edu-sharing-with-a-click.md` → `edu-sharing-with-a-click`).
- Produces `src/lib/ids.ts` exporting `generateContentId({ entry }): string` (pure, tested).

- [ ] **Step 1: Write the failing id test**

`tests/ids.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { generateContentId } from "../src/lib/ids";

describe("generateContentId", () => {
  it("uses the folder name for index.md", () => {
    expect(generateContentId({ entry: "2023-06-30/index.md" })).toBe("2023-06-30");
    expect(generateContentId({ entry: "rdf-reasoning-over-linked-curricula/index.md" })).toBe("rdf-reasoning-over-linked-curricula");
  });
  it("strips numeric prefix and turns underscores into dashes", () => {
    expect(generateContentId({ entry: "5_linking_the_data.md" })).toBe("linking-the-data");
    expect(generateContentId({ entry: "1_edu-sharing-with-a-click.md" })).toBe("edu-sharing-with-a-click");
    expect(generateContentId({ entry: "10_klimakrise.md" })).toBe("klimakrise");
  });
});
```

Run: `npm test`
Expected: FAIL, module not found.

- [ ] **Step 2: Implement src/lib/ids.ts**

```ts
/** Astro glob-loader generateId: folder name for index.md, otherwise file name without numeric prefix. */
export function generateContentId({ entry }: { entry: string }): string {
  const noExt = entry.replace(/\.(md|mdx)$/, "");
  const base = noExt.endsWith("/index") ? noExt.slice(0, -"/index".length) : noExt;
  return base
    .replace(/^\d+_/, "")
    .replace(/_/g, "-")
    .toLowerCase();
}
```

Run: `npm test`
Expected: PASS.

- [ ] **Step 3: Move content and write content.config.ts**

```bash
git add posts/2023-06-30          # untracked until now; git mv needs it tracked
mkdir -p src/content
git mv posts src/content/posts
git mv projects src/content/projects
git rm -q -r src/templates src/utils src/components/layout.js src/components/layout.css src/pages/index.js src/pages/about.js src/pages/projects.js
```

`src/content.config.ts`:
```ts
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { generateContentId } from "./lib/ids";

const markdownSchema = z.object({
  title: z.string(),
  date: z.coerce.date(),
  link: z.string().url().optional(),
});

const posts = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/posts", generateId: generateContentId }),
  schema: markdownSchema,
});

const projects = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/projects", generateId: generateContentId }),
  schema: markdownSchema,
});

export const collections = { posts, projects };
```

- [ ] **Step 4: Create the post and project pages**

`src/pages/posts/[id].astro`:
```astro
---
import { getCollection, render } from "astro:content";
import Base from "../../layouts/Base.astro";
import { site } from "../../data/site";

export async function getStaticPaths() {
  const posts = await getCollection("posts");
  return posts.map((post) => ({ params: { id: post.id }, props: { post } }));
}
const { post } = Astro.props;
const { Content } = await render(post);
const date = post.data.date.toISOString().slice(0, 10);
---
<Base
  title={`${post.data.title} · ${site.name}`}
  description={post.data.title}
  path={`/posts/${post.id}/`}
  type="article"
  jsonLd={{ "@context": "https://schema.org", "@type": "BlogPosting", headline: post.data.title, datePublished: date }}
>
  <article>
    <h1>{post.data.title}</h1>
    <p class="meta">{date}</p>
    <Content />
  </article>
</Base>
```

`src/pages/projects/[id].astro`: identical, with `getCollection("projects")`, prop name `project`, path `/projects/${project.id}/`, and after the date line:
```astro
    {project.data.link && <p><a href={project.data.link} target="_blank" rel="noopener">Project page</a></p>}
```

(The JSON-LD here is temporary; Task 8 replaces it with the real builders.)

- [ ] **Step 5: Build and verify routes**

Run: `npm run build`
Expected: succeeds. Then:

```bash
ls dist/posts dist/projects
```
Expected: 13 post directories including `2023-06-30`, `blog-run`, `linking-the-data`, `rdf-reasoning-over-linked-curricula`; 11 project directories including `edu-sharing-with-a-click`, `klimakrise`.

```bash
grep -c "<img" dist/posts/rdf-reasoning-over-linked-curricula/index.html
```
Expected: 9 or more (the images resolved). If the count is 0, the relative image paths did not resolve; check that the markdown uses `./name.png` and that the png files moved with the folder.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Move posts and projects into Astro content collections with pages"
```

---

### Task 3: Blog merge logic (pure)

**Files:**
- Create: `src/lib/blog.ts`
- Test: `tests/blog.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export type BlogEntry = {
    source: "local" | "nostr";
    id: string;          // post id or article d-tag
    href: string;        // "/posts/<id>/" or "/articles/<dTag>/"
    title: string;
    date: Date;
    excerpt: string;
    naddr?: string;
  };
  export type LocalPostInput = { id: string; title: string; date: Date; body: string };
  export type NostrArticleInput = { dTag: string; title: string; publishedAt: number; summary: string; content: string; naddr: string };
  export function normalizeTitle(title: string): string;
  export function excerptFrom(markdown: string, maxLength?: number): string;
  export function mergeBlog(posts: LocalPostInput[], articles: NostrArticleInput[]): { entries: BlogEntry[]; hiddenPostIds: string[] };
  ```

- [ ] **Step 1: Write the failing tests**

`tests/blog.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { normalizeTitle, excerptFrom, mergeBlog } from "../src/lib/blog";

describe("normalizeTitle", () => {
  it("lowercases, strips punctuation and emoji, collapses whitespace", () => {
    expect(normalizeTitle("Nostr ♥️ RDF - Bringing Linked Data to the Nostr World"))
      .toBe("nostr rdf bringing linked data to the nostr world");
    expect(normalizeTitle("  Blog   run! ")).toBe("blog run");
  });
});

describe("excerptFrom", () => {
  it("takes the first paragraph and strips markdown", () => {
    const md = "# Heading\n\nThis is **bold** and a [link](https://x.y).\n\nSecond paragraph.";
    expect(excerptFrom(md)).toBe("This is bold and a link.");
  });
  it("skips images and code fences", () => {
    const md = "![alt](./a.png)\n\n```js\nx()\n```\n\nReal text here.";
    expect(excerptFrom(md)).toBe("Real text here.");
  });
  it("truncates at maxLength on a word boundary with an ellipsis", () => {
    const md = "one two three four five six seven eight nine ten";
    expect(excerptFrom(md, 18)).toBe("one two three four…");
  });
});

describe("mergeBlog", () => {
  const posts = [
    { id: "2023-06-30", title: "Nostr ♥️ RDF - Bringing Linked Data to the Nostr World", date: new Date("2023-06-30"), body: "Local body." },
    { id: "blog-run", title: "Blog run", date: new Date("2020-05-27"), body: "First post." },
  ];
  const articles = [
    { dTag: "nostr-rdf", title: "Nostr ♥️ RDF - Bringing Linked Data to the Nostr World", publishedAt: 1689459121, summary: "", content: "Nostr body.", naddr: "naddr1abc" },
    { dTag: "open", title: "Just calling it Open is not enough", publishedAt: 1749024507, summary: "How can Nostr help", content: "...", naddr: "naddr1def" },
  ];

  it("prefers the nostr version of a duplicate and hides the local post", () => {
    const { entries, hiddenPostIds } = mergeBlog(posts, articles);
    expect(hiddenPostIds).toEqual(["2023-06-30"]);
    expect(entries.filter((e) => normalizeTitle(e.title).startsWith("nostr rdf"))).toHaveLength(1);
    expect(entries.find((e) => e.id === "nostr-rdf")?.source).toBe("nostr");
  });

  it("sorts newest first and builds hrefs", () => {
    const { entries } = mergeBlog(posts, articles);
    expect(entries.map((e) => e.id)).toEqual(["open", "nostr-rdf", "blog-run"]);
    expect(entries[0].href).toBe("/articles/open/");
    expect(entries[2].href).toBe("/posts/blog-run/");
  });

  it("uses the summary as excerpt for articles and falls back to content", () => {
    const { entries } = mergeBlog(posts, articles);
    expect(entries.find((e) => e.id === "open")?.excerpt).toBe("How can Nostr help");
    expect(entries.find((e) => e.id === "nostr-rdf")?.excerpt).toBe("Nostr body.");
  });

  it("converts publishedAt seconds to a Date", () => {
    const { entries } = mergeBlog([], articles);
    expect(entries[0].date.getTime()).toBe(1749024507 * 1000);
  });
});
```

Run: `npm test`
Expected: FAIL, module not found.

- [ ] **Step 2: Implement src/lib/blog.ts**

```ts
export type BlogEntry = {
  source: "local" | "nostr";
  id: string;
  href: string;
  title: string;
  date: Date;
  excerpt: string;
  naddr?: string;
};

export type LocalPostInput = { id: string; title: string; date: Date; body: string };
export type NostrArticleInput = {
  dTag: string;
  title: string;
  publishedAt: number;
  summary: string;
  content: string;
  naddr: string;
};

export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[\p{P}\p{S}\p{Extended_Pictographic}️]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function excerptFrom(markdown: string, maxLength = 220): string {
  const withoutFences = markdown.replace(/```[\s\S]*?```/g, "");
  const paragraphs = withoutFences
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p && !p.startsWith("#") && !/^!\[/.test(p) && !p.startsWith("<"));
  const first = paragraphs[0] ?? "";
  const plain = first
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`~]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length <= maxLength) return plain;
  const cut = plain.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + "…";
}

export function mergeBlog(
  posts: LocalPostInput[],
  articles: NostrArticleInput[],
): { entries: BlogEntry[]; hiddenPostIds: string[] } {
  const articleTitles = new Set(articles.map((a) => normalizeTitle(a.title)));
  const hiddenPostIds = posts
    .filter((p) => articleTitles.has(normalizeTitle(p.title)))
    .map((p) => p.id);
  const hidden = new Set(hiddenPostIds);

  const localEntries: BlogEntry[] = posts
    .filter((p) => !hidden.has(p.id))
    .map((p) => ({
      source: "local",
      id: p.id,
      href: `/posts/${p.id}/`,
      title: p.title,
      date: p.date,
      excerpt: excerptFrom(p.body),
    }));

  const nostrEntries: BlogEntry[] = articles.map((a) => ({
    source: "nostr",
    id: a.dTag,
    href: `/articles/${a.dTag}/`,
    title: a.title,
    date: new Date(a.publishedAt * 1000),
    excerpt: a.summary.trim() || excerptFrom(a.content),
    naddr: a.naddr,
  }));

  const entries = [...localEntries, ...nostrEntries].sort((x, y) => y.date.getTime() - x.date.getTime());
  return { entries, hiddenPostIds };
}
```

Run: `npm test`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/lib/blog.ts tests/blog.test.ts
git commit -m "Add blog merge logic: title normalization, excerpts, nostr-wins dedupe"
```

---

### Task 4: Nostr helpers and fetchArticles (pure, mocked pool)

**Files:**
- Create: `src/lib/nostr.ts`
- Test: `tests/nostr.test.ts`

**Interfaces:**
- Produces:
  ```ts
  import type { NostrEvent, Filter } from "applesauce-core/helpers";
  import type { Observable } from "rxjs";
  export type NostrArticle = {
    dTag: string; title: string; summary: string; image?: string;
    publishedAt: number; createdAt: number; eventId: string; naddr: string; content: string;
  };
  export type RequestFn = (relays: string[], filters: Filter | Filter[]) => Observable<NostrEvent>;
  export function newestPerDTag(events: NostrEvent[]): NostrEvent[];
  export function articleFromEvent(event: NostrEvent): NostrArticle;
  export function articleFilter(pubkey: string, since?: number): Filter;
  export function fetchArticles(request: RequestFn, opts: { relays: string[]; pubkey: string; since?: number; timeoutMs?: number }): Promise<NostrArticle[]>;
  export function filterNewArticles(articles: NostrArticle[], knownDTags: string[]): NostrArticle[];
  ```
  `fetchArticles` resolves with `[]` when the stream errors before any event; the caller decides whether empty is fatal.

- [ ] **Step 1: Write the failing tests**

`tests/nostr.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { of, throwError, concat, NEVER } from "rxjs";
import type { NostrEvent } from "applesauce-core/helpers";
import { newestPerDTag, articleFromEvent, articleFilter, fetchArticles, filterNewArticles } from "../src/lib/nostr";

const PUBKEY = "1c5ff3caacd842c01dca8f378231b16617516d214da75c7aeabbe9e1efe9c0f6";

function ev(over: Partial<NostrEvent> & { d: string; title?: string; published?: number }): NostrEvent {
  const { d, title = "T", published, ...rest } = over;
  const tags: string[][] = [["d", d], ["title", title]];
  if (published) tags.push(["published_at", String(published)]);
  return {
    id: rest.id ?? "a".repeat(64),
    pubkey: PUBKEY,
    kind: 30023,
    created_at: rest.created_at ?? 1000,
    content: rest.content ?? "body",
    tags: [...tags, ...(rest.tags ?? [])],
    sig: "",
  } as NostrEvent;
}

describe("newestPerDTag", () => {
  it("keeps the newest created_at per d tag", () => {
    const old = ev({ d: "x", created_at: 10, id: "1".repeat(64) });
    const newer = ev({ d: "x", created_at: 20, id: "2".repeat(64) });
    const other = ev({ d: "y", created_at: 5, id: "3".repeat(64) });
    const out = newestPerDTag([old, other, newer]);
    expect(out.map((e) => e.id)).toEqual([newer.id, other.id]);
  });
  it("breaks ties by lower id", () => {
    const a = ev({ d: "x", created_at: 10, id: "b".repeat(64) });
    const b = ev({ d: "x", created_at: 10, id: "a".repeat(64) });
    expect(newestPerDTag([a, b])[0].id).toBe(b.id);
  });
  it("drops events without a d tag", () => {
    const noD = { ...ev({ d: "x" }), tags: [["title", "T"]] } as NostrEvent;
    expect(newestPerDTag([noD])).toEqual([]);
  });
});

describe("articleFromEvent", () => {
  it("reads title, summary, image, published_at and encodes naddr", () => {
    const e = ev({ d: "open", title: "Open", published: 1749024507, created_at: 1749100000, tags: [["summary", "S"], ["image", "https://i/x.png"]] });
    const a = articleFromEvent(e);
    expect(a.dTag).toBe("open");
    expect(a.title).toBe("Open");
    expect(a.summary).toBe("S");
    expect(a.image).toBe("https://i/x.png");
    expect(a.publishedAt).toBe(1749024507);
    expect(a.createdAt).toBe(1749100000);
    expect(a.naddr.startsWith("naddr1")).toBe(true);
  });
  it("falls back to created_at and empty summary", () => {
    const a = articleFromEvent(ev({ d: "x", created_at: 42 }));
    expect(a.publishedAt).toBe(42);
    expect(a.summary).toBe("");
    expect(a.image).toBeUndefined();
  });
});

describe("articleFilter", () => {
  it("builds a kind 30023 author filter, optionally with since", () => {
    expect(articleFilter(PUBKEY)).toEqual({ kinds: [30023], authors: [PUBKEY] });
    expect(articleFilter(PUBKEY, 5)).toEqual({ kinds: [30023], authors: [PUBKEY], since: 5 });
  });
});

describe("fetchArticles", () => {
  it("collects, dedupes and sorts newest published first", async () => {
    const e1 = ev({ d: "a", created_at: 1, published: 100, id: "1".repeat(64) });
    const e2 = ev({ d: "a", created_at: 2, published: 100, id: "2".repeat(64), content: "v2" });
    const e3 = ev({ d: "b", created_at: 3, published: 300, id: "3".repeat(64) });
    const request = () => of(e1, e3, e2);
    const out = await fetchArticles(request, { relays: ["wss://x"], pubkey: PUBKEY });
    expect(out.map((a) => a.dTag)).toEqual(["b", "a"]);
    expect(out[1].content).toBe("v2");
  });
  it("returns what arrived before an error", async () => {
    const e = ev({ d: "a", id: "1".repeat(64) });
    const request = () => concat(of(e), throwError(() => new Error("boom")));
    const out = await fetchArticles(request, { relays: ["wss://x"], pubkey: PUBKEY });
    expect(out).toHaveLength(1);
  });
  it("returns empty when the stream errors immediately", async () => {
    const request = () => throwError(() => new Error("boom"));
    expect(await fetchArticles(request, { relays: ["wss://x"], pubkey: PUBKEY })).toEqual([]);
  });
  it("gives up after timeoutMs", async () => {
    const e = ev({ d: "a", id: "1".repeat(64) });
    const request = () => concat(of(e), NEVER);
    const out = await fetchArticles(request, { relays: ["wss://x"], pubkey: PUBKEY, timeoutMs: 50 });
    expect(out).toHaveLength(1);
  });
});

describe("filterNewArticles", () => {
  it("drops articles whose d tag is already known", () => {
    const a = articleFromEvent(ev({ d: "a" }));
    const b = articleFromEvent(ev({ d: "b" }));
    expect(filterNewArticles([a, b], ["a"]).map((x) => x.dTag)).toEqual(["b"]);
  });
});
```

Run: `npm test`
Expected: FAIL, module not found.

- [ ] **Step 2: Implement src/lib/nostr.ts**

```ts
import type { NostrEvent, Filter } from "applesauce-core/helpers";
import { getAddressPointerForEvent, getTagValue, naddrEncode } from "applesauce-core/helpers";
import { getArticleImage, getArticlePublished, getArticleSummary, getArticleTitle } from "applesauce-common/helpers";
import { lastValueFrom, timeout, catchError, of, toArray, type Observable } from "rxjs";

export const ARTICLE_KIND = 30023;

export type NostrArticle = {
  dTag: string;
  title: string;
  summary: string;
  image?: string;
  publishedAt: number;
  createdAt: number;
  eventId: string;
  naddr: string;
  content: string;
};

export type RequestFn = (relays: string[], filters: Filter | Filter[]) => Observable<NostrEvent>;

export function newestPerDTag(events: NostrEvent[]): NostrEvent[] {
  const byD = new Map<string, NostrEvent>();
  for (const e of events) {
    const d = getTagValue(e, "d");
    if (d === undefined) continue;
    const cur = byD.get(d);
    if (!cur || e.created_at > cur.created_at || (e.created_at === cur.created_at && e.id < cur.id)) {
      byD.set(d, e);
    }
  }
  return [...byD.values()];
}

export function articleFromEvent(event: NostrEvent): NostrArticle {
  const dTag = getTagValue(event, "d") ?? "";
  const pointer = getAddressPointerForEvent(event);
  return {
    dTag,
    title: getArticleTitle(event) ?? dTag,
    summary: getArticleSummary(event) ?? "",
    image: getArticleImage(event) || undefined,
    publishedAt: getArticlePublished(event) || event.created_at,
    createdAt: event.created_at,
    eventId: event.id,
    naddr: naddrEncode(pointer),
    content: event.content,
  };
}

export function articleFilter(pubkey: string, since?: number): Filter {
  const f: Filter = { kinds: [ARTICLE_KIND], authors: [pubkey] };
  if (since !== undefined) f.since = since;
  return f;
}

export async function fetchArticles(
  request: RequestFn,
  opts: { relays: string[]; pubkey: string; since?: number; timeoutMs?: number },
): Promise<NostrArticle[]> {
  const collected: NostrEvent[] = [];
  await lastValueFrom(
    request(opts.relays, articleFilter(opts.pubkey, opts.since)).pipe(
      timeout(opts.timeoutMs ?? 15000),
      catchError(() => of()),
      toArray(),
    ),
    { defaultValue: [] },
  ).then((events) => collected.push(...events));
  return newestPerDTag(collected)
    .map(articleFromEvent)
    .sort((a, b) => b.publishedAt - a.publishedAt || b.createdAt - a.createdAt);
}

export function filterNewArticles(articles: NostrArticle[], knownDTags: string[]): NostrArticle[] {
  const known = new Set(knownDTags);
  return articles.filter((a) => !known.has(a.dTag));
}
```

Note on the `timeout` operator: with `catchError(() => of())` after it, a timeout error ends the stream cleanly, but events that arrived before the timeout are lost by `toArray` only if the error propagates. Because `catchError` sits before `toArray`, `toArray` sees completion, so events already emitted are kept. The test "gives up after timeoutMs" verifies this.

Run: `npm test`
Expected: PASS. If the "returns what arrived before an error" test fails with `[]`, move `catchError` after a `toArray`-free path is not possible; instead replace the pipe with a manual `subscribe` that pushes into `collected` and resolves on `error`, `complete`, or a `setTimeout`. Keep the tests unchanged.

- [ ] **Step 3: Commit**

```bash
git add src/lib/nostr.ts tests/nostr.test.ts
git commit -m "Add Nostr article helpers and fetchArticles with mocked-pool tests"
```

---

### Task 5: Nostr articles loader, article pages, merged blog index

**Files:**
- Create: `src/loaders/nostr-articles.ts`, `src/lib/content.ts`, `src/components/BlogList.astro`, `src/pages/articles/[id].astro`
- Modify: `src/content.config.ts` (add `articles`), `src/pages/index.astro` (real list), `src/pages/posts/[id].astro` (skip hidden posts)
- Test: `tests/loader.test.ts`

**Interfaces:**
- Consumes `fetchArticles`, `RequestFn` from Task 4; `mergeBlog` from Task 3.
- Produces loader factory `nostrArticlesLoader(opts: { pubkey: string; relays: string[]; request?: RequestFn; timeoutMs?: number })` returning an Astro `Loader`. Collection `articles` entries have id = dTag and data `{ dTag, title, summary, image?, publishedAt, createdAt, eventId, naddr }`, `body` = markdown, `rendered` = HTML.
- Produces `src/lib/content.ts`:
  ```ts
  export async function getBlog(): Promise<{ entries: BlogEntry[]; hiddenPostIds: string[]; knownDTags: string[] }>;
  ```
- Produces `BUILD_TIME` in `src/data/build.ts`: `export const BUILD_TIME = Math.floor(Date.now() / 1000);` (evaluated once per build).

- [ ] **Step 1: Write the failing loader test**

`tests/loader.test.ts`:
```ts
import { describe, it, expect, vi } from "vitest";
import { of, throwError } from "rxjs";
import type { NostrEvent } from "applesauce-core/helpers";
import { nostrArticlesLoader } from "../src/loaders/nostr-articles";

const PUBKEY = "1c5ff3caacd842c01dca8f378231b16617516d214da75c7aeabbe9e1efe9c0f6";
const ev = (d: string, created_at: number, content: string): NostrEvent =>
  ({ id: String(created_at).padStart(64, "0"), pubkey: PUBKEY, kind: 30023, created_at, content, tags: [["d", d], ["title", "T " + d]], sig: "" }) as NostrEvent;

function fakeContext() {
  const set = new Map<string, any>();
  return {
    store: { clear: () => set.clear(), set: (e: any) => set.set(e.id, e), entries: () => [...set.entries()] },
    parseData: async ({ data }: any) => data,
    renderMarkdown: async (md: string) => ({ html: `<p>${md}</p>` }),
    logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
    set,
  } as any;
}

describe("nostrArticlesLoader", () => {
  it("stores the newest version per d tag with rendered html", async () => {
    const request = () => of(ev("a", 1, "old"), ev("a", 2, "new"), ev("b", 3, "b"));
    const loader = nostrArticlesLoader({ pubkey: PUBKEY, relays: ["wss://x"], request });
    const ctx = fakeContext();
    await loader.load(ctx);
    expect([...ctx.set.keys()].sort()).toEqual(["a", "b"]);
    expect(ctx.set.get("a").body).toBe("new");
    expect(ctx.set.get("a").rendered.html).toBe("<p>new</p>");
    expect(ctx.set.get("a").data.naddr.startsWith("naddr1")).toBe(true);
  });

  it("throws when no article was received at all", async () => {
    const request = () => throwError(() => new Error("all relays down"));
    const loader = nostrArticlesLoader({ pubkey: PUBKEY, relays: ["wss://x"], request });
    await expect(loader.load(fakeContext())).rejects.toThrow(/no articles/i);
  });
});
```

Run: `npm test`
Expected: FAIL, module not found.

- [ ] **Step 2: Implement the loader**

`src/loaders/nostr-articles.ts`:
```ts
import type { Loader } from "astro/loaders";
import { z } from "astro/zod";
import { RelayPool } from "applesauce-relay";
import { fetchArticles, type RequestFn } from "../lib/nostr";

export const articleSchema = z.object({
  dTag: z.string(),
  title: z.string(),
  summary: z.string(),
  image: z.string().optional(),
  publishedAt: z.number(),
  createdAt: z.number(),
  eventId: z.string(),
  naddr: z.string(),
});

export function nostrArticlesLoader(opts: {
  pubkey: string;
  relays: string[];
  request?: RequestFn;
  timeoutMs?: number;
}): Loader {
  return {
    name: "nostr-articles",
    schema: articleSchema,
    async load({ store, parseData, renderMarkdown, logger }) {
      let pool: RelayPool | undefined;
      const request: RequestFn =
        opts.request ??
        ((relays, filters) => {
          pool = pool ?? new RelayPool();
          return pool.request(relays, filters);
        });

      logger.info(`Fetching kind 30023 for ${opts.pubkey.slice(0, 8)} from ${opts.relays.length} relays`);
      const articles = await fetchArticles(request, {
        relays: opts.relays,
        pubkey: opts.pubkey,
        timeoutMs: opts.timeoutMs,
      });
      pool?.close?.();

      if (articles.length === 0) {
        throw new Error("nostr-articles loader: no articles received from any relay. Refusing to build without them.");
      }

      store.clear();
      for (const a of articles) {
        const { content, ...rest } = a;
        const data = await parseData({ id: a.dTag, data: rest });
        let rendered;
        try {
          rendered = await renderMarkdown(content);
        } catch (err) {
          throw new Error(`nostr-articles loader: failed to render markdown for d-tag "${a.dTag}": ${(err as Error).message}`);
        }
        store.set({ id: a.dTag, data, body: content, rendered });
      }
      logger.info(`Stored ${articles.length} articles`);
    },
  };
}
```

Run: `npm test`
Expected: PASS.

- [ ] **Step 3: Register the collection and add build time**

`src/data/build.ts`:
```ts
/** Unix seconds at build time. Embedded into pages so the browser island can ask relays for newer articles. */
export const BUILD_TIME = Math.floor(Date.now() / 1000);
```

In `src/content.config.ts` add:
```ts
import { nostrArticlesLoader } from "./loaders/nostr-articles";
import { site } from "./data/site";

const articles = defineCollection({
  loader: nostrArticlesLoader({ pubkey: site.pubkey, relays: [...site.relays] }),
});
```
and export `{ posts, projects, articles }`.

- [ ] **Step 4: Create src/lib/content.ts**

```ts
import { getCollection } from "astro:content";
import { mergeBlog, type BlogEntry } from "./blog";

export async function getBlog(): Promise<{ entries: BlogEntry[]; hiddenPostIds: string[]; knownDTags: string[] }> {
  const [posts, articles] = await Promise.all([getCollection("posts"), getCollection("articles")]);
  const { entries, hiddenPostIds } = mergeBlog(
    posts.map((p) => ({ id: p.id, title: p.data.title, date: p.data.date, body: p.body ?? "" })),
    articles.map((a) => ({
      dTag: a.data.dTag,
      title: a.data.title,
      publishedAt: a.data.publishedAt,
      summary: a.data.summary,
      content: a.body ?? "",
      naddr: a.data.naddr,
    })),
  );
  return { entries, hiddenPostIds, knownDTags: articles.map((a) => a.data.dTag) };
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}
```

- [ ] **Step 5: BlogList component, article page, index, hidden posts**

`src/components/BlogList.astro`:
```astro
---
import type { BlogEntry } from "../lib/blog";
import { formatDate } from "../lib/content";
interface Props { entries: BlogEntry[] }
const { entries } = Astro.props;
---
{entries.map((e) => (
  <div class="entry">
    <h3>
      <a href={e.href}>{e.title}</a>
      {e.source === "nostr" && <span class="badge">on Nostr</span>}
    </h3>
    <div class="meta">{formatDate(e.date)}</div>
    <p>{e.excerpt}</p>
  </div>
))}
```

`src/pages/articles/[id].astro`:
```astro
---
import { getCollection, render } from "astro:content";
import Base from "../../layouts/Base.astro";
import { site } from "../../data/site";
import { formatDate } from "../../lib/content";

export async function getStaticPaths() {
  const articles = await getCollection("articles");
  return articles.map((article) => ({ params: { id: article.id }, props: { article } }));
}
const { article } = Astro.props;
const { Content } = await render(article);
const date = new Date(article.data.publishedAt * 1000);
const njump = `https://njump.me/${article.data.naddr}`;
---
<Base
  title={`${article.data.title} · ${site.name}`}
  description={article.data.summary || article.data.title}
  path={`/articles/${article.id}/`}
  image={article.data.image}
  type="article"
  jsonLd={{ "@context": "https://schema.org", "@type": "BlogPosting", headline: article.data.title }}
>
  <article>
    <h1>{article.data.title}</h1>
    <p class="meta">{formatDate(date)} · <a href={njump} target="_blank" rel="noopener">Read on Nostr</a></p>
    {article.data.image && <img src={article.data.image} alt="" />}
    <Content />
  </article>
</Base>
```

`src/pages/index.astro`:
```astro
---
import Base from "../layouts/Base.astro";
import BlogList from "../components/BlogList.astro";
import { site } from "../data/site";
import { getBlog } from "../lib/content";
const { entries } = await getBlog();
---
<Base title={site.title} description={site.description} path="/" jsonLd={{ "@context": "https://schema.org", "@type": "WebSite", name: site.title, url: site.url }}>
  <h2 class="section-title">Blog</h2>
  <BlogList entries={entries} />
</Base>
```

In `src/pages/posts/[id].astro` change `getStaticPaths` to skip hidden posts:
```astro
import { getBlog } from "../../lib/content";
export async function getStaticPaths() {
  const [posts, { hiddenPostIds }] = await Promise.all([getCollection("posts"), getBlog()]);
  const hidden = new Set(hiddenPostIds);
  return posts.filter((p) => !hidden.has(p.id)).map((post) => ({ params: { id: post.id }, props: { post } }));
}
```

- [ ] **Step 6: Build and verify**

Run: `npm run build`
Expected: log line `Stored 4 articles` (or more), then:

```bash
ls dist/articles
test ! -e dist/posts/2023-06-30 && echo "hidden ok"
grep -o 'on Nostr' dist/index.html | wc -l
```
Expected: four article directories; `hidden ok`; count 4. Open `dist/articles/*/index.html` for the "Just calling it Open" article and confirm the body is rendered HTML with headings, not raw markdown.

Run: `npm test`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Add Nostr articles content loader, article pages, and merged blog index"
```

---

### Task 6: Browser island for articles newer than the build

**Files:**
- Create: `src/components/LiveArticles.tsx`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes `fetchArticles`, `filterNewArticles`, `NostrArticle` from Task 4; `BUILD_TIME` from Task 5.
- Props: `{ pubkey: string; relays: string[]; since: number; knownDTags: string[] }`.

- [ ] **Step 1: Write the island**

`src/components/LiveArticles.tsx`:
```tsx
import { useEffect, useState } from "react";
import { RelayPool } from "applesauce-relay";
import { fetchArticles, filterNewArticles, type NostrArticle } from "../lib/nostr";

type Props = { pubkey: string; relays: string[]; since: number; knownDTags: string[] };

export default function LiveArticles({ pubkey, relays, since, knownDTags }: Props) {
  const [fresh, setFresh] = useState<NostrArticle[]>([]);

  useEffect(() => {
    let cancelled = false;
    const pool = new RelayPool();
    fetchArticles((r, f) => pool.request(r, f), { relays, pubkey, since, timeoutMs: 10000 })
      .then((articles) => {
        if (!cancelled) setFresh(filterNewArticles(articles, knownDTags));
      })
      .catch(() => {})
      .finally(() => pool.close?.());
    return () => {
      cancelled = true;
      pool.close?.();
    };
  }, [pubkey, since]);

  if (fresh.length === 0) return null;

  return (
    <>
      {fresh.map((a) => (
        <div className="entry" key={a.dTag}>
          <h3>
            <a href={`https://njump.me/${a.naddr}`} target="_blank" rel="noopener">{a.title}</a>
            <span className="badge new">new on Nostr</span>
          </h3>
          <div className="meta">
            {new Date(a.publishedAt * 1000).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
          </div>
          {a.summary && <p>{a.summary}</p>}
        </div>
      ))}
    </>
  );
}
```

- [ ] **Step 2: Mount it on the index**

In `src/pages/index.astro` frontmatter add:
```ts
import LiveArticles from "../components/LiveArticles";
import { BUILD_TIME } from "../data/build";
const { entries, knownDTags } = await getBlog();
```
and above `<BlogList>`:
```astro
  <LiveArticles client:idle pubkey={site.pubkey} relays={[...site.relays]} since={BUILD_TIME} knownDTags={knownDTags} />
```

- [ ] **Step 3: Verify manually**

Run: `npm run build && npm run preview`, open http://localhost:4321/ in a browser. Expected: the list renders, no console errors, nothing added (no article newer than the build).

Then temporarily change `since={BUILD_TIME}` to `since={0}` and `knownDTags={[]}`, rebuild, reload. Expected: the four articles appear at the top with a "new on Nostr" badge, each linking to njump. Revert the two props, rebuild, confirm they are gone again.

Run: `npm test`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Add LiveArticles island showing Nostr articles newer than the build"
```

---

### Task 7: Portfolio and publications data and pages

**Files:**
- Create: `src/data/portfolio.yaml`, `src/data/publications.yaml`, `src/pages/work.astro`, `src/pages/publications.astro`
- Modify: `src/content.config.ts` (add `portfolio`, `roles`, `publications` collections via `file()` loader)

**Interfaces:**
- Collection `portfolio` entries: `{ id, title, client, period, role, summary, url?, tags: string[] }`.
- Collection `roles` entries: `{ id, body: string, since?: string }`.
- Collection `publications` entries: `{ id, title, authors: string[], venue, publisher, year: number, doi?, url, type: "chapter" | "article" | "talk", openAccess?: boolean }`.

- [ ] **Step 1: Write the data files**

`src/data/portfolio.yaml`:
```yaml
projects:
  - id: index
    title: INdex — infrastructure and index for higher-education teaching
    client: Stiftung Innovation in der Hochschullehre
    period: 2022 – ongoing
    role: Freelance developer and consultant
    summary: >-
      An interoperable infrastructure and a filterable index for information that already exists
      elsewhere: open educational resources, project descriptions, events, didactic models, and
      funding measures. Built on the Nostr protocol with relays for each object type, crawlers that
      pull in existing portal data, and a Typesense-backed search interface. I also co-lead the
      working group on didactic metadata and connect individual portals to the infrastructure.
    url: https://edufeed.org
    tags: [Nostr, metadata, search, community]
  - id: mem
    title: MEM — machine-readable curriculum data
    client: FWU (Digitalpakt Schule)
    period: since 2024
    role: Project lead, metadata and ontologies
    summary: >-
      A project to represent the curricula of the German federal states as machine-readable data.
      I designed the data models, built prototypes, and transformed existing curriculum documents
      into an OWL/RDF ontology that is served through one uniform interface.
    url: https://w3id.org/lehrplan/ontology/
    tags: [RDF, OWL, curricula, ontology design]
  - id: skohub
    title: SkoHub and metadaten.nrw
    client: hbz NRW
    period: 2022 – 2024
    role: Research associate, maintainer of SkoHub
    summary: >-
      Maintainer of the SkoHub services, which make controlled vocabularies easy to publish and use
      and are in production at IQB, SODIX/FWU, and WirLernenOnline. I built a reconciliation module
      following the W3C specification, a SHACL shape for SKOS validation, and ran support, workshops,
      and trainings.
    url: https://skohub.io
    tags: [SKOS, vocabularies, SHACL, reconciliation]
  - id: bird
    title: BIRD — prototype of the national education platform
    client: GWDG
    period: 2021 – 2022
    role: Product owner, work package "Qualification – Content"
    summary: >-
      Infrastructure work for the prototype of Germany's national education platform: a survey and
      classification of common education standards by use case and audience, connecting the
      WirLernenOnline portal, and use cases, personas, and quality criteria for open educational
      resources. The metadata evaluation criteria were published as a DELFI 2023 paper.
    tags: [standards, metadata, product ownership]
  - id: wlo
    title: WirLernenOnline and JOINTLY
    client: GWDG
    period: 2019 – 2021
    role: Developer
    summary: >-
      The prototype that became the basis of the ETL pipeline and search engine of WirLernenOnline,
      Germany's open search portal for educational resources. I built tools that check the metadata
      quality of crawled content and help editorial teams improve it, and I was responsible for the
      metadata sets.
    url: https://wirlernenonline.de
    tags: [ETL, metadata quality, search]
  - id: comcal
    title: ComCal — open education community calendar
    client: OE_Space funding
    period: 2025
    role: Pitch and implementation
    summary: >-
      An interoperable community calendar on the Nostr protocol, pitched and delivered within a
      two-month funding window. Live and in use by the open education community.
    url: https://comcal.edufeed.org
    tags: [Nostr, calendar, community]
roles:
  - id: dini
    body: DINI-AG-KIM — lead of the curricula group, deputy lead of the OER metadata group
  - id: oer-beirat
    body: Member of the OER advisory board of the German Federal Ministry of Education and Research (BMBF), appointed for metadata infrastructure expertise
    since: "2024"
```

`src/data/publications.yaml`:
```yaml
- id: data-spaces-2026
  title: Data Spaces in Educational Infrastructures
  authors: [Steffen Rörtgen, Bastian Granas, Marcus Blümel, Jörg Lohrer, Gina Buchwald-Chassée]
  venue: Digital Education and Innovation
  publisher: Springer Nature Switzerland
  year: 2026
  doi: 10.1007/978-3-032-26816-7_11
  url: https://doi.org/10.1007/978-3-032-26816-7_11
  type: chapter
  openAccess: true
- id: metadata-standards-2023
  title: "Metadata Standards in National Education Infrastructure: Development of Evaluation Criteria and Their Exemplary Application"
  authors: [Steffen Rörtgen, Ronald Brenner, Holger Zimmermann, Matthias Hupfer, Annett Zobel, Ulrike Lucke]
  venue: DELFI 2023 – 21. Fachtagung Bildungstechnologien, Lecture Notes in Informatics P-338
  publisher: Gesellschaft für Informatik
  year: 2023
  doi: 10.18420/delfi2023-24
  url: https://doi.org/10.18420/delfi2023-24
  type: article
  openAccess: true
```

- [ ] **Step 2: Register the collections**

In `src/content.config.ts` add:
```ts
import { file } from "astro/loaders";

const portfolio = defineCollection({
  loader: file("src/data/portfolio.yaml", { parser: (text) => parseYamlKey(text, "projects") }),
  schema: z.object({
    title: z.string(),
    client: z.string(),
    period: z.string(),
    role: z.string(),
    summary: z.string(),
    url: z.string().url().optional(),
    tags: z.array(z.string()),
  }),
});

const roles = defineCollection({
  loader: file("src/data/portfolio.yaml", { parser: (text) => parseYamlKey(text, "roles") }),
  schema: z.object({ body: z.string(), since: z.string().optional() }),
});

const publications = defineCollection({
  loader: file("src/data/publications.yaml"),
  schema: z.object({
    title: z.string(),
    authors: z.array(z.string()),
    venue: z.string(),
    publisher: z.string(),
    year: z.number(),
    doi: z.string().optional(),
    url: z.string().url(),
    type: z.enum(["chapter", "article", "talk"]),
    openAccess: z.boolean().optional(),
  }),
});
```
with, at the top of the file:
```ts
import yaml from "js-yaml";
function parseYamlKey(text: string, key: string) {
  const doc = yaml.load(text) as Record<string, unknown[]>;
  return doc[key];
}
```
and `npm install js-yaml && npm install -D @types/js-yaml`. (js-yaml 4+ `load` uses the safe default schema; it does not construct arbitrary types.) Export `{ posts, projects, articles, portfolio, roles, publications }`.

- [ ] **Step 3: Work page**

`src/pages/work.astro`:
```astro
---
import { getCollection } from "astro:content";
import Base from "../layouts/Base.astro";
import { site } from "../data/site";

const projects = await getCollection("portfolio");
const roles = await getCollection("roles");
const older = (await getCollection("projects")).sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
const description = "What Steffen Rörtgen can be hired for: metadata infrastructure for education, Nostr and protocol-based systems, SKOS vocabularies and linked data, workshops and consulting.";
---
<Base title={`Work · ${site.name}`} description={description} path="/work/" jsonLd={{ "@context": "https://schema.org", "@type": "Person", name: site.name }}>
  <h2 class="section-title">Work</h2>
  <p>I build the plumbing that makes open education findable. Things I can be hired for:</p>
  <ul>
    <li><strong>Metadata infrastructure for education</strong>: data models, application profiles, validation, and the pipelines around them.</li>
    <li><strong>Nostr and protocol-based systems</strong>: relays, crawlers, indexes, and clients that avoid platform lock-in.</li>
    <li><strong>SKOS vocabularies and linked data</strong>: publishing, reconciliation, SHACL validation, RDF and OWL modelling.</li>
    <li><strong>Workshops and consulting</strong>: standards selection, metadata strategy, and hands-on training for editorial and developer teams.</li>
  </ul>

  <h2 class="section-title">Selected projects</h2>
  {projects.map((p) => (
    <div class="card">
      <h3>{p.data.url ? <a href={p.data.url} target="_blank" rel="noopener">{p.data.title}</a> : p.data.title}</h3>
      <div class="meta">{p.data.client} · {p.data.period} · {p.data.role}</div>
      <p>{p.data.summary}</p>
      <div class="tags">{p.data.tags.map((t) => <span>{t}</span>)}</div>
    </div>
  ))}

  <h2 class="section-title">Committees</h2>
  <ul>{roles.map((r) => <li>{r.data.body}{r.data.since && ` (since ${r.data.since})`}</li>)}</ul>

  <h2 class="section-title">Older tools and experiments</h2>
  <ul>
    {older.map((p) => (
      <li><a href={`/projects/${p.id}/`}>{p.data.title}</a> <span class="meta">({p.data.date.getFullYear()})</span></li>
    ))}
  </ul>
</Base>
```

- [ ] **Step 4: Publications page**

`src/pages/publications.astro`:
```astro
---
import { getCollection } from "astro:content";
import Base from "../layouts/Base.astro";
import { site } from "../data/site";
const pubs = (await getCollection("publications")).sort((a, b) => b.data.year - a.data.year);
const description = "Publications by Steffen Rörtgen on metadata standards and data spaces in educational infrastructures.";
---
<Base title={`Publications · ${site.name}`} description={description} path="/publications/" jsonLd={{ "@context": "https://schema.org", "@type": "ItemList", itemListElement: [] }}>
  <h2 class="section-title">Publications</h2>
  {pubs.map((p) => (
    <div class="entry">
      <h3><a href={p.data.url} target="_blank" rel="noopener">{p.data.title}</a></h3>
      <div class="meta">{p.data.authors.join(", ")}</div>
      <p>{p.data.venue}. {p.data.publisher}, {p.data.year}.{p.data.doi && <> DOI: <a href={`https://doi.org/${p.data.doi}`}>{p.data.doi}</a></>}{p.data.openAccess && <span class="badge">open access</span>}</p>
    </div>
  ))}
</Base>
```

- [ ] **Step 5: Build and verify**

Run: `npm run build`, then:
```bash
grep -c 'class="card"' dist/work/index.html      # expect 6
grep -c '/projects/' dist/work/index.html        # expect 11
grep -c 'doi.org' dist/publications/index.html   # expect 2 or more
```
Run: `npm test` → PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Add Work page with portfolio data and Publications page"
```

---

### Task 8: SEO head and JSON-LD builders applied to every page

**Files:**
- Create: `src/lib/jsonld.ts`, `public/og-default.png`, `public/robots.txt`
- Modify: `src/components/Head.astro` (full version), every page under `src/pages/` to use the builders
- Test: `tests/jsonld.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export function person(): object;                       // schema.org Person
  export function website(): object;                      // WebSite
  export function blogPosting(o: { title: string; path: string; datePublished: Date; dateModified?: Date; image?: string; sameAs?: string; description?: string }): object;
  export function scholarlyList(pubs: { title: string; authors: string[]; publisher: string; year: number; doi?: string; url: string }[]): object;
  export function workPage(projects: { title: string; summary: string; client: string; url?: string }[]): object;
  export function absolute(path: string): string;         // site.url + path
  ```

- [ ] **Step 1: Write the failing tests**

`tests/jsonld.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { person, website, blogPosting, scholarlyList, workPage, absolute } from "../src/lib/jsonld";
import { site } from "../src/data/site";

describe("absolute", () => {
  it("joins site url and path", () => {
    expect(absolute("/posts/x/")).toBe("https://steffen-roertgen.de/posts/x/");
  });
});

describe("person", () => {
  it("has name, url and sameAs including github and njump", () => {
    const p = person() as any;
    expect(p["@type"]).toBe("Person");
    expect(p.name).toBe(site.name);
    expect(p.sameAs).toContain(`https://github.com/${site.github}`);
    expect(p.sameAs).toContain(site.njumpProfile);
    expect(p.sameAs.some((s: string) => s.includes("orcid"))).toBe(Boolean(site.orcid));
  });
});

describe("website", () => {
  it("is a WebSite with author Person", () => {
    const w = website() as any;
    expect(w["@type"]).toBe("WebSite");
    expect(w.author["@type"]).toBe("Person");
  });
});

describe("blogPosting", () => {
  it("builds a BlogPosting with dates and optional sameAs and image", () => {
    const b = blogPosting({ title: "T", path: "/articles/x/", datePublished: new Date("2025-06-05T00:00:00Z"), image: "https://i/x.png", sameAs: "https://njump.me/naddr1x" }) as any;
    expect(b["@type"]).toBe("BlogPosting");
    expect(b.headline).toBe("T");
    expect(b.datePublished).toBe("2025-06-05");
    expect(b.mainEntityOfPage).toBe("https://steffen-roertgen.de/articles/x/");
    expect(b.image).toBe("https://i/x.png");
    expect(b.sameAs).toBe("https://njump.me/naddr1x");
    expect(b.author["@type"]).toBe("Person");
  });
  it("omits image and sameAs when absent", () => {
    const b = blogPosting({ title: "T", path: "/p/", datePublished: new Date(0) }) as any;
    expect("image" in b).toBe(false);
    expect("sameAs" in b).toBe(false);
  });
});

describe("scholarlyList", () => {
  it("wraps ScholarlyArticle items with DOI identifier when present", () => {
    const l = scholarlyList([
      { title: "A", authors: ["X Y", "Z W"], publisher: "P", year: 2023, doi: "10.1/abc", url: "https://doi.org/10.1/abc" },
      { title: "B", authors: ["X Y"], publisher: "P", year: 2020, url: "https://x/" },
    ]) as any;
    expect(l["@type"]).toBe("ItemList");
    const a = l.itemListElement[0].item;
    expect(a["@type"]).toBe("ScholarlyArticle");
    expect(a.identifier).toBe("https://doi.org/10.1/abc");
    expect(a.author).toHaveLength(2);
    expect(a.author[0]).toEqual({ "@type": "Person", name: "X Y" });
    expect("identifier" in l.itemListElement[1].item).toBe(false);
  });
});

describe("workPage", () => {
  it("returns Person with hasOccupation and an ItemList of CreativeWork", () => {
    const w = workPage([{ title: "P", summary: "S", client: "C", url: "https://p/" }]) as any;
    expect(Array.isArray(w)).toBe(true);
    expect(w[0]["@type"]).toBe("Person");
    expect(w[0].hasOccupation["@type"]).toBe("Occupation");
    const item = w[1].itemListElement[0].item;
    expect(item["@type"]).toBe("CreativeWork");
    expect(item.sourceOrganization).toEqual({ "@type": "Organization", name: "C" });
    expect(item.url).toBe("https://p/");
  });
});
```

Run: `npm test` → FAIL, module not found.

- [ ] **Step 2: Implement src/lib/jsonld.ts**

```ts
import { site } from "../data/site";

const CTX = "https://schema.org";

export function absolute(path: string): string {
  return new URL(path, site.url).toString();
}

export function person(): object {
  const sameAs = [`https://github.com/${site.github}`, site.njumpProfile];
  if (site.orcid) sameAs.push(`https://orcid.org/${site.orcid}`);
  return {
    "@context": CTX,
    "@type": "Person",
    name: site.name,
    url: site.url,
    email: `mailto:${site.email}`,
    jobTitle: "Metadata infrastructure developer and consultant",
    sameAs,
  };
}

function author() {
  const { "@context": _ctx, ...p } = person() as Record<string, unknown>;
  return p;
}

export function website(): object {
  return { "@context": CTX, "@type": "WebSite", name: site.title, url: site.url, author: author() };
}

const isoDate = (d: Date) => d.toISOString().slice(0, 10);

export function blogPosting(o: {
  title: string;
  path: string;
  datePublished: Date;
  dateModified?: Date;
  image?: string;
  sameAs?: string;
  description?: string;
}): object {
  const out: Record<string, unknown> = {
    "@context": CTX,
    "@type": "BlogPosting",
    headline: o.title,
    datePublished: isoDate(o.datePublished),
    dateModified: isoDate(o.dateModified ?? o.datePublished),
    mainEntityOfPage: absolute(o.path),
    author: author(),
    inLanguage: "en",
  };
  if (o.description) out.description = o.description;
  if (o.image) out.image = o.image;
  if (o.sameAs) out.sameAs = o.sameAs;
  return out;
}

export function scholarlyList(
  pubs: { title: string; authors: string[]; publisher: string; year: number; doi?: string; url: string }[],
): object {
  return {
    "@context": CTX,
    "@type": "ItemList",
    itemListElement: pubs.map((p, i) => {
      const item: Record<string, unknown> = {
        "@type": "ScholarlyArticle",
        headline: p.title,
        author: p.authors.map((name) => ({ "@type": "Person", name })),
        publisher: { "@type": "Organization", name: p.publisher },
        datePublished: String(p.year),
        url: p.url,
      };
      if (p.doi) item.identifier = `https://doi.org/${p.doi}`;
      return { "@type": "ListItem", position: i + 1, item };
    }),
  };
}

export function workPage(projects: { title: string; summary: string; client: string; url?: string }[]): object[] {
  const p = person() as Record<string, unknown>;
  p.hasOccupation = {
    "@type": "Occupation",
    name: "Freelance developer and consultant for educational metadata infrastructure",
  };
  return [
    p,
    {
      "@context": CTX,
      "@type": "ItemList",
      itemListElement: projects.map((pr, i) => {
        const item: Record<string, unknown> = {
          "@type": "CreativeWork",
          name: pr.title,
          description: pr.summary,
          author: author(),
          sourceOrganization: { "@type": "Organization", name: pr.client },
        };
        if (pr.url) item.url = pr.url;
        return { "@type": "ListItem", position: i + 1, item };
      }),
    },
  ];
}
```

Run: `npm test` → PASS.

- [ ] **Step 3: Full Head.astro**

Replace `src/components/Head.astro`:
```astro
---
import { site } from "../data/site";
interface Props {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  jsonLd: object | object[];
}
const { title, description, path, image, type = "website", jsonLd } = Astro.props;
const canonical = new URL(path, site.url).toString();
const ogImage = image ?? new URL("/og-default.png", site.url).toString();
const card = image ? "summary_large_image" : "summary";
---
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>{title}</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonical} />
<link rel="icon" href="/favicon.ico" />
<link rel="alternate" type="application/rss+xml" title={site.title} href="/rss.xml" />
<link rel="sitemap" href="/sitemap-index.xml" />
<link rel="stylesheet" href="/fonts/fonts.css" />
<meta property="og:site_name" content={site.title} />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:url" content={canonical} />
<meta property="og:type" content={type} />
<meta property="og:image" content={ogImage} />
<meta property="og:locale" content="en" />
<meta name="twitter:card" content={card} />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={ogImage} />
<script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />
```

- [ ] **Step 4: Default OG image and robots.txt**

Create `public/og-default.png` (1200×630) with ImageMagick if available, otherwise with a tiny Node script using no dependencies is not practical; use:
```bash
magick -size 1200x630 xc:white -gravity center -font "Playfair-Display-Bold" -pointsize 72 -fill "#1a1a1a" -annotate 0 "Hacking for Open Education" \
  -pointsize 36 -fill "#777" -annotate +0+120 "Steffen Rörtgen · steffen-roertgen.de" public/og-default.png
```
If `magick` is not installed, run `nix shell nixpkgs#imagemagick -c magick ...` with the same arguments. If the font name is not found, drop the `-font` argument; the default font is acceptable.

`public/robots.txt`:
```
User-agent: *
Allow: /
Sitemap: https://steffen-roertgen.de/sitemap-index.xml
```

- [ ] **Step 5: Use the builders in every page**

- `index.astro`: `jsonLd={[website(), person()]}`.
- `about.astro` (Task 9 creates it; use `jsonLd={[website(), person()]}` there).
- `posts/[id].astro`: `jsonLd={blogPosting({ title: post.data.title, path: \`/posts/${post.id}/\`, datePublished: post.data.date, description: excerptFrom(post.body ?? "") })}` (import `excerptFrom` from `../../lib/blog`), and `description={excerptFrom(post.body ?? "") || post.data.title}`.
- `articles/[id].astro`: `jsonLd={blogPosting({ title: article.data.title, path: \`/articles/${article.id}/\`, datePublished: new Date(article.data.publishedAt * 1000), dateModified: new Date(article.data.createdAt * 1000), image: article.data.image, sameAs: njump, description: article.data.summary || undefined })}`.
- `projects/[id].astro`: `jsonLd={blogPosting({ title: project.data.title, path: \`/projects/${project.id}/\`, datePublished: project.data.date })}`.
- `work.astro`: `jsonLd={workPage(projects.map((p) => ({ title: p.data.title, summary: p.data.summary, client: p.data.client, url: p.data.url })))}`.
- `publications.astro`: `jsonLd={scholarlyList(pubs.map((p) => p.data))}`.

- [ ] **Step 6: Build and verify**

Run: `npm run build`, then:
```bash
grep -c 'application/ld+json' dist/index.html dist/work/index.html dist/publications/index.html dist/articles/*/index.html | head
grep -o 'og:image" content="[^"]*"' dist/index.html
```
Expected: exactly `1` per file; og:image is `https://steffen-roertgen.de/og-default.png`. Paste the JSON-LD from one article page into https://validator.schema.org/ and confirm no errors.

Run: `npm test` → PASS.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Add full SEO head with Open Graph, Twitter card, and JSON-LD builders"
```

---

### Task 9: About page, RSS feed, sitemap check

**Files:**
- Create: `src/pages/about.astro`, `src/pages/rss.xml.ts`
- Keep: `src/assets/photo.png`, `src/assets/nostr_logo_blk.svg`; delete `src/assets/photo2.jpg` if unused (it is).

- [ ] **Step 1: About page**

`src/pages/about.astro`:
```astro
---
import { Image } from "astro:assets";
import Base from "../layouts/Base.astro";
import { site } from "../data/site";
import { website, person } from "../lib/jsonld";
import photo from "../assets/photo.png";
import nostrLogo from "../assets/nostr_logo_blk.svg?url";
const description = "Steffen Rörtgen: metadata and ontologies for open education, project lead for machine-readable curricula at FWU, freelance consultant, SkoHub maintainer, member of the BMBF OER advisory board.";
---
<Base title={`About · ${site.name}`} description={description} path="/about/" jsonLd={[website(), person()]}>
  <div class="center">
    <p><i>Hacking for Open Education, in love with metadata. Always learning.</i></p>
    <Image src={photo} alt="Steffen Rörtgen" class="portrait" width={400} />
    <h3>{site.name}</h3>
    <div class="social">
      <a href={`https://github.com/${site.github}`} target="_blank" rel="noopener" aria-label="GitHub">
        <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>
      </a>
      <a href={`mailto:${site.email}`} aria-label="Email">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
      </a>
      <a href={site.njumpProfile} target="_blank" rel="noopener" aria-label="Nostr profile">
        <img src={nostrLogo} alt="" />
      </a>
    </div>
  </div>
  <p>
    Hello there! I like open web technologies, metadata, classic philosophy and dogs. I studied Latin and
    philosophy in Göttingen and hold an M.Ed. During my studies I started working for the
    <a href="https://gwdg.de">GWDG</a>, where I moved into software development through the open education
    projects <a href="https://jointly.info">JOINTLY</a> and <a href="https://wirlernenonline.de">WirLernenOnline</a>
    and later served as product owner in the BIRD prototype of Germany's national education platform.
  </p>
  <p>
    At the <a href="https://hbz-nrw.de">hbz</a> I maintained <a href="https://skohub.io">SkoHub</a>, a set of
    services for publishing and using controlled vocabularies. Since 2024 I lead the
    <a href="https://w3id.org/lehrplan/ontology/">machine-readable curricula</a> project at FWU as a specialist for
    metadata and ontologies, and since 2022 I work freelance for the Stiftung Innovation in der Hochschullehre on
    a Nostr-based infrastructure for higher-education teaching.
  </p>
  <p>
    I co-lead the curricula group of DINI-AG-KIM and sit on the OER advisory board of the German Federal Ministry
    of Education and Research. Most of my work circles around one question: how do we make educational
    resources and curricula findable and editable with open web technologies, preferably RDF and open protocols?
    See <a href="/work/">Work</a> for what I can do for you.
  </p>
</Base>
```

Then `git rm src/assets/photo2.jpg`.

- [ ] **Step 2: RSS endpoint**

`src/pages/rss.xml.ts`:
```ts
import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { site } from "../data/site";
import { getBlog } from "../lib/content";

export async function GET(context: APIContext) {
  const { entries } = await getBlog();
  return rss({
    title: site.title,
    description: site.description,
    site: context.site!,
    items: entries.map((e) => ({
      title: e.title,
      pubDate: e.date,
      description: e.excerpt,
      link: e.href,
    })),
  });
}
```

- [ ] **Step 3: Build and verify**

Run: `npm run build`, then:
```bash
ls dist/about dist/rss.xml dist/sitemap-index.xml dist/sitemap-0.xml
grep -c "<item>" dist/rss.xml       # expect 16 (12 visible local posts + 4 articles)
grep -c "<loc>" dist/sitemap-0.xml  # expect 33 or more
grep -c "twitter.com" dist/about/index.html   # expect 0
```
Run: `npm test` → PASS.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Add About page, RSS feed, and verify sitemap output"
```

---

### Task 10: Build check script, deploy workflow, custom domain, cleanup

**Files:**
- Create: `scripts/check-build.mjs`, `.github/workflows/deploy.yml`, `public/CNAME`
- Modify: `README.md`
- Delete: `.jsbeautifyrc`, `.vscode/`, `TODOs.org`, `_drafts/` stays (unpublished drafts, harmless), anything else left from Gatsby (`git status` and `ls` must show no `gatsby-*`, `static/`, `posts/`, `projects/`, `src/templates`, `src/utils` at the top level)

- [ ] **Step 1: Write the check script**

`scripts/check-build.mjs`:
```js
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const dist = "dist";
const failures = [];
const fail = (m) => failures.push(m);

for (const f of ["index.html", "about/index.html", "work/index.html", "publications/index.html", "rss.xml", "sitemap-index.xml", "robots.txt", "CNAME", "og-default.png", "fonts/fonts.css"]) {
  if (!existsSync(join(dist, f))) fail(`missing ${f}`);
}
const countDirs = (p) => (existsSync(join(dist, p)) ? readdirSync(join(dist, p)).filter((d) => statSync(join(dist, p, d)).isDirectory()).length : 0);
if (countDirs("posts") < 12) fail(`expected at least 12 post pages, found ${countDirs("posts")}`);
if (countDirs("projects") !== 11) fail(`expected 11 project pages, found ${countDirs("projects")}`);
if (countDirs("articles") < 4) fail(`expected at least 4 article pages, found ${countDirs("articles")}`);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith(".html")) out.push(p);
  }
  return out;
}

for (const file of walk(dist)) {
  const html = readFileSync(file, "utf8");
  const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g) ?? [];
  if (ld.length !== 1) fail(`${file}: expected 1 JSON-LD block, found ${ld.length}`);
  else {
    try { JSON.parse(ld[0].replace(/^<script[^>]*>/, "").replace(/<\/script>$/, "")); }
    catch (e) { fail(`${file}: JSON-LD does not parse: ${e.message}`); }
  }
  for (const needle of ['property="og:title"', 'property="og:description"', 'property="og:url"', 'rel="canonical"']) {
    if (!html.includes(needle)) fail(`${file}: missing ${needle}`);
  }
}

if (failures.length) {
  console.error("Build check failed:\n" + failures.map((f) => "  - " + f).join("\n"));
  process.exit(1);
}
console.log("Build check passed.");
```

Run: `npm run build && npm run check:build`
Expected: `missing CNAME` only. (Next step adds it.)

- [ ] **Step 2: CNAME, workflow, README**

`public/CNAME`:
```
steffen-roertgen.de
```

`.github/workflows/deploy.yml`:
```yaml
name: Build and deploy

on:
  push:
    branches: [master]
  schedule:
    - cron: "0 4 * * *"
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build
      - run: npm run check:build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

`README.md`:
```markdown
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
```

- [ ] **Step 3: Cleanup**

```bash
git rm -q -r .jsbeautifyrc .vscode TODOs.org
ls   # must show: _drafts astro.config.mjs docs LICENSE package.json package-lock.json public README.md scripts src tests tsconfig.json vitest.config.ts (plus node_modules, dist, .astro untracked)
git status --short | grep -v '^??' | head
```
If any `gatsby-*`, `static/`, `posts/`, `projects/`, `src/templates`, or `src/utils` remain, remove them with `git rm -r`.

- [ ] **Step 4: Final verification**

```bash
npm test
npm run build
npm run check:build
```
Expected: all pass, `Build check passed.`

Run `npm run preview` and click through Blog, one post with images, one article, Work, Publications, About, and `/rss.xml`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Add build checks, GitHub Pages workflow, custom domain, and remove Gatsby leftovers"
```

---

## After the plan

Not part of the code work, done by the site owner:

1. Push `master`. In GitHub repository settings, set Pages source to "GitHub Actions" and enter the custom domain.
2. Change DNS at the registrar as listed in the README.
3. After the first successful deploy, run one article page through https://search.google.com/test/rich-results.
