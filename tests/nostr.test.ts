import { describe, it, expect } from "vitest";
import { of, throwError, concat, NEVER } from "rxjs";
import { generateSecretKey } from "nostr-tools/pure";
import type { NostrEvent } from "applesauce-core/helpers";
import { newestPerDTag, articleFromEvent, articleFilter, fetchArticles, filterNewArticles } from "../src/lib/nostr";
import { TEST_PUBKEY, signedArticle, signedEvent } from "./helpers/events";

const PUBKEY = TEST_PUBKEY;

describe("newestPerDTag", () => {
  it("keeps the newest created_at per d tag", () => {
    const old = signedArticle({ d: "x", created_at: 10, content: "old" });
    const newer = signedArticle({ d: "x", created_at: 20, content: "newer" });
    const other = signedArticle({ d: "y", created_at: 5, content: "other" });
    const out = newestPerDTag([old, other, newer]);
    expect(out.map((e) => e.id)).toEqual([newer.id, other.id]);
  });
  it("breaks ties by lower id", () => {
    const a = signedArticle({ d: "x", created_at: 10, content: "A" });
    const b = signedArticle({ d: "x", created_at: 10, content: "B" });
    const expected = a.id < b.id ? a : b;
    expect(newestPerDTag([a, b])[0].id).toBe(expected.id);
  });
  it("drops events without a d tag", () => {
    const noD = signedEvent({ kind: 30023, tags: [["title", "T"]] });
    expect(newestPerDTag([noD])).toEqual([]);
  });
});

describe("articleFromEvent", () => {
  it("reads title, summary, image, published_at and encodes naddr", () => {
    const e = signedArticle({
      d: "open",
      title: "Open",
      published: 1749024507,
      created_at: 1749100000,
      tags: [["summary", "S"], ["image", "https://i/x.png"]],
    });
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
    const a = articleFromEvent(signedArticle({ d: "x", created_at: 42 }));
    expect(a.publishedAt).toBe(42);
    expect(a.summary).toBe("");
    expect(a.image).toBeUndefined();
  });
  it("computes the expected naddr for a known pubkey and d-tag (golden value)", () => {
    // node -e 'const {nip19}=require("nostr-tools"); console.log(nip19.naddrEncode({kind:30023,pubkey:"1c5ff3caacd842c01dca8f378231b16617516d214da75c7aeabbe9e1efe9c0f6",identifier:"open"}))'
    const EXPECTED_NADDR = "naddr1qvzqqqr4gupzq8zl7092ekzzcqwu4rehsgcmzesh29kjznd8t3aw4wlfu8h7ns8kqqzx7ur9dcsy2wa0";
    const event = {
      id: "0".repeat(64),
      pubkey: "1c5ff3caacd842c01dca8f378231b16617516d214da75c7aeabbe9e1efe9c0f6",
      kind: 30023,
      created_at: 1000,
      content: "body",
      tags: [["d", "open"], ["title", "T"]],
      sig: "",
    } as NostrEvent;
    expect(articleFromEvent(event).naddr).toBe(EXPECTED_NADDR);
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
    const e1 = signedArticle({ d: "a", created_at: 1, published: 100 });
    const e2 = signedArticle({ d: "a", created_at: 2, published: 100, content: "v2" });
    const e3 = signedArticle({ d: "b", created_at: 3, published: 300 });
    const request = () => of(e1, e3, e2);
    const out = await fetchArticles(request, { relays: ["wss://x"], pubkey: PUBKEY });
    expect(out.map((a) => a.dTag)).toEqual(["b", "a"]);
    expect(out[1].content).toBe("v2");
  });
  it("returns what arrived before an error", async () => {
    const e = signedArticle({ d: "a" });
    const request = () => concat(of(e), throwError(() => new Error("boom")));
    const out = await fetchArticles(request, { relays: ["wss://x"], pubkey: PUBKEY });
    expect(out).toHaveLength(1);
  });
  it("returns empty when the stream errors immediately", async () => {
    const request = () => throwError(() => new Error("boom"));
    expect(await fetchArticles(request, { relays: ["wss://x"], pubkey: PUBKEY })).toEqual([]);
  });
  it("gives up after timeoutMs", async () => {
    const e = signedArticle({ d: "a" });
    const request = () => concat(of(e), NEVER);
    const out = await fetchArticles(request, { relays: ["wss://x"], pubkey: PUBKEY, timeoutMs: 50 });
    expect(out).toHaveLength(1);
  });
  it("drops an event signed by a different key than opts.pubkey", async () => {
    const other = generateSecretKey();
    const e = signedArticle({ d: "a", secretKey: other });
    const request = () => of(e);
    const out = await fetchArticles(request, { relays: ["wss://x"], pubkey: PUBKEY });
    expect(out).toHaveLength(0);
  });
  it("drops an event whose content was tampered with after signing", async () => {
    const e = signedArticle({ d: "a" });
    const tampered = { ...e, content: "hacked" } as NostrEvent;
    const request = () => of(tampered);
    const out = await fetchArticles(request, { relays: ["wss://x"], pubkey: PUBKEY });
    expect(out).toHaveLength(0);
  });
  it("drops an event of the wrong kind", async () => {
    const e = signedEvent({ kind: 1, tags: [["d", "a"], ["title", "T"]] });
    const request = () => of(e);
    const out = await fetchArticles(request, { relays: ["wss://x"], pubkey: PUBKEY });
    expect(out).toHaveLength(0);
  });
});

describe("filterNewArticles", () => {
  it("drops articles whose d tag is already known", () => {
    const a = articleFromEvent(signedArticle({ d: "a" }));
    const b = articleFromEvent(signedArticle({ d: "b" }));
    expect(filterNewArticles([a, b], ["a"]).map((x) => x.dTag)).toEqual(["b"]);
  });
});
