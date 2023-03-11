---
title: "NOSTR - Experimenting with Relays and nostr-tools"
date: "2023-03-11"
---

**TL;DR**: Meine Erfahrungen beim Aufsetzen eines NOSTR-Relays auf Basis von [`nostream`](https://github.com/Cameri/nostream) und erste Interaktionen mit [`nostr-tools`](https://github.com/nbd-wtf/nostr-tools)

[NOSTR](https://nostr.com/) ist ein dezentrales soziales Netzwerk und hat einiges an Aufmerksamkeit gewonnen, nachdem Elon Musk nicht nur das Posten von Mastodon Handles, sondern unter anderem auch von NOSTR Keys verbot.

> "Specifically, we will remove accounts created solely for the purpose of promoting other social platforms and content that contains links or usernames for the following platforms: Facebook, Instagram, Mastodon, Truth Social, Tribel, Nostr and Post."

Mittlerweile ist der Tweet gelöscht worden und nicht mehr verfügbar, in dem Elon dies ankündigte, aber das Web Archive vergisst glücklicherweise nicht: https://web.archive.org/web/20221218173806/https://help.twitter.com/en/rules-and-policies/social-platforms-policy

Die Aufmerksamkeit Elons auf diesem noch sehr jungen Protokoll mag auch daran liegen, dass Jack Dorsey kurze Zeit vorher 14 Bitcoin an [@fiatjaf](https://twitter.com/fiatjaf) spendete, um die Entwicklung von NOSTR zu fördern.

Das soll aber nicht noch eine "Was ist NOSTR"-Einführung werden (dafür gerne auch hier schauen: https://nostr-resources.com/), sondern ich möchte kurz von meinen Erfahrungen beim Einrichten eines Relays sowie den ersten Interaktionen damit berichten.

## Relay einrichten

Ein NOSTR-Relay bietet eine simple Websocket Verbindung an, zu der sich Clienten verbinden können.
Die ausgetauschten Daten sind wiederum simple JSON-Objekte, die mit einem privaten Schlüssel signiert werden (siehe auch [NIP-01](https://github.com/nostr-protocol/nips/blob/master/01.md#nip-01)).

Hier gibt es bereits ein paar Guides, die bei dem Setup eines Relays unterstützen.
Ich habe mich an diesen beiden Guides orientiert, die ein Relay auf der Basis von [nostream](https://github.com/Cameri/nostream) einrichten:

- https://andreneves.xyz/p/set-up-a-nostr-relay-server-in-under
- https://www.massmux.com/install-a-nostr-relay/

Ich empfehle den zweiten Guide, da dieser noch etwas ausführlicher ist, vor allem, wenn du noch nie mit Docker gearbeitet hast.

Die größte Herausforderung für mich bestand in der Konfiguration meines Routers und der Einrichtung einer Subdomain, die auf meinen Homeserver zeigen sollte.
Für alles finden sich jedoch haufenweise Guides im Netz.
Meine größte Lesson-Learned war, dass ich beim Eintragen eines CNAMES für meines Subdomain am Ende der Domain einen Punkt setzen musste.

Am Ende der Einrichtung könnt ihr https://websocketking.com/ besuchen und versuchen eine Verbindung zu eurem Relay herzustellen.
Wenn eine Verbindung hergestellt werden kann, habt ihr es geschafft 🎉

Ich habe mir zum Testen einen Account auf [snort.social](https://snort.social) angelegt, unter "Settings" alle Relays entfernt und nur mein Relay hinzugefügt.
Anschließend habe ich ein paar Notes veröffentlicht, in meinem Mobil-Client (Amethyst) das Relay ebenfalls hinzugefügt und voilà, die Notes erschienen auch auf meinem Handy.

Es war ehrlich gesagt, fast schon ein wenig magisch, wie einfach das alles funktioniert hat.

<div style="width:100%;height:0;padding-bottom:92%;position:relative;"><iframe src="https://giphy.com/embed/9r75ILTJtiDACKOKoY" width="100%" height="100%" style="position:absolute" frameBorder="0" class="giphy-embed" allowFullScreen></iframe></div><p><a href="https://giphy.com/gifs/ghoodgirlmagic-magic-ghood-girl-9r75ILTJtiDACKOKoY"></a></p>

## Mit Relay interagieren

Richtig spannend ist es aber, Applikationen gegen so ein Protokoll zu entwickeln.
Endlich keine nervigen Twitter-API Zugänge mehr, jetzt kann ich einfach gegen mein eigenes Relay entwickeln und testen.
Das allein ist schon viel wert.

Folgende Dinge habe ich ausprobiert und möchte ich kurz darstellen:

- Erstellen von privaten und öffentlichen Schlüsseln
- Subscription zu einem Relay
- Erstellen einer Note
- Ändern von Metadaten eines Users
- Konvertierung der Schlüssel in [NIP-19](https://github.com/nostr-protocol/nips/blob/master/19.md) konforme Formate

Als Toolset nutze ich [nostr-tools](https://github.com/nbd-wtf/nostr-tools), eine Node Bibliothek, um Nostr Clients zu entwickeln.

Um die Beispiele auch bei euch auszuführen, öffnet ein Terminal und führt folgende Befehle aus:

```bash
mkdir experiment-with-nostr
cd experiment-with-nostr
npm init -y
npm i nostr-tools
```

Öffnet anschließend den Ordner in einem Code-Editor und erstellt eine Datei `generateKeys.js`

### Erstellen von Schlüsseln

Zunächst wollen wir ein Schlüsselpaar erstellen.
Das kann mit dem Anlegen eines Users verglichen werden.
Die Schlüsselpaare können wir anschließend nutzen, um unsere Notes und anderen Aktionen zu signieren.

`generateKeys.js`

```js
import { generatePrivateKey, getPublicKey } from "nostr-tools";

let privateKey = generatePrivateKey();
let publicKey = getPublicKey(privateKey);

console.log("private key = " + privateKey);
console.log("public key = " + publicKey);
```

Führt das ganze mit `node generateKeys.js` aus und speichert die Schlüssel in einer separaten Datei, damit wir sie später wiederverwenden können.

### Subscription zu einem Relay

Wie oben beschrieben habe ich bereits ein paar Test Notes an mein frisch aufgesetztes Relay geschickt.
Nun schauen wir mal, ob ich diese "Events", wie es bei NOSTR korrekt heisst, auch ausgelesen bekomme.

Damit das ganze funktioniert, muss erst noch das websocket-polyfill Paket installiert werden: `npm i websocket-polyfill`.

Als Relay habe ich mein frisches NOSTR-Relay eingesetzt, es lässt sich aber auch jedes andere verwenden.

Da ich nur Text Notes bekommen möchte (und bspw keine Änderungen über Metadaten), setze ich bei `kinds: [1]`. Hier findet ihr die [NOSTR Event Typen](https://github.com/nostr-protocol/nips/blob/master/01.md#basic-event-kinds).

`subscribeToRelay.js`

```js
import "websocket-polyfill";
import { relayInit } from "nostr-tools";

const relay = relayInit("wss://nostr.btc-library.com");
relay.on("connect", () => {
  console.log(`connected to ${relay.url}`);
});
relay.on("error", () => {
  console.log(`failed to connect to ${relay.url}`);
});

await relay.connect();

let sub = relay.sub([
  {
    kinds: [1],
  },
]);

sub.on("event", (event) => {
  console.log("got event:", event);
});
```

Führt das ganze wieder mit `node subscribeToRelay.js` aus und es wird eine Websockerverbindung zu Relay hergestellt und ihr solltet eine Liste mit Notes bekommen.
Mit `Ctrl-C` könnt ihr die Verbindung unterbrechen.

### Erstellen einer Note

Nun wollen wir eine Note erstellen und an ein Relay senden.
Der einzige Objekttyp der in NOSTR existiert ist ein ["Event"](https://github.com/nostr-protocol/nips/blob/master/01.md#events-and-signatures) und hat das folgende Format:

```json
{
  "id": <32-bytes lowercase hex-encoded sha256 of the the serialized event data>,
  "pubkey": <32-bytes lowercase hex-encoded public key of the event creator>,
  "created_at": <unix timestamp in seconds>,
  "kind": <integer>,
  "tags": [
    ["e", <32-bytes hex of the id of another event>, <recommended relay URL>],
    ["p", <32-bytes hex of a pubkey>, <recommended relay URL>],
    ... // other kinds of tags may be included later
  ],
  "content": <arbitrary string>,
  "sig": <64-bytes hex of the signature of the sha256 hash of the serialized event data, which is the same as the "id" field>
}
```

Wie wir bereits gelernt haben, ist das senden einer Text Note ein Event vom Typ "1".
Dann brauchen wir also nur noch etwas "content" und es kann losgehen:

`createEventTextNote.js`
```js
import {
  signEvent,
  getEventHash,
  getPublicKey
} from 'nostr-tools'

let privateKey = 'your-private-key'

let event = {
  kind: 1,
  created_at: Math.floor(Date.now() / 1000),
  tags: [],
  content: 'Hello world, a note from your favorite bot!',
  pubkey: getPublicKey(privateKey)
}

event.id = getEventHash(event)
event.sig = signEvent(event, privateKey)

let event_publish = ['EVENT', event]

console.log(
  JSON.stringify(event_publish, null, 2)
)
```

Nachdem ihr euren private Key eingesetzt und das ganze mit `node createEventTextNote.js` ausgeführt habt, solltet ihr ungefähr folgendes bekommen:

```js
[
  "EVENT",
  {
    "kind": 1,
    "created_at": 1678536852,
    "tags": [],
    "content": "Hello world, a note from your favorite bot!",
    "pubkey": "2b326b52869d5c89f6486e60815e9cc3001c13fd2cbec0b116b861ab578a95ab",
    "id": "56b6c5a89ded6ed2ae47917a60e6b5a59d51397e2121ebe69da5f1d6d3e5f43f",
    "sig": "5e1ca614e505fad548d960d888d74476da21da9bedf7ac58df58cf206c076d56d92a28a66f1d974ab37d9bdfe6ca5314b821d742decbd28675a173e83d4bb249"
  }
]
```

Sehr schön!
Aber wie kommt das jetzt zu unserem Relay?
Dazu könnten wir jetzt wieder etwas Code schreiben, aber ich möchte euch noch einen anderen Weg zeigen, um zu zeigen, wie simpel die Interaktion mit Relays ist.

Besucht https://websocketking.com/ und verbindet euch mit einem Relay, e.g. mein Test-Relay `wss://nostr.btc-library.com`.

Fügt anschließend den Event Output ein und klickt auf "Send".
Zack, das Event wurde gesendet.
Falls das ganze nicht klappt, liegt es eventuell daran, dass manche Relays eine Subscription erfordern.

In dem Fall könnt ihr es mit folgendem Code versuchen und mit `node sendEventToRelay.js` ausführen:

`sendEventToRelay.js`
```js
import 'websocket-polyfill'
import {
  relayInit,
  getPublicKey,
  getEventHash,
  signEvent
} from 'nostr-tools'

const relay = relayInit('wss://nostr.btc-library.com')
let privateKey = 'your-priv-key'


relay.on('connect', () => {
  console.log(`connected to ${relay.url}`)
})
relay.on('error', () => {
  console.log(`failed to connect to ${relay.url}`)
})

await relay.connect()

let sub = relay.sub([
  {
    kinds: [1],
  }
])

sub.on('event', event => {
  console.log('got event:', event)
})

let event = {
  kind: 1,
  created_at: Math.floor(Date.now() / 1000),
  tags: [],
  content: 'Hello world, this is a note sent from your favorite bot!',
  pubkey: getPublicKey(privateKey)
}

event.id = getEventHash(event)
event.sig = signEvent(event, privateKey)

let pub = relay.publish(event)
pub.on('ok', () => {
  console.log(`${relay.url} has accepted our event`)
})
pub.on('failed', reason => {
  console.log(`failed to publish to ${relay.url}: ${reason}`)
})
```

### Ändern der Metadaten eines Users

In NOSTR gibt es nur Events.
Um die Metadaten eines Users zu ändern, müssen wir also ebenfalls ein Event bauen, jedoch jetzt mit [`kind: 0`](https://github.com/nostr-protocol/nips/blob/master/01.md#basic-event-kinds).
Mit folgendem Code-Schnipsel ändern wir den Username in "Joe Doe".
Der Content wird beim Ändern der Metadaten übrigens als "stringified JSON Object" übermittelt:

`createEventMetadata.js`
```js
import {
  signEvent,
  getEventHash,
  getPublicKey
} from 'nostr-tools'

let privateKey = 'your-priv-key'

const metadata = {
  name: "Joe Doe",
}

let event = {
  kind: 0,
  created_at: Math.floor(Date.now() / 1000),
  tags: [],
  content: `${JSON.stringify(metadata)}`,
  pubkey: getPublicKey(privateKey)
}

event.id = getEventHash(event)
event.sig = signEvent(event, privateKey)

let event_publish = ['EVENT', event]

console.log(
  JSON.stringify(event_publish, null, 2)
)
```

Führt das ganze wieder mit `createEventMetadata.js` aus und postet das ganze über websocketking oder tauscht den event Abschnitt in `sendEventToRelay.js` aus, falls euer Relay der Wahl das Event ohne subscription nicht annimmt.

### Konvertierung der Schlüssel in NIP-19 Formate

Um zu vermeiden, dass privater und öffentlicher Schlüssel zu leicht verwechselt werden, wurde ein Format entwickelt, welches die Unterscheidung vereinfacht.
Mehr dazu unter [NIP-19](https://github.com/nostr-protocol/nips/blob/master/19.md)

Um entsprechende formatierte Schlüssel zu erzeugen, könnt ihr folgenden Code benutzen (setzt eure entsprechenden Schlüsseldaten ein):

`genNip19.js`
```js
import {nip19} from 'nostr-tools'

let privateKey = "your-priv-key"
let publicKey = "your-pub-key"

let nsec = nip19.nsecEncode(privateKey)
console.log("nsec: ", nsec);

let npub = nip19.npubEncode(publicKey)
console.log("npub: ", npub)
```

## Fazit

Die Interaktion mit NOSTR ist sehr straight-forward und macht Spaß.
Das Protokoll (auch wenn ich es noch nicht komplett gelesen habe) scheint gut dokumentiert zu sein und ist vor allem sehr simpel gehalten.
Das Aufsetzen eines Relays lief super schnell, für einen richtigen Produktionsbetrieb ist jedoch sicherlich noch einiges an zusätzlichen Einstellungen vorzunehmen.
`nostr-tools` ist außerdem eine schöne Node-Bibliothek, um mit Relays zu interagieren und Services zu entwickeln.


## Links

- [NOSTR](https://nostr.com/)
- [NOSTR Resources](https://nostr-resources.com/)
- [NOSTR Implementation Possibilities](https://github.com/nostr-protocol/nips)
- [nostream](https://github.com/Cameri/nostream)
- [nostr-tools](https://github.com/nbd-wtf/nostr-tools)