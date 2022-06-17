---
title: "Sommercamp 2021"
date: "2021-08-01"
---

Vom 23.08. bis zum 25.08. fand das diesjährige Jointly-Sommercamp statt.
Neben dem Austausch über aktuelle Entwicklungen, Ideen und Konzepten
stand auch dieses Jahr wieder ein Hackathon auf der Agenda. Besonders im
Fokus stand dabei die Vernetzung von Repositorien. Die GWDG ist im
BMBF-Projekt Jointly unter anderem für die Erarbeitung von Konzepten für
skalierbare und vernetzte IT-Infrastrukturen zuständig.

Ein Team rund um Serlo und WirLernenOnline hat sich in einer von der
GWDG geleiteteten Session mit der Frage besch√§ftigt, wie Metadaten zu
thematischen Einordnungen ausgetauscht werden k√∂nnen, ohne dass dabei
Informationen verloren gehen. Serlo.org wird von dem gemeinn√ºtzigen
Verein Serlo Education e.V. betrieben und bietet √ºber 15.000 Aufgaben,
Erkl√§rungen und Lernvideos f√ºr Mathematik und andere Schulf√§cher bereit.
Alle Inhalte werden unter einer freien Lizenz ver√∂ffentlicht und d√ºrfen
kopiert, ver√§ndert und verbreitet werden.

Sowohl bei WirLernenOnline als auch bei Serlo werden Inhalte in
thematische Strukturen eingeordnet, die sich an Lehrpl√§nen orientieren.
Bei WirLernenOnline geschieht dies in den Fachportalen √ºber die sog.
\"Themenb√§ume\". Diese Themenb√§ume wurden von Lehrer\*innen erstellt,
die sich auf WirLernenOnline engagieren und bilden eine √ºbergreifende
Taxonomie des jeweiligen Schulfaches ab. Beim einem Datenaustausch
zwischen den beiden Systemen gehen die Informationen der thematischen
Einordnung bisher verloren, da kein Mapping zwischen den beiden
Themenb√§umen besteht. Sinnvoll w√§re es jedoch, wenn die thematischen
Einordnungen aufeinander gemappt w√ºrden, um Nutzer\*innen in beiden
Systemen diese Einordnung als zus√§tzliche Information zur Verf√ºgung
stellen zu k√∂nnen.

![Fachportale bei WirLernenOnline](/image1.png)

Fachportale bei WirLernenOnline

![Taxonomie von Lehrplanthemen bei
WirLernenOnline](./media-folder/media/image2.png){width="5.833333333333333in"
height="4.14046697287839in"}

Ausschnitt aus der Taxonomie von Lehrplanthemen bei WirLernenOnline

![Themenbaum bei
Serlo](./media-folder/media/image3.png){width="5.833333333333333in"
height="5.329545056867891in"}

Ausschnitt eines Themenbaums bei Serlo

Modellierung der Themenb√§ume in SKOS
------------------------------------

Bei WirLernenOnline werden diese Themenb√§ume in dem RDF-basierten
Standard SKOS[^1] kodiert und anschlie√üend mit Skohub-Vocabs[^2]
ver√∂ffentlicht. SKOS (Simple Knowledge Organization System) ist ein
W3C-Standard zur Beschreibung kontrollierter Vokabulare. Der Vorteil der
Beschreibung solcher Vokabulare mit SKOS besteht darin, dass die
Vokabulare einerseits gut maschinenlesbar sind und somit gut in Software
verwendet werden k√∂nnen, andererseits besitzen sie ein hohes Ma√ü an
Nachnutzbarkeit und Interoperabilit√§t. F√ºr eine allgemeine Einf√ºhrung
SKOS wurde von dem Kompetenzzentrum Interoperable Metadaten (KIM), einer
Gruppe innerhalb der Deutschen Initiative f√ºr Netzwerkinformation e.V.
(DINI), eine Einf√ºhrung f√ºr SKOS ver√∂ffentlicht.[^3]

Eine weitere Eigenschaft von SKOS besteht darin, dass sich Relationen
zwischen den Begriffen eines Vokabulars ziehen lassen. So k√∂nnen
Relationen einerseits zu Begriffen im selben Vokabular hinterlegt
werden, andererseits auch zu Begriffen in anderen Vokabularen. Zur
Abbildung dieser Relationen stehen verschiedene Attribute zur Verf√ºgung.
Um Relationen innerhalb des eigenen Vokabulars abzubilden, werden meist
`skos:narrower` und `skos:broader` verwendet, um Oberbegriffe und
Unterbegriffe zu unterscheiden. Das Attribut `skos:related` wird
verwendet, um assoziierende Relationen zu einem anderen Begriff
innerhalb desselben Vokabulars auszuzeichnen. Zur Kennzeichnung von
Relationen zu einem anderen Vokabular stehen die Attribute
`skos:broadMatch` und `skos:narrowMatch` zur Verf√ºgung, um Ober- und
Unterbegriffe zu unterscheiden, jedoch innerhalb eines anderen
Vokabulars. Au√üerdem k√∂nnen `skos:closeMatch`, `skos:exactMatch` und
`skos:relatedmatch` verwendet werden, um die Art der Beziehung zu
Begriffen anderer Vokabulare auszudr√ºcken.

Im Rahmen des Hackathons haben wir uns dazu entschieden, in einem
Proof-of-concept zu testen, ob und wie sich die Beziehungen zwischen dem
Themenbaum von Serlo und dem Themenbaum von WirLernenOnline einf√ºgen
lassen k√∂nnten. Dazu musste zun√§chst der Themenbaum aus Serlo exportiert
und in SKOS abgebildet werden.

Anschlie√üend stellte sich die Frage, wie das Mapping zwischen den beiden
B√§umen hergestellt werden kann. Hierbei gibt es grunds√§tzlich zwei
M√∂glichkeiten:

-   Das Mapping direkt in den Turtle-Dateien einpflegen[^4]

-   Das Mapping mit Hilfe eines dedizierten Mapping-Tools durchf√ºhren

Das Hinterlegen des Mappings direkt in den Turtle-Dateien ist besonders
bei gr√∂√üeren Mappings aufw√§ndig und fehleranf√§llig. Au√üerdem sind
Kenntnisse der Turtle-Syntax notwendig. Auch wenn diese nicht allzu
schwierig zu lernen ist, sollten die inhaltlichen Expert\*innen, die
sich mit solchen Mappings besch√§ftigen nicht damit besch√§ftigen m√ºssen,
eine spezielle Syntax zu erlernen, sondern sich auf das Mapping
konzentrieren k√∂nnen. Auch bietet ein dediziertes Mapping-Tool weitere
Vorteile, wie eine visuelle Oberfl√§che sowie ggf. softwaregest√ºtze
Unterst√ºtzung beim Mapping.

Im Rahmen der OER-Metadatengruppe und Curricula-Gruppe wurde dazu
bereits am 17.03.2021 ein gemeinsamer Workshop mit dem coli-conc Team
der Verbundzentrale des GBV durchgef√ºhrt. Das coli-conc Projekt hat dazu
das Tool cocoda entwickelt, eine Vue.js Applikation mit der auf einer
ansprechend und √ºbersichtlich gestalteten Oberfl√§che Mappings zwischen
Vokabularen erarbeitet werden kann.

In dem Workshop wurde bereits anhand zwei unterschiedlicher
F√§cherklassifikationen ein solches Mapping ausprobiert und demonstriert.
Cocoda bietet dabei verschiedene M√∂glichkeiten an, ein Vokabular
einzulesen:

-   Skosmos-API

-   JSKOS-Server[^5]

-   SkoHub (momentan noch in der Test-Phase)

Da wir von der M√∂glichkeit SkoHub direkt benutzen zu k√∂nnen erst nach
dem Hackathon erfahren haben, haben wir uns f√ºr einen eigenen
JSKOS-Server entschieden.

Insgesamt waren f√ºr uns also folgende Arbeitsschritte notwendig, um ein
Mapping zwischen zwei Vokabularen in cocoda durchzuf√ºhren:

1.  Bereitstellung des Vokabulars im JSKOS-Format[^6]

2.  Hosting des Vokabulars auf einem JSKOS-Server

3.  Anpassung der Cocoda-Konfiguration

Bereitstellung des Vokabulars im JSKOS-Format
---------------------------------------------

Nachdem das Serlo-Team den Mathe-Themenbaum bereits in SKOS modelliert
hat, musste nun beide Taxonomien in das JSKOS-Format √ºberf√ºhrt werden.
Dazu gibt es gl√ºcklicherweise das Tool skos2jskos, das hierf√ºr genutzt
werden kann. Nach der Installation kann mit einem einfachen
`skos2jskos /``your_skos_file.ttl``/` das entsprechende SKOS-File in das
JSKOS-Format konvertiert werden. Als Ergebnis werden zwei Dateien
generiert: `schema.json` und `concepts.ndjson`. Diese werden im n√§chsten
Schritt in den JSKOS Server importiert.

Hosting des Vokabulars auf einem JSKOS-Server
---------------------------------------------

Dank guter Dokumentation ist der JSKOS-Server schnell aufgesetzt. Neben
der JSKOS-Instanz selbst ist noch ein Mongo-DB-Server n√∂tig. Dieser wird
entweder ebenfalls schnell selbst installiert oder es kann das ebenfalls
angebotene Docker-Compose-File genutzt werden, das den JSKOS-Container
inklusive eines Mongo-DB-Containers startet.[^7] Anschlie√üend m√ºssen
lediglich mit folgenden Befehlen die schema-Datei und die concepts-Datei
importiert werden.[^8]

    npm run import -- schemes ../data/imports/serlo/scheme.json
    npm run import -- concepts ../data/imports/concepts.ndjson

Wir aktualisieren anschlie√üend noch den Index mit folgendem Befehl:

    npm run import -- --indexes

Anpassung der Cocoda-Konfiguration
----------------------------------

Als letzten Schritt muss nun noch die Konfiguration in Cocoda angepasst
werden, damit die Vokabulare vom JSKOS-Server von Cocoda erkannt werden.
Die Konfiguration ist in der README.md des GitHub-Repositories
dokumentiert.[^9] Mit folgendem JSON-Objekt wurde unsere lokale
JSKOS-Instanz in der Konfigurationsdatei hinzugef√ºgt.

    {
        "provider": "ConceptApi",
        "uri": "http://localhost:3000",
        "status": "http://localhost:3000/status",
        "notation": [
            "WLO"
        ],
        "prefLabel": {
            "en": "WLO JSKOS"
        },
        "definition": {
            "en": [
                "WirLernenOnline JSKOS server instance"
            ],
            "de": [
                "WirLernenOnline JSKOS-Server Instanz"
            ]
        }
    }

Die Mappings selbst k√∂nnen entweder lokal gespeichert werden oder auf
einem JSKOS-Server (oder beides). Hier sind beispielhaft zwei
JSON-Objekte dargestellt, die einmal das lokale Mapping und das
Einbinden einer JSKOS-Instanz f√ºr das Mapping zeigen:

-   Lokales Speichern des Mappings:

<!-- -->

    {
        "provider": "LocalMappings",
        "uri": "http://coli-conc.gbv.de/registry/local-mappings",
        "notation": [
            "L"
        ],
        "prefLabel": {
            "de": "Lokal",
            "en": "Local"
        },
        "definition": {
            "en": [
                "Mappings saved locally in the browser"
            ],
            "de": [
                "Mappings, die lokal im Browser gespeichert wurden"
            ]
        }
    }

-   Speichern des Mappings auf einer JSKOS-Instanz

<!-- -->

    {
        "provider": "MappingsApi",
        "uri": "http://localhost:3000/mappings",
        "status": "http://localhost:3000/status",
        "notation": [
            "C"
        ],
        "prefLabel": {
            "de": "Mapping-Register",
            "en": "Mapping Registry"
        },
        "definition": {
            "en": [
                "Central concordance registry of WirLernenOnline."
            ],
            "de": [
                "Zentrales Konkordanz-Register von WirLernenOnline"
            ]
        }
    }

Auf <https://hub.docker.com/r/coliconc/cocoda> wird beschrieben, wie der
Service mit Docker einfach gestartet werden kann und die eigene
Config-Datei eingebunden wird. Nach einem einfachen
`docker-compose`` ``up` stand der Mapping-Service anschlie√üend zur
Verf√ºgung.

![Beispielhaftes Mapping der Konzepte Zahlenr√§ume (WirLernenOnline) auf
Zahlen und Gr√∂√üen
(Serlo)](./media-folder/media/image4.png){width="5.833333333333333in"
height="3.307309711286089in"}

Beispielhaftes Mapping der Konzepte Zahlenr√§ume (WirLernenOnline) auf
Zahlen und Gr√∂√üen (Serlo)

Mapping der Themenb√§ume
-----------------------

Am Hackathon selbst sind wir nicht mehr dazu gekommen, die Themenb√§ume
auch tats√§chlich aufeinander zu mappen. Jedoch konnten wir zeigen, dass
das Mapping nun auf einfache Weise m√∂glich w√§re, ohne dass Kenntnisse
der Turtle-Syntax notwendig sind. In einem Mapping-Sprint k√∂nnten sich
Fachredaktionen zusammenschlie√üen und ein Mapping verschiedener
Themenb√§ume durchf√ºhren. Mit leichten Anpassugen in der
Crawling-Infrastuktur w√§re es dann m√∂glich, dass beim Crawlen, sofern
als Metadatum bereitgestellt, die Infos √ºber die Themenbaumeinordnung
eines Materials erfasst wird. Aufgrund des Mapping k√∂nnte dann die
Einordnung bei Serlo auf die Einordnung bei WirLernenOnline √ºbertragen
werden. Nach dem Crawling w√ºrden die neu hinzugekommenen Materialien den
Fachredaktionen als Vorschl√§ge f√ºr die Themen in ihren Fachportalen
angezeigt werden. Auf diese Weise wird ihnen das Einsortieren von neuen
Materialien deutlich erleichtert. Die durch das Mapping neu gewonnenen
Informationen k√∂nnen au√üerdem verwendet werden, um die Machine-Learning
Prozesse in der Redaktionsumgebung von WirLernenOnline zu verbessern.

[^1]: https://www.w3.org/TR/skos-primer/

[^2]: ` `s. https://skohub.io

[^3]: ` https://dini-ag-kim.github.io/skos-einfuehrung/#/ f√ºr eine deutsche Einf√ºhrung in SKOS`

[^4]: Turtle ist ein Serialisierungsformat des RDF-Datenmodells.

[^5]: https://github.com/gbv/jskos-server

[^6]: https://metacpan.org/pod/skos2jskos

[^7]: https://hub.docker.com/r/coliconc/jskos-server

[^8]: https://github.com/gbv/jskos-server\#data-import

[^9]: ` `https://github.com/gbv/cocoda\#configuration
