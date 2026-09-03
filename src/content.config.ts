import { defineCollection } from "astro:content";
import { file, glob } from "astro/loaders";
import { z } from "astro/zod";
import * as yaml from "js-yaml";
import { generateContentId } from "./lib/ids";
import { nostrArticlesLoader } from "./loaders/nostr-articles";
import { site } from "./data/site";

function parseYamlKey(text: string, key: string) {
  const doc = yaml.load(text) as Record<string, unknown[]>;
  return doc[key];
}

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

export const collections = { posts, projects, articles, portfolio, roles, publications };
