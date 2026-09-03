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
    .replace(/[\p{P}\p{S}\p{M}\p{Cf}\p{Extended_Pictographic}]/gu, " ")
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
  // Only backtrack if we're cutting through a word (next char is not a space)
  if (plain[maxLength] && plain[maxLength] !== " ") {
    const lastSpace = cut.lastIndexOf(" ");
    return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + "…";
  }
  // We're at a word boundary, trim and add ellipsis
  return cut.trim() + "…";
}

export function mergeBlog(
  posts: LocalPostInput[],
  articles: NostrArticleInput[],
): { entries: BlogEntry[]; hiddenPostIds: string[] } {
  // Build set of article titles, excluding empty strings
  const articleTitles = new Set(
    articles
      .map((a) => normalizeTitle(a.title))
      .filter((title) => title.length > 0)
  );
  // Only hide posts whose normalized title is non-empty and matches an article
  const hiddenPostIds = posts
    .filter((p) => {
      const normalized = normalizeTitle(p.title);
      return normalized.length > 0 && articleTitles.has(normalized);
    })
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
