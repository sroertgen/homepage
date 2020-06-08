---
title: "Crawling & Skosifying der EAF-Sachgebietssystematiken"
date: "2020-05-04"
link: "https://github.com/openeduhub/oeh-metadata-eaf-sachgebietssystematiken"
---

Im Zuge des [OpenEduHub-Projektes](https://github.com/openeduhub) wurden die Sachgebietssystematiken der [AG-MUD](http://agmud.de/sachgebietssystematik/) von einer Excel-Datei in ein kontrolliertes Vokabular auf Grundlage des SKOS-Standards überführt.

Die Excel-Datei wurde dazu zunächst in eine txt-Datei konvertiert, welche anschließend mit Python in einem Jupyter-Notebook SKOS-konform in ein Turtle-File serialisiert wurde.

Diese wurden anschließend mit Hilfe des Tools [ SkoHub-Vocabs](https://github.com/hbz/skohub-vocabs) veröffentlicht. 
Dafür wurde das Tool dockerisiert und mittels einer GitHub-Action wird bei jedem Commit in das Repo auf dem `gh-pages`-Branch die Seite mit dem jeweils aktuellem Vokabular gebaut (siehe [hier](https://openeduhub.github.io/oeh-metadata-eaf-sachgebietssystematiken/), [hier das workflow-file für die Action](https://github.com/openeduhub/oeh-metadata-eaf-sachgebietssystematiken/blob/master/.github/workflows/main.yml)). 

Ein Vorteil läge beispielsweise darin, dass ETL-Prozesse diese Vokabulare nutzen können, um Materialien mit Metadaten anzureichen. Ein simples, reduziertes Beispiel: Wenn in einem Material häufig das Wort "Laubbaum" vorkommt, könnte sich im ETL-Prozess an der Systematik vom Begriff "Laubbaum" bis zum Begriff "Biologie" hochgehangelt werden, sodass diese Metadaten dem Material beigefügt werden könnten, um es in einer Suche besser auffindbar zu machen.
