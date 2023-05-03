---
title: Bitcoin Library - Educational Resources and Their Metadata as Actors on Nostr
date: "2023-03-18"
---

(englischer Titel, weil eine Übersetzung demnächst noch folgt...)

Wie manche von euch wissen, arbeite ich im Bereich Open Education.
Dabei treibt mich besonders das Interesse, wie Communities dezentral Bildungsmaterialien sammeln, annotieren und für andere zugänglich machen können.
Adrian Pohl und Felix Ostrowki haben dazu 2020 den Vorschlag gemacht, [Vokabulare zu sozialen Akteuren zu machen](https://blog.skohub.io/2020-06-25-skohub-pubsub/).
Im [SkoHub](https://skohub.io)-Projekt haben sie dazu Tools entworfen und gebaut, die es ermöglichen kontrollierte Vokabulare auf einfache Art und Weise zu veröffentlichen und zu sozialen Akteuren auf Basis des [Activity Pub Protokolls](https://activitypub.rocks/) zu machen.
Damit können die Attribute, wie beispielsweise Schlagworte (keywords), mit denen ich eine Ressource auszeichne, selbst zu sozialen Akteuren werden, denen ich folgen oder mit denen interagieren kann.

Der Hackathon [Hack-Nostr-On](https://dorahacks.io/hackathon/hack-nostr-on) hat mich dazu inspiriert, diese Idee weiterzudenken und den Ansatz auf [Nostr](https://Nostr.com/) zu übertragen.
Dabei ist nun als Prototyp, die ["Bitcoin-Library"](https://github.com/bitcoin-library) entstanden.

## Warum Nostr?

Zunächst mal: Ich halte den ActivityPub Ansatz und das [Fediverse](https://en.wikipedia.org/wiki/Fediverse) für großartig.
Jedoch kann ich mir durchaus Umstände vorstellen, in denen ein zensurresistentes, weitaus dezentraler gestaltetes Netzwerk für Bildungsressourcen wichtig werden kann.
Nämlich genau dann, wenn die Bildungsinhalte von institutioneller (oder auch anderer autoritärer) Seite nicht gewünscht sind.
In diesem Fall ist es wesentlich einfacher zentrale oder auch föderierte Netzwerke zur Kooperation zu zwingen und Akteure oder Inhalte von ihnen auszuschließen.
Der Betrieb von Mastodon oder anderen ActivityPub-Klienten ist wesentlich aufwändiger als das Aufsetzen eines Relays und stellt in so einem Fall einen Single Point of Failure dar.
Außerdem gehen die User Accounts beim Schließen einer ActivityPub Instanz verloren, eine nachträgliche Migration ist (meines Wissens nach) nicht möglich, auch alle Follower-Information gehen verloren.
Dies kann bei Nostr per Design nicht passieren, da alle Akteure einen privaten Schlüssel besitzen, mit dem sie die Nachrichten signieren und an beliebige Relays schicken können.
Selbst wenn Relays geschlossen oder bestimmte User ausgeschlossen werden, können die Nachrichten einfach an beliebige andere Relays gesendet und von dort bezogen werden (sofern sie vorher dorthin gesendet oder gespieglt wurden).

## Wie auf Nostr übertragen?

Eine Übertragung des in SkoHub entwickelten Konzeptes sollte auf einfach Weise möglich sein.
An dieser Stelle ein kurzer Exkurs für alle, die mit kontrollierten Vokabularen ([SKOS](https://dini-ag-kim.github.io/skos-einfuehrung/#/)) sonst nichts am Hut haben.

### Was sind kontrollierte Vokabulare?

Kontrollierte Vokabulare sind schlicht gesagt, nichts anderes als feste Wertelisten.
Jedes Dropdown-Menü kann auch als kontrolliertes Vokabular bezeichnet werden.
Der innovative Ansatz bei SKOS, dem Simple Knowledge Organization System, ist nun, dass diese Vokabulare und ihre Einträge mit einer URL versehen werden und auch mit anderen Metadaten, wie Beziehungen, um beispielsweise Hierarchien aufzubauen, Alternativbezeichnungen und anderen Dingen ausgezeichnet werden können.
Dies macht es möglich, dass der Eintrag aus einem kontrollierten Vokabular, eine eigene "Webseite" bekommen kann.
Für diesen Zweck wurde beispielsweise [SkoHub Vocabs](https://github.com/skohub-io/skohub-vocabs) entwickelt.
Mit Hilfe dieses Tools können kontrollierte Vokabulare einfach im Web veröffentlicht werden und bekommen eine URI, die dabei hilft mit ihnen zu interagieren.

Hier als Beispiel eine Hochschulfächersystematik: https://w3id.org/kim/hochschulfaechersystematik/scheme

Besonders spannend wird es nun, weil ich statt der HTML-Seite unter dem gleichen Link auch eine JSON-Repräsentation der Daten aufrufen kann: https://w3id.org/kim/hochschulfaechersystematik/scheme.json (oder über Content-Negotiation)
Dies ermöglicht es, dass Maschinen auf einfache Art und Weise mit diesen Vokabularen interagieren können, indem sie dort hinterlegten Informationen auslesen.

### Wie hilft das beim Aufbau einer dezentralen Bibliothek auf Nostr?

Dropdown Menüs können beispielsweise nun so realisiert werden, dass die Daten über mögliche Werte nicht mehr im Programmcode gespeichert werden müssen, sondern über eine URI von der Applikation geholt werden.
Das erleichtert die Trennung von Daten und Code.
Allerdings können auch weitere Metadaten zu den kontrollierten Vokabularen so zur Verfügung gestellt werden, beispielsweise ein Nostr Public Key, neben der Inbox von Activity Pub, womit der Eintrag in diesem kontrollierten Vokabular selbst zum Akteur wird.
Diesen Public Key können dann Applikationen nutzen, um mit diesem Eintrag zu interagieren.
Sie können beispielsweise Ressourcen in Form von Links an diesen Akteur senden und mit ihm teilen.
Menschen wiederum können ebenfalls diesen Einträgen auf Nostr folgen und werden benachrichtigt, wenn dieser Akteur neue Notes verfasst und Links zu Ressourcen teilt.

Damit können sich Communities bilden und organisieren, die themenbezogen Ressourcen mit solchen Vokabulareinträgen verlinken, wodurch ein Wissensgraph entsteht, der wiederum von anderen Applikationen, beispielsweise einer "Bibliothek" genutzt werden kann, um eine Suchmaschine über diese community-annotierten Ressourcen aufzubauen.

## Zu viel Theorie, zeig mir was!

Der Prototyp besteht aus drei Komponenten:

- Metadaten-Editor (als Browser Extension)
- Note-Fetcher
- Frontend

### Der Metadaten-Editor

Als ersten Prototyp und PoC habe ich etwas nachgenutzt, das bereits bei SkoHub entwickelt wurde, jedoch mittlerweile leider aus Mangel an Ressourcen abgeschaltet wurde: Eine Browser Extension, die es ermöglicht, die Webseite mit Metadaten zu annotieren, die anschließend als Akteure die Ressource auf Nostr teilen.

![](./image1.png)

Hier habe ich beispielsweise [Gigis großartigen Value4Value](https://dergigi.com/2021/12/30/the-freedom-of-value/) Artikel mit dem Tool annotiert (verfügbare Metadaten, wie Bild, Titel, Beschreibung und URL werden automatisch von der Webseite übernommen) und noch mit den Metadaten "Artikel" sowie "V4V" versehen (die Einträge kommen teilweise von der [Einundzwanzig Bibliothek](https://portal.einundzwanzig.space/de/library/library-item?l=de)).

Nach einem Klick auf "Publish" werden die Metadaten der Ressource als "Notes" durch die Bots auf Nostr geteilt.
Die Metadaten zur Resource werden in einem Tag `metadata` gespeichert und können von dort aus von anderen Services genutzt werden.
Ein Event sieht dabei beispielsweise so aus: 

```json
[
  "EVENT",
  "0",
  {
    "id": "bd000c944f40667b9cfc7f1d99e60f456de6f797aa39ebeb12113cac93cbb98c",
    "kind": 1,
    "pubkey": "8af30833be407219d6a2d2a6a84d2cea7d3c212693090fcc2b110ca944c3a617",
    "created_at": 1682689537,
    "content": "Hello! A new resource with title \"Bitcoin Flyer in Swahili\" got added to the library!\n    https://blotcdn.com/blog_378314d0a9ec45bfa46b3bc7d3718410/_thumbnails/b0cefa01-8abe-42ed-89fe-d6a1e79b6e11/large.png\nAround 200 million people are speaking Swahili. Now they can learn and share the basics about Bitcoin with BFF's Bitcoin flyer..\nSent from Nostr:npub1j8wdpuqqct23l4gyyxa5dkjvgkxzkjh3n3mzzjj79uhcvh424pcqurytqu (Bitcoin Library).\n    ",
    "tags": [
      [
        "p",
        "8af30833be407219d6a2d2a6a84d2cea7d3c212693090fcc2b110ca944c3a617"
      ],
      [
        "metadata",
        "{\"id\":\"https://anitaposch.com/bitcoin-swahili\",\"name\":\"Bitcoin Flyer in Swahili\",\"description\":\"Around 200 million people are speaking Swahili. Now they can learn and share the basics about Bitcoin with BFF's Bitcoin flyer.\",\"image\":\"https://blotcdn.com/blog_378314d0a9ec45bfa46b3bc7d3718410/_thumbnails/b0cefa01-8abe-42ed-89fe-d6a1e79b6e11/large.png\",\"resourceType\":[{\"id\":0,\"checked\":true,\"title\":\"Artikel\",\"uri\":\"https://w3id.org/bitcoin-library/bots/f631971e-ee83-4c95-9fcf-b1c1639bb4f6\"}],\"keywords\":[{\"id\":1,\"title\":\"Allgemein Bitcoin\",\"uri\":\"https://w3id.org/bitcoin-library/bots/4e42c22d-0b45-4d8a-bb49-6d95d56e2558\",\"checked\":true}],\"authors\":[{\"name\":\"Anita Posch\",\"npub\":\"npub1tjkc9jycaenqzdc3j3wkslmaj4ylv3dqzxzx0khz7h38f3vc6mls4ys9w3\",\"id\":\"4EEmDu8x\"}],\"metadataContributor\":{\"name\":\"\",\"npub\":\"\"}}"
      ]
    ],
    "sig": "b07b2db792ff8c90526e93695dbad1d030a45e4b3e4b64138d0a0aa24d53d5405bcca4a6d4c2231c2eae9b267a0366473c2d0eba63309c259adc7eb2b0a59190"
  }
]
```

Zukünftig soll es auch möglich werden, interessante Notes direkt an die Bots zu senden, sodass nicht nur Webressourcen, sondern auch Notes in dem Suchindex auffindbar gemacht werden können.

### Der Note Fetcher

Der "Note Fetcher" ist gewissermaßen ein Herzstück des gesamten Services, indem dort das klassische ETL (Extract, Transform, Load) stattfindet.
Alle fünf Sekunden prüft der "Note Fetcher", ob es neue Events gibt.
Falls ein neues Event vorhanden ist, wird zunächst geprüft, ob die Ressource bereits im Suchindex vorhanden ist.
Dabei ist die URL maßgebend und dient als Identifier der Ressource.
Falls die Resource noch nicht im Index vorhanden ist, wird sie dort hinzugefügt.

Falls die Ressource jedoch bereits vorhanden ist, werden die Metadaten gemergt.
Dieses Merging der Metadaten stellt einen elementaren Bestandteil des gesamten dezentralen Annotationskonzeptes dar.
In einem dezentral community basierten Ansatz werden zwangsläufig Akteure dieselben Ressourcen früher oder später mit unterschiedlichen Metadaten annotieren.
Der eine ordnet die Ressource beispielsweise dem Thema "Umwelt" zu, die andere dem Thema "Mining". Eine dritte vergibt vielleicht beide Attribute und noch ein Drittes.

Langfristig gehe ich davon aus, dass die Attribute, die am besten passen, am häufigsten vergeben werden und sich so eine Art "Konsens" herausbildet. 
Mehr dazu im nächsten Abschnitt.

Die gemergten Metadaten werden anschließend in den Suchindex geschrieben und sind anschließend im Suchfrontend verfügbar.

### Das Frontend - Die Bitcoin Library

Das Frontend ist eine einfache Webanwendung, die die Metadaten aus dem Suchindex abfragt, anzeigt, such- und filterbar macht.

![](./frontend.png)

Um die gemergten Metadaten zu visualisieren, werden die Tags mit unterschiedlicher "Opacity" dargestellt.
Je seltener ein Metadatum vergeben wurde, desto blasser wird es dargestellt.
Damit soll verdeutlicht werden, wie oft das Metadatum vergeben wurde.

![](./tags.png)

### Value For Value

Content Ersteller, besonders für Bildungsmaterialien, erweisen der Gesellschaft einen unschätzbaren Dienst, indem sie ihre Materialien im Web bereit stellen.
Häufig werden dabei auch [Creative Commons Lizenzen](https://creativecommons.org/licenses/?lang=en) verwendet, die es anderen erlauben, die Materialien zu verwenden und zu remixen.
Damit können die Materialien einfach und rechtssicher angepasst und weiterverwendet werden.

Bisherige zentralisierte Plattformen oder auch ActivityPub basierte Netzwerke wie Mastodon bieten jedoch keine Möglichkeit, den Erstellern etwas außer einem "Like" zurückzugeben.
Nostr bietet durch seine Nähe zum Bitcoin und Lightning Netzwerk eine Lösung an, um ohne Intermediäre direkt den Erstellerinnen etwas zurückzugeben.

Aber auch diejenigen, die die Metadaten bereitstellen, können im Metadaten-Editor Ihren Npub angeben.
Von dort wird, wie bei den Content Erstellern, sofern vorhanden, die [LUD16](https://github.com/lnurl/luds/blob/luds/16.md) Adresse aus dem Profil abgefragt.
Diese Adresse kann anschließend genutzt werden, um mit Alby eine kleine Spende zu tätigen (es ist also (noch) keine Implementierung von [NIP-57](https://github.com/Nostr-protocol/nips/blob/master/57.md)).

![](./zap.png)

## Ausblick - No Data in the Code

Der Metadaten-Editor ist auf Basis von JSON Schema entwickelt worden.
Die Werte in den Dropdown-Menüs sind SKOS-Vokabulare.
Damit soll es (zukünftig) möglich werden auf einfache Weise andere JSON Schemata zu entwickeln und andere Vokabulare zu verwenden.

Warum nicht zukünftig eine community basierte Sammlung für Rezepte aufbauen?
Es müssen lediglich die Metadaten sowie neue Vokabulare entwickelt werden.
Viele Komponenten des Note Fetcher oder der Bitcoin Library können wiederverwendet werden.

## Fazit

Den Code habe ich auf GitHub in der [Organisation "Bitcoin Library"](https://github.com/bitcoin-library) veröffentlicht.
Die Repos sind vermutlich momentan noch wenig hilfreich und der Code auch nicht besonders hübsch.
In den nächsten Wochen hoffe ich zunächst den Service einmal zu deployen und anschließend den Code zu refactoren und zu dokumentieren.

Ich freue mich über jedes Feedback, Fragen und Anregungen. Und natürlich besonders, falls jemand mitarbeiten möchte.

## Links

- [SkoHub PubSub](https://blog.skohub.io/2020-06-25-skohub-pubsub/)
- [Activity Pub](https://activitypub.rocks/)
- [Einführung in SKOS](https://dini-ag-kim.github.io/skos-einfuehrung/#/)
- [RDF](https://en.wikipedia.org/wiki/Resource_Description_Framework)
- [Einundzwanzig Bibliothek](https://portal.einundzwanzig.space/de/library/library-item?l=de)
- [Hack-Nostr-On](https://dorahacks.io/hackathon/hack-nostr-on)
- [Nostr](https://nostr.com/)
