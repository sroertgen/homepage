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
