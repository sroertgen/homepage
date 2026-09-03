import { describe, it, expect } from "vitest";
import { person, website, blogPosting, scholarlyList, workPage, absolute, jsonLdScript } from "../src/lib/jsonld";
import { site } from "../src/data/site";

describe("absolute", () => {
  it("joins site url and path", () => {
    expect(absolute("/posts/x/")).toBe("https://steffen-roertgen.de/posts/x/");
  });
});

describe("person", () => {
  it("has name, url and sameAs including github and njump", () => {
    const p = person() as any;
    expect(p["@type"]).toBe("Person");
    expect(p.name).toBe(site.name);
    expect(p.sameAs).toContain(`https://github.com/${site.github}`);
    expect(p.sameAs).toContain(site.njumpProfile);
    expect(p.sameAs.some((s: string) => s.includes("orcid"))).toBe(Boolean(site.orcid));
  });
});

describe("website", () => {
  it("is a WebSite with author Person", () => {
    const w = website() as any;
    expect(w["@type"]).toBe("WebSite");
    expect(w.author["@type"]).toBe("Person");
  });
});

describe("blogPosting", () => {
  it("builds a BlogPosting with dates and optional sameAs and image", () => {
    const b = blogPosting({ title: "T", path: "/articles/x/", datePublished: new Date("2025-06-05T00:00:00Z"), image: "https://i/x.png", sameAs: "https://njump.me/naddr1x" }) as any;
    expect(b["@type"]).toBe("BlogPosting");
    expect(b.headline).toBe("T");
    expect(b.datePublished).toBe("2025-06-05");
    expect(b.mainEntityOfPage).toBe("https://steffen-roertgen.de/articles/x/");
    expect(b.image).toBe("https://i/x.png");
    expect(b.sameAs).toBe("https://njump.me/naddr1x");
    expect(b.author["@type"]).toBe("Person");
  });
  it("omits image and sameAs when absent", () => {
    const b = blogPosting({ title: "T", path: "/p/", datePublished: new Date(0) }) as any;
    expect("image" in b).toBe(false);
    expect("sameAs" in b).toBe(false);
  });
});

describe("scholarlyList", () => {
  it("wraps ScholarlyArticle items with DOI identifier when present", () => {
    const l = scholarlyList([
      { title: "A", authors: ["X Y", "Z W"], publisher: "P", year: 2023, doi: "10.1/abc", url: "https://doi.org/10.1/abc" },
      { title: "B", authors: ["X Y"], publisher: "P", year: 2020, url: "https://x/" },
    ]) as any;
    expect(l["@type"]).toBe("ItemList");
    const a = l.itemListElement[0].item;
    expect(a["@type"]).toBe("ScholarlyArticle");
    expect(a.identifier).toBe("https://doi.org/10.1/abc");
    expect(a.author).toHaveLength(2);
    expect(a.author[0]).toEqual({ "@type": "Person", name: "X Y" });
    expect("identifier" in l.itemListElement[1].item).toBe(false);
  });
});

describe("workPage", () => {
  it("returns Person with hasOccupation and an ItemList of CreativeWork", () => {
    const w = workPage([{ title: "P", summary: "S", client: "C", url: "https://p/" }]) as any;
    expect(Array.isArray(w)).toBe(true);
    expect(w[0]["@type"]).toBe("Person");
    expect(w[0].hasOccupation["@type"]).toBe("Occupation");
    const item = w[1].itemListElement[0].item;
    expect(item["@type"]).toBe("CreativeWork");
    expect(item.sourceOrganization).toEqual({ "@type": "Organization", name: "C" });
    expect(item.url).toBe("https://p/");
  });
});

describe("jsonLdScript", () => {
  it("escapes < so a </script> payload cannot break out, and round-trips via JSON.parse", () => {
    const value = { a: "</script><b>" };
    const out = jsonLdScript(value);
    expect(out.includes("<")).toBe(false);
    expect(JSON.parse(out)).toEqual(value);
  });
});
