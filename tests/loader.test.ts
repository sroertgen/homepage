import { describe, it, expect, vi } from "vitest";
import { of, throwError } from "rxjs";
import { nostrArticlesLoader } from "../src/loaders/nostr-articles";
import { TEST_PUBKEY, signedArticle } from "./helpers/events";

const PUBKEY = TEST_PUBKEY;
const ev = (d: string, created_at: number, content: string) =>
  signedArticle({ d, created_at, content, title: "T " + d });

function fakeContext() {
  const set = new Map<string, any>();
  return {
    store: { clear: () => set.clear(), set: (e: any) => set.set(e.id, e), entries: () => [...set.entries()] },
    parseData: async ({ data }: any) => data,
    renderMarkdown: async (md: string) => ({ html: `<p>${md}</p>` }),
    logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
    set,
  } as any;
}

describe("nostrArticlesLoader", () => {
  it("stores the newest version per d tag with rendered html", async () => {
    const request = () => of(ev("a", 1, "old"), ev("a", 2, "new"), ev("b", 3, "b"));
    const loader = nostrArticlesLoader({ pubkey: PUBKEY, relays: ["wss://x"], request });
    const ctx = fakeContext();
    await loader.load(ctx);
    expect([...ctx.set.keys()].sort()).toEqual(["a", "b"]);
    expect(ctx.set.get("a").body).toBe("new");
    expect(ctx.set.get("a").rendered.html).toBe("<p>new</p>");
    expect(ctx.set.get("a").data.naddr.startsWith("naddr1")).toBe(true);
  });

  it("throws when no article was received at all", async () => {
    const request = () => throwError(() => new Error("all relays down"));
    const loader = nostrArticlesLoader({ pubkey: PUBKEY, relays: ["wss://x"], request });
    await expect(loader.load(fakeContext())).rejects.toThrow(/no articles/i);
  });

  it("leaves the store untouched when a later article fails to render", async () => {
    // "a" has an earlier created_at/publishedAt than "b", so fetchArticles (sorted newest first)
    // yields b first, then a — making "a" the second article rendered.
    const request = () => of(ev("a", 1, "one"), ev("b", 2, "two"));
    const loader = nostrArticlesLoader({ pubkey: PUBKEY, relays: ["wss://x"], request });
    const ctx = fakeContext();
    ctx.set.set("pre-existing", { id: "pre-existing" });

    let calls = 0;
    ctx.renderMarkdown = async (md: string) => {
      calls++;
      if (calls === 2) throw new Error("boom");
      return { html: `<p>${md}</p>` };
    };

    await expect(loader.load(ctx)).rejects.toThrow(/"a"/);
    expect([...ctx.set.keys()]).toEqual(["pre-existing"]);
  });
});
