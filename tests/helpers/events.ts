import { generateSecretKey, getPublicKey, finalizeEvent } from "nostr-tools/pure";
import type { NostrEvent } from "applesauce-core/helpers";

/** Fixed test key so tests are deterministic; pass `.pubkey` as opts.pubkey. */
export const TEST_SECRET_KEY = generateSecretKey();
export const TEST_PUBKEY = getPublicKey(TEST_SECRET_KEY);

/** Sign an arbitrary event template with a (fixed by default) test key. */
export function signedEvent(
  template: { kind: number; created_at?: number; content?: string; tags?: string[][] },
  secretKey: Uint8Array = TEST_SECRET_KEY,
): NostrEvent {
  return finalizeEvent(
    {
      kind: template.kind,
      created_at: template.created_at ?? 1000,
      content: template.content ?? "body",
      tags: template.tags ?? [],
    },
    secretKey,
  ) as NostrEvent;
}

/** Build and sign a kind-30023 article event with a fixed test key. */
export function signedArticle(over: {
  d: string;
  title?: string;
  published?: number;
  created_at?: number;
  content?: string;
  tags?: string[][];
  secretKey?: Uint8Array;
}): NostrEvent {
  const { d, title = "T", published, created_at = 1000, content = "body", tags = [], secretKey } = over;
  const eventTags: string[][] = [["d", d], ["title", title]];
  if (published) eventTags.push(["published_at", String(published)]);
  return signedEvent({ kind: 30023, created_at, content, tags: [...eventTags, ...tags] }, secretKey);
}
