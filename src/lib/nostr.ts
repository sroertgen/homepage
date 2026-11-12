import type { NostrEvent, Filter } from "applesauce-core/helpers";
import { getAddressPointerForEvent, getTagValue, naddrEncode, verifyEvent } from "applesauce-core/helpers";
import { getArticleImage, getArticlePublished, getArticleSummary, getArticleTitle } from "applesauce-common/helpers";
import { lastValueFrom, timeout, catchError, of, toArray, type Observable } from "rxjs";

export const ARTICLE_KIND = 30023;

export type NostrArticle = {
  dTag: string;
  title: string;
  summary: string;
  image?: string;
  publishedAt: number;
  createdAt: number;
  eventId: string;
  naddr: string;
  content: string;
};

export type RequestFn = (relays: string[], filters: Filter | Filter[]) => Observable<NostrEvent>;

export function newestPerDTag(events: NostrEvent[]): NostrEvent[] {
  const byD = new Map<string, NostrEvent>();
  for (const e of events) {
    const d = getTagValue(e, "d");
    if (d === undefined) continue;
    const cur = byD.get(d);
    if (!cur || e.created_at > cur.created_at || (e.created_at === cur.created_at && e.id < cur.id)) {
      byD.set(d, e);
    }
  }
  return [...byD.values()];
}

export function articleFromEvent(event: NostrEvent): NostrArticle {
  const dTag = getTagValue(event, "d") ?? "";
  const pointer = getAddressPointerForEvent(event) ?? {
    identifier: dTag,
    pubkey: event.pubkey,
    kind: event.kind,
  };
  return {
    dTag,
    title: getArticleTitle(event) ?? dTag,
    summary: getArticleSummary(event) ?? "",
    image: getArticleImage(event) || undefined,
    publishedAt: getArticlePublished(event) || event.created_at,
    createdAt: event.created_at,
    eventId: event.id,
    naddr: naddrEncode(pointer),
    content: event.content,
  };
}

export const DELETION_KIND = 5;

/** The author's articles plus their deletion requests (NIP-09), in one REQ. */
export function articleFilter(pubkey: string, since?: number): Filter[] {
  const f: Filter = { kinds: [ARTICLE_KIND], authors: [pubkey] };
  if (since !== undefined) f.since = since;
  return [f, { kinds: [DELETION_KIND], authors: [pubkey] }];
}

/**
 * NIP-09: drop articles the author asked to delete, by event id (`e`) or by
 * coordinate (`a`). A coordinate deletion covers only versions created up to
 * the request's timestamp, so a later republish of the same d tag stays.
 */
export function applyDeletions(articles: NostrEvent[], deletions: NostrEvent[]): NostrEvent[] {
  const ids = new Set<string>();
  const coords = new Map<string, number>();
  for (const d of deletions) {
    for (const [name, value] of d.tags) {
      if (name === "e") ids.add(value);
      if (name === "a") coords.set(value, Math.max(coords.get(value) ?? 0, d.created_at));
    }
  }
  return articles.filter((a) => {
    if (ids.has(a.id)) return false;
    const at = coords.get(`${a.kind}:${a.pubkey}:${getTagValue(a, "d") ?? ""}`);
    return at === undefined || a.created_at > at;
  });
}

export async function fetchArticles(
  request: RequestFn,
  opts: { relays: string[]; pubkey: string; since?: number; timeoutMs?: number },
): Promise<NostrArticle[]> {
  const ms = opts.timeoutMs ?? 15000;
  const events = await lastValueFrom(
    request(opts.relays, articleFilter(opts.pubkey, opts.since)).pipe(
      timeout({ first: ms, each: ms }),
      catchError(() => of()),
      toArray(),
    ),
    { defaultValue: [] as NostrEvent[] },
  );
  const own = events.filter((e) => e.pubkey === opts.pubkey && verifyEvent(e));
  const verified = applyDeletions(
    own.filter((e) => e.kind === ARTICLE_KIND),
    own.filter((e) => e.kind === DELETION_KIND),
  );
  return newestPerDTag(verified)
    .map(articleFromEvent)
    .sort((a, b) => b.publishedAt - a.publishedAt || b.createdAt - a.createdAt);
}

export function filterNewArticles(articles: NostrArticle[], knownDTags: string[]): NostrArticle[] {
  const known = new Set(knownDTags);
  return articles.filter((a) => !known.has(a.dTag));
}
