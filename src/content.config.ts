import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { generateContentId } from "./lib/ids";
import { nostrArticlesLoader } from "./loaders/nostr-articles";
import { site } from "./data/site";

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

const articles = defineCollection({
  loader: nostrArticlesLoader({ pubkey: site.pubkey, relays: [...site.relays] }),
});

export const collections = { posts, projects, articles };
