import { useEffect, useState } from "react";
import { RelayPool } from "applesauce-relay";
import { fetchArticles, filterNewArticles, type NostrArticle } from "../lib/nostr";
import { formatDate } from "../lib/dates";

type Props = { pubkey: string; relays: string[]; since: number; knownDTags: string[] };

export default function LiveArticles({ pubkey, relays, since, knownDTags }: Props) {
  const [fresh, setFresh] = useState<NostrArticle[]>([]);

  useEffect(() => {
    let cancelled = false;
    const pool = new RelayPool();
    fetchArticles((r, f) => pool.request(r, f), { relays, pubkey, since, timeoutMs: 10000 })
      .then((articles) => {
        if (!cancelled) setFresh(filterNewArticles(articles, knownDTags));
      })
      .catch(() => {})
      .finally(() => pool.close());
    return () => {
      cancelled = true;
      pool.close();
    };
  }, [pubkey, since, relays, knownDTags]);

  if (fresh.length === 0) return null;

  return (
    <>
      {fresh.map((a) => (
        <div className="entry" key={a.dTag}>
          <h3>
            <a href={`https://njump.me/${a.naddr}`} target="_blank" rel="noopener">{a.title}</a>
            <span className="badge new">new on Nostr</span>
          </h3>
          <div className="meta">
            {formatDate(new Date(a.publishedAt * 1000))}
          </div>
          {a.summary && <p>{a.summary}</p>}
        </div>
      ))}
    </>
  );
}
