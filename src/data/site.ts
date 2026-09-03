export const site = {
  name: "Steffen Rörtgen",
  title: "Hacking for Open Education",
  url: "https://steffen-roertgen.de",
  description:
    "Steffen Rörtgen builds metadata infrastructure for open education: linked data, SKOS vocabularies, and Nostr-based systems. Blog, work, and publications.",
  npub: "npub1r30l8j4vmppvq8w23umcyvd3vct4zmfpfkn4c7h2h057rmlfcrmq9xt9ma",
  pubkey: "1c5ff3caacd842c01dca8f378231b16617516d214da75c7aeabbe9e1efe9c0f6",
  relays: [
    "wss://relay.damus.io",
    "wss://nos.lol",
    "wss://relay.nostr.band",
    "wss://relay.primal.net",
    "wss://relay.edufeed.org",
  ],
  github: "sroertgen",
  email: "kontakt@steffen-roertgen.de",
  orcid: "",
  njumpProfile:
    "https://njump.me/npub1r30l8j4vmppvq8w23umcyvd3vct4zmfpfkn4c7h2h057rmlfcrmq9xt9ma",
} as const;

export type Site = typeof site;
