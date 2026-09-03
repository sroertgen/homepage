---
title: "Linking the WLO-Data"
date: "2020-12-03"
---

Some time has passed since the last post and quite some things have happened.
The wirlernenonline-project has published a [data-dump](https://github.com/openeduhub/oeh-wlo-data-dump) of its index and I want to take this as a basis and show, what great things we will be able to do starting to link it.

So were are we right now?
What kind of linkage is already there?

Since the start of the project we were using the [SkoHub Vocabs tool](http//skohub.io) to publish our vocabulary.
We maintain every vocabulary we use in a public GitHub repository: <http://github.com/openeduhub/oeh-metadata-vocabs>.
Every push in this repository triggers a GitHub Action, which pulls a Docker container containing the SkoHub-Vocabs tool.
It pulls the GitHub repository in the container, builds nice human and machine readable pages and pushes them to the `gh-pages`-branch.
From there we can just use GitHub pages to serve our pages!
This is nice, because we don't need any special infrastructure, no dedicated server to host it.
It's also always the newest version, because it runs after every push.
We also got some w3id, to ensure sustainability of this vocabulary: <http://w3id.org/openeduhub/vocabs>
And most important: machines can easily read it as well, e.g. <http://w3id.org/openeduhub/vocabs/learningResourceType/index.json>

During crawling a content source our scrapy-spiders are looking at the machine readable versions of the vocabulary and trying to match the content they find on the page to some labels in our vocabulary.
If it finds something it appends the ID to the respective property.

This results in having already the first links in the WLO data dump! Yay! 🎉🎉🎉

But what else did we get so far?

We parsed some keyword and topic vocabulary for educational material developed by the [AG MUD](http://agmud.de) enclosed in `.xlsx`-files and modelled it in SKOS.

- EAF-Sachgebietssystematik: <https://github.com/openeduhub/oeh-metadata-eaf-sachgebietssystematiken>
- EAF-Schlagwortverzeichnis: <https://github.com/openeduhub/oeh-metadata-eaf-schlagwortverzeichnis>

Thanks to open minded people in Berlin-Brandenburg, we also have the FIRST AND ONLY machine readable version of school curricula data available:

- <https://github.com/hfreye/RLP-XML/blob/master/bcs.xml>

To use this in the linked data universe, it was modelled in RDF.
Since there is currently no model available on how to model school curriculums data, I had to develop my own and did so based on some ideas of the [K12 OCX project](https://k12ocx.github.io/k12ocx-specs/).
Where it was necessary I had to define some properties special in German school system, e.g. `educationalContext`.
I put together some information about the current status of machine-readable curricula in German school system [here](https://kurzelinks.de/maschinenlesbare-curricula).

A RDF model for the Berlin-Brandenburg school curriculum was POCed here:

- <https://github.com/sroertgen/oeh-framework-bb>

## So what now

An exemplary wlo-dump-entry serialized in turtle might look like this:

```turtle
<612f1900-7cae-4894-8d34-2e9c53419bc3> a sdo:CreativeWork ;
    oeh:educationalContext [ a sdo:DefinedTerm ;
            sdo:alternateName "Sekundarstufe 1"@de,
                "lower secondary school"@en ;
            sdo:id <612f1900-7cae-4894-8d34-2e9c53419bc3> ;
            sdo:inDefinedTermSet <http://w3id.org/openeduhub/vocabs/educationalContext/> ;
            sdo:name "Sekundarstufe I"@de,
                "Secondary I"@en ],
        [ a sdo:DefinedTerm ;
            sdo:alternateName "Sekundarstufe 2"@de,
                "upper secondary school"@en ;
            sdo:id <612f1900-7cae-4894-8d34-2e9c53419bc3> ;
            sdo:inDefinedTermSet <http://w3id.org/openeduhub/vocabs/educationalContext/> ;
            sdo:name "Sekundarstufe II"@de,
                "Secondary II"@en ] ;
    sdo:audience [ a sdo:DefinedTerm ;
            sdo:alternateName "Lehrende"@de,
                "Lehrender"@de,
                "Lehrer"@de,
                "Lehrerin"@de ;
            sdo:id <612f1900-7cae-4894-8d34-2e9c53419bc3> ;
            sdo:inDefinedTermSet <http://w3id.org/openeduhub/vocabs/intendedEndUserRole/> ;
            sdo:name "Lehrer/in"@de,
                "teacher"@en ],
        [ a sdo:DefinedTerm ;
            sdo:alternateName "Lernende"@de,
                "Lernender"@de,
                "Schüler"@de,
                "Schülerin"@de,
                "students"@en ;
            sdo:id <612f1900-7cae-4894-8d34-2e9c53419bc3> ;
            sdo:inDefinedTermSet <http://w3id.org/openeduhub/vocabs/intendedEndUserRole/> ;
            sdo:name "Lerner/in"@de,
                "learner"@en ] ;
    sdo:description "Die Produkte, die wir konsumieren, sind zu billig und verleiten uns so dazu, besonders viel zu kaufen. Damit werden Probleme wie Klimawandel, Artensterben, Umweltverschmutzung, Armut und Unterentwicklung verstärkt. Aber wieso sind die niedrigen Preise ein Problem? Wer bezahlt noch für unsere Produkte? Und was kann dagegen getan werden? Dies sind die Fragen, denen dieser Film nachgeht."@de ;
    sdo:identifier "612f1900-7cae-4894-8d34-2e9c53419bc3"@de ;
    sdo:keywords "Artenschutz"@de,
        "Discounter"@de,
        "Entsorgung"@de,
        "Fair Trade"@de,
        "Globalisierung"@de,
        "Konsum"@de,
        "Konsumverhalten"@de,
        "Nachhaltigkeit"@de,
        "Naturschutz"@de,
        "Preis"@de,
        "Produktion"@de,
        "Ressourcenverbrauch"@de,
        "Umweltschutz"@de,
        "Versteckte Kosten"@de,
        "Welthandel"@de,
        "Überfischung"@de ;
    sdo:learningResourceType [ a sdo:DefinedTerm ;
            sdo:id <612f1900-7cae-4894-8d34-2e9c53419bc3> ;
            sdo:inDefinedTermSet <http://w3id.org/openeduhub/vocabs/learningResourceType/> ;
            sdo:name "Anderer Ressourcentyp"@de,
                "other"@en ] ;
    sdo:name "Teure Schnäppchen"@de ;
    sdo:url <https://media.sodis.de/open/edeos/Teure_Schnaeppchen.mp4> .
```

As we can see we have some metadata already provided here, but not the educational subject.
But running a platform to search for educational resources providing the subject is crucial to help learners and teachers the material they need.
So what can we do to get the subject based on the data we already have?

## Link not label

A promising approach is to enrich the keyword literals with links to keyword vocabularies.
Since we already got some keyword vocabularies, we can go through these and link the keyword strings to the [EAF-Schlagwortverzeichnis](https://github.com/openeduhub/oeh-metadata-eaf-schlagwortverzeichnis) and [EAF-Sachgebietssystematik](https://github.com/openeduhub/oeh-metadata-eaf-sachgebietssystematiken).
This way we might not only get links to these systematics, but also draw conclusions on which subject the resource is about.

We can do the same with the other vocabularies we have as the keywords sometimes also contain entries like "Arbeitsblatt", "Quiz", "Klasse 8", etc. 
These keywords link to learning resource types, educational levels.
During the crawling process we can then enrich the metadata using the links between our vocabularies. Nice!

Currently I'm in the process of exactly doing that. Just wanted to write that down and will elaborate on it in a upcoming post!