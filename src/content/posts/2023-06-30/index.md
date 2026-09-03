---
title: Nostr ♥️ RDF - Bringing Linked Data to the Nostr World
date: "2023-06-30"
---

I want to propose a way on how to standardize metadata sent along with the tags attribute.
For this I suggest the use of Linked Data technology to make it easy for developers and applications to use data from different sources.

Nostr is great.
It is very easy to work with as a developer, has tons of use cases, is permissionless and censorship resistant.
You can build lots of applications with it without having to be afraid to lock your users in (or to get locked in if you are the user).
I mean in theory, because with applications getting more complex and more data is sent along, different applications will have to handle that same data sent by other clients.
But what do I even mean?
Let's look at a typical Nostr Event I used when working on the first round of the [Hack-Nostr-On](https://dorahacks.io/hackathon/hack-nostr-on) hackathon:

```json
["EVENT","RAND",{"id":"5b456114558503ebe99c588c915251006d35e8ad23dc3b0d4407f828eb596a82","kind":1,"pubkey":"8af30833be407219d6a2d2a6a84d2cea7d3c212693090fcc2b110ca944c3a617","created_at":1687806335,"content":"Hello! A new resource with title \"Bitcoin werden nicht geschürft, sondern im Laufe der Zeit verteilt - Einundzwanzig Portal\" got added to the library!\n    https://portal.einundzwanzig.space/storage/1164/conversions/3100ea413cc63910d5238b31f817d244-seo.jpg\nVon allen Missverständnissen im Zusammenhang mit Bitcoin ist das Missverständnis, dass Miner Bitcoin erzeugen, wahrscheinlich das dümmste.\n\nNein, Miner erzeugen keine Bitcoin. Miner versuchen, gültige Blöcke zu erzeugen und werden vom Bitcoin-Netzwerk mit neu ausgegebenen Sats belohnt, wenn sie erfolgreich sind. Diese Belohnung wird nur während der Initialisierung-Phase des Netzwerks gezahlt..\nSent from nostr:npub1j8wdpuqqct23l4gyyxa5dkjvgkxzkjh3n3mzzjj79uhcvh424pcqurytqu (Bitcoin Library).\n    ","tags":[["p","8af30833be407219d6a2d2a6a84d2cea7d3c212693090fcc2b110ca944c3a617"],["metadata","{\"id\":\"https://portal.einundzwanzig.space/library-item/bitcoin-werden-nicht-geschuerft-sondern-im-laufe-der-zeit-verteilt\",\"name\":\"Bitcoin werden nicht geschürft, sondern im Laufe der Zeit verteilt - Einundzwanzig Portal\",\"description\":\"Von allen Missverständnissen im Zusammenhang mit Bitcoin ist das Missverständnis, dass Miner Bitcoin erzeugen, wahrscheinlich das dümmste.\\n\\nNein, Miner erzeugen keine Bitcoin. Miner versuchen, gültige Blöcke zu erzeugen und werden vom Bitcoin-Netzwerk mit neu ausgegebenen Sats belohnt, wenn sie erfolgreich sind. Diese Belohnung wird nur während der Initialisierung-Phase des Netzwerks gezahlt.\",\"image\":\"https://portal.einundzwanzig.space/storage/1164/conversions/3100ea413cc63910d5238b31f817d244-seo.jpg\",\"resourceType\":[{\"id\":0,\"checked\":true,\"title\":\"Article\",\"uri\":\"https://w3id.org/bitcoin-library/bots/f631971e-ee83-4c95-9fcf-b1c1639bb4f6\"}],\"keywords\":[{\"id\":1,\"title\":\"General Bitcoin\",\"uri\":\"https://w3id.org/bitcoin-library/bots/4e42c22d-0b45-4d8a-bb49-6d95d56e2558\",\"checked\":true},{\"id\":18,\"title\":\"Mining\",\"uri\":\"https://w3id.org/bitcoin-library/bots/3b8d08d5-f72b-4a3f-9e02-5b4c5dbdc5f1\",\"checked\":true},{\"id\":6,\"title\":\"Philosophy\",\"uri\":\"https://w3id.org/bitcoin-library/bots/d41061ee-8e61-4c75-8a69-f2a2616920c5\",\"checked\":true}],\"authors\":[{\"name\":\"Gigi\",\"npub\":\"npub1dergggklka99wwrs92yz8wdjs952h2ux2ha2ed598ngwu9w7a6fsh9xzpc\",\"id\":\"Q197kqbe\"}],\"metadataContributor\":{\"name\":\"laoc42\",\"npub\":\"npub1r30l8j4vmppvq8w23umcyvd3vct4zmfpfkn4c7h2h057rmlfcrmq9xt9ma\"}}"]],"sig":"22aa98e58432c0251094df7754f720dd8e48e6b70efd5d7e336fe7e054694ebabf275e66dca50a1c5db8056a3bfd0e2765823b2e7a4e5fc959ce465cac0e7d78"}]
```

To publish the metadata of a resource I added a custom `metadata` attribute and JSON-stringified the content.
So far so good, but this approach has some flaws:

- The value of the attribute is quite big. Actually so big that we needed to remove a limit in the [nostream](https://github.com/Cameri/nostream) relay to get this sent through (really caused me some headache to find out why the events did not go through before).
- Other developers might not know what I mean with that metadata attribute and the attributes used inside of it.


