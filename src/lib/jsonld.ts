import { site } from "../data/site";

const CTX = "https://schema.org";

export function absolute(path: string): string {
  return new URL(path, site.url).toString();
}

export function person(): object {
  const sameAs = [`https://github.com/${site.github}`, site.njumpProfile];
  if (site.orcid) sameAs.push(`https://orcid.org/${site.orcid}`);
  return {
    "@context": CTX,
    "@type": "Person",
    name: site.name,
    url: site.url,
    email: `mailto:${site.email}`,
    jobTitle: "Metadata infrastructure developer and consultant",
    sameAs,
  };
}

function author() {
  const { "@context": _ctx, ...p } = person() as Record<string, unknown>;
  return p;
}

export function website(): object {
  return { "@context": CTX, "@type": "WebSite", name: site.title, url: site.url, author: author() };
}

const isoDate = (d: Date) => d.toISOString().slice(0, 10);

export function blogPosting(o: {
  title: string;
  path: string;
  datePublished: Date;
  dateModified?: Date;
  image?: string;
  sameAs?: string;
  description?: string;
}): object {
  const out: Record<string, unknown> = {
    "@context": CTX,
    "@type": "BlogPosting",
    headline: o.title,
    datePublished: isoDate(o.datePublished),
    dateModified: isoDate(o.dateModified ?? o.datePublished),
    mainEntityOfPage: absolute(o.path),
    author: author(),
    inLanguage: "en",
  };
  if (o.description) out.description = o.description;
  if (o.image) out.image = o.image;
  if (o.sameAs) out.sameAs = o.sameAs;
  return out;
}

export function scholarlyList(
  pubs: { title: string; authors: string[]; publisher: string; year: number; doi?: string; url: string }[],
): object {
  return {
    "@context": CTX,
    "@type": "ItemList",
    itemListElement: pubs.map((p, i) => {
      const item: Record<string, unknown> = {
        "@type": "ScholarlyArticle",
        headline: p.title,
        author: p.authors.map((name) => ({ "@type": "Person", name })),
        publisher: { "@type": "Organization", name: p.publisher },
        datePublished: String(p.year),
        url: p.url,
      };
      if (p.doi) item.identifier = `https://doi.org/${p.doi}`;
      return { "@type": "ListItem", position: i + 1, item };
    }),
  };
}

export function workPage(projects: { title: string; summary: string; client: string; url?: string }[]): object[] {
  const p = person() as Record<string, unknown>;
  p.hasOccupation = {
    "@type": "Occupation",
    name: "Freelance developer and consultant for educational metadata infrastructure",
  };
  return [
    p,
    {
      "@context": CTX,
      "@type": "ItemList",
      itemListElement: projects.map((pr, i) => {
        const item: Record<string, unknown> = {
          "@type": "CreativeWork",
          name: pr.title,
          description: pr.summary,
          author: author(),
          sourceOrganization: { "@type": "Organization", name: pr.client },
        };
        if (pr.url) item.url = pr.url;
        return { "@type": "ListItem", position: i + 1, item };
      }),
    },
  ];
}
