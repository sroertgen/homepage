---
title: "Weiterentwicklung der OER-Kurs-Vorlage"
date: "2019-11-22"
link: "https://gitlab.com/sroertgen/course-metadata-test"
---

Rückblickend hat mit diesem kleinen Projekt wohl meine Liason mit dem Thema Metadaten begonnen. 
Hier bin ich zum ersten Mal durch Slides von [Jens Lechtenbörgers Ansatz der OER-Kurserstelleung](https://gitlab.com/sroertgen/course-pandoc-preparation) mit dem Thema RDFa und der Bedeutung von Maschinenlesbarkeit von Metadaten in Kontakt gekommen.
Aufbauend auf einem Projekt von Axel Klinger habe ich seine OER-Kursvorlage überarbeitet und eine einfache Möglichkeit zur Einbettung von maschinenlesbaren Lizenzhinweisen eingefügt.

---

Auf dem OER-Camp Lisum hat [Axel Klinger](https://twitter.com/axel_klinger) [seine OER-Kursvorlage](https://gitlab.com/TIBHannover/oer/course-metadata-test) vorgestellt.
Mittels einer gitlab-ci-Pipeline und einem Pandoc-Docker-Container werden aus einer Markdown-Datei eine HTML-, PDF- und EPUB-Datei erzeugt.
Dabei werden automatisch Metadaten in den HTML-Header eingefügt sowie für Wikimedia-Bilder automatisch Lizenzhinweise in das generierte Dokument eingefügt.

Ich habe den [Docker-Container](https://gitlab.com/sroertgen/course-pandoc-preparation) noch etwas erweitert, sodass die Lizenzen auch maschinenlesbar eingefügt werden.

Außerdem habe ich, inspiriert von [Jens Lechtenbörgers Ansatz der OER-Kurserstelleung](https://gitlab.com/sroertgen/course-pandoc-preparation), die Möglichkeit eingefügt, auch Lizenznachweise für Bilder einzufügen, die nicht von Wikimedia stammen. Metadaten über die Bilder können in einem `image`-Ordner folgendermaßen hinterlegt werden:

 - es muss eine Datei mit demselben Namen des Bildes erstellt werden, die aber die Endung `.meta` besitzt (z.B. für das Bild `cat.jpg` wäre es `cat.meta`). Die folgenden Attribute stehen dabei zur Verfügung:

```yaml
  image_title: Brown Cat With Green Eyes
  image_author: Kelvin Valerio
  image_author_link: https://www.pexels.com/@kelvin809
  license_url: https://creativecommons.org/publicdomain/zero/1.0/
  license_short_name: CC0
  dcsource: https://www.pexels.com/photo/adorable-animal-blur-cat-617278/
  sourcetext: Pexels
  # additional alt text, otherwise use image_title
  image_alt: Eine schöne Katze
  # for information about modification/provenance 
  imageadapted: Größe verringert.
  
  # indicate special permissions/disclaimers
  # information about provenance of image should be provided if image got adapted (schema:isBasedOnUrl)
  isBasedOn: https://www.pexels.com/photo/adorable-animal-blur-cat-617278/

  # if these fields are filled out, there will be additional information text generated
  # to acknoledge to the original source
  original_title: Original Titel

  original_author: Original Autor

  original_author_link: https://www.original-autor.de

  original_license_url: https://creativecommons.org/publicdomain/zero/1.0/

  original_license_short_name: CC0

  # indicate special permissions/disclaimers (cc:morePermissions)
  permit:

  # reproduce copyright notice of source
  copyright:
```
