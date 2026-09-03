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
