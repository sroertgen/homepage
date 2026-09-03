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
