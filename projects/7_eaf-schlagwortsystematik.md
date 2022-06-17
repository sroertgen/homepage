---
title: "Crawling & Skosifying der EAF-Schlagwortsystematiken"
date: "2020-05-04"
link: "https://github.com/openeduhub/oeh-metadata-eaf-schlagwortsystematiken"
---

Im Zuge des [OpenEduHub-Projektes](https://github.com/openeduhub) wurden die Schlagwortsystematiken der [AG-MUD](http://agmud.de/fachsystematiken/) von rtf-Dateien in kontrollierte Vokabulare auf Grundlage des SKOS-Standards überführt.

Die rtf-Dateien wurden dazu zunächst in txt-Dateien konvertiert, welche anschließend mit einem Python-Skript SKOS-konform in Turtle-Files serialisiert wurden. 

Diese wurden anschließend mit Hilfe des Tools [ SkoHub-Vocabs](https://github.com/hbz/skohub-vocabs) veröffentlicht. 
Dafür wurde das Tool dockerisiert und mittels einer GitHub-Action wird bei jedem Commit in das Repo auf dem `gh-pages`-Branch die Seite mit dem jeweils aktuellem Vokabular gebaut (siehe [hier](https://openeduhub.github.io/oeh-metadata-eaf-schlagwortsystematiken/), [hier das workflow-file für die Action](https://github.com/openeduhub/oeh-metadata-eaf-schlagwortsystematiken/blob/master/.github/workflows/main.yml)). 

Die Rohdaten in den rtf-Dateien sind teilweise jedoch etwas inkonsistent und benötigen eine Überarbeitung, um diese produktiv verwerten zu können. 

Ein Vorteil läge beispielsweise darin, dass ETL-Prozesse diese Vokabulare nutzen können, um Materialien mit Metadaten anzureichen. Ein simples, reduziertes Beispiel: Wenn in einem Material häufig das Wort "Laubbaum" vorkommt, könnte sich im ETL-Prozess an der Systematik vom Begriff "Laubbaum" bis zum Begriff "Biologie" hochgehangelt werden, sodass diese Metadaten dem Material beigefügt werden könnten, um es in einer Suche besser auffindbar zu machen.
