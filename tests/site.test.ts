import { describe, it, expect } from "vitest";
import { normalizeToPubkey } from "applesauce-core/helpers";
import { site } from "../src/data/site";

describe("site config", () => {
  it("pubkey matches the npub", () => {
    expect(normalizeToPubkey(site.npub)).toBe(site.pubkey);
  });
  it("has five relays, all wss", () => {
    expect(site.relays).toHaveLength(5);
    for (const r of site.relays) expect(r.startsWith("wss://")).toBe(true);
  });
  it("site url has no trailing slash", () => {
    expect(site.url).toBe("https://steffen-roertgen.de");
  });
});
