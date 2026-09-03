import { readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import { legacySlugFor } from "./src/lib/legacy.ts";

// The sitemap should not list the legacy Gatsby-URL redirect stubs (see
// src/pages/[legacy].astro). This config file cannot import astro:content,
// so the slug set is derived straight from the filesystem using the same
// pure function the stub page uses.
function legacySlugsIn(dir) {
  const slugs = new Set();
  for (const name of readdirSync(dir)) {
    if (name.startsWith("_")) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) slugs.add(name);
    else if (name.endsWith(".md") || name.endsWith(".mdx")) slugs.add(legacySlugFor(name));
  }
  return slugs;
}

const contentDir = fileURLToPath(new URL("./src/content/", import.meta.url));
const LEGACY_SLUGS = new Set([
  ...legacySlugsIn(join(contentDir, "posts")),
  ...legacySlugsIn(join(contentDir, "projects")),
]);

export default defineConfig({
  site: "https://steffen-roertgen.de",
  trailingSlash: "always",
  integrations: [
    react(),
    sitemap({
      filter: (page) => {
        const first = new URL(page).pathname.split("/").filter(Boolean)[0];
        return !first || !LEGACY_SLUGS.has(first);
      },
    }),
  ],
  markdown: {
    shikiConfig: { theme: "solarized-light" },
  },
});
