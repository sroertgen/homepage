import { describe, it, expect } from "vitest";
import { normalizeTitle, excerptFrom, mergeBlog } from "../src/lib/blog";

describe("normalizeTitle", () => {
  it("lowercases, strips punctuation and emoji, collapses whitespace", () => {
    expect(normalizeTitle("Nostr ♥️ RDF - Bringing Linked Data to the Nostr World"))
      .toBe("nostr rdf bringing linked data to the nostr world");
    expect(normalizeTitle("  Blog   run! ")).toBe("blog run");
  });
  it("strips variation selectors, zero-width joiners, and combining marks", () => {
    expect(normalizeTitle("Flags 🇩🇪 and 👍🏽 here")).toBe("flags and here");
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

  it("does not hide posts when titles normalize to empty strings", () => {
    const postsWithPunctuation = [
      { id: "exclamation", title: "!!!", date: new Date("2023-01-01"), body: "Test" },
    ];
    const articlesWithEmoji = [
      { dTag: "emoji", title: "🎉🎉🎉", publishedAt: 1672617600, summary: "", content: "Content", naddr: "naddr1xyz" },
    ];
    const { entries, hiddenPostIds } = mergeBlog(postsWithPunctuation, articlesWithEmoji);
    expect(hiddenPostIds).toEqual([]);
    expect(entries.map((e) => e.id)).toEqual(["emoji", "exclamation"]);
  });
});
