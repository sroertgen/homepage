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
