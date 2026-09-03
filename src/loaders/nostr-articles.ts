import type { Loader } from "astro/loaders";
import { z } from "astro/zod";
import { RelayPool } from "applesauce-relay";
import { fetchArticles, type RequestFn } from "../lib/nostr";

export const articleSchema = z.object({
  dTag: z.string(),
  title: z.string(),
  summary: z.string(),
  image: z.string().optional(),
  publishedAt: z.number(),
  createdAt: z.number(),
  eventId: z.string(),
  naddr: z.string(),
});

export function nostrArticlesLoader(opts: {
  pubkey: string;
  relays: string[];
  request?: RequestFn;
  timeoutMs?: number;
}): Loader {
  return {
    name: "nostr-articles",
    schema: articleSchema,
    async load({ store, parseData, renderMarkdown, logger }) {
      let pool: RelayPool | undefined;
      const request: RequestFn =
        opts.request ??
        ((relays, filters) => {
          pool = pool ?? new RelayPool();
          return pool.request(relays, filters);
        });

      logger.info(`Fetching kind 30023 for ${opts.pubkey.slice(0, 8)} from ${opts.relays.length} relays`);
      let articles;
      try {
        articles = await fetchArticles(request, {
          relays: opts.relays,
          pubkey: opts.pubkey,
          timeoutMs: opts.timeoutMs,
        });
      } finally {
        pool?.close?.();
      }

      if (articles.length === 0) {
        throw new Error("nostr-articles loader: no articles received from any relay. Refusing to build without them.");
      }

      const entries: { id: string; data: unknown; body: string; rendered: unknown }[] = [];
      for (const a of articles) {
        const { content, ...rest } = a;
        const data = await parseData({ id: a.dTag, data: rest });
        let rendered;
        try {
          rendered = await renderMarkdown(content);
        } catch (err) {
          throw new Error(`nostr-articles loader: failed to render markdown for d-tag "${a.dTag}": ${(err as Error).message}`);
        }
        entries.push({ id: a.dTag, data, body: content, rendered });
      }

      store.clear();
      for (const entry of entries) {
        store.set(entry);
      }
      logger.info(`Stored ${articles.length} articles`);
    },
  };
}
