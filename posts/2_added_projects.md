---
title: "Projects added!"
date: "2020-06-09"
---

Hello there,

I added projects I've done or am still working on to the project part of this site.
When I was in school, we encouraged students to create their own portfolio to make learning progress visible and show them all the great things they had already achieved.
I should have done this earlier as it is very nice and sometimes quite insightful to see, what one has been working on.
Figured out that my interest in metadata started with an presentation of Jens Lechtenbörger at DELFI 2019 (which I unfortunatley had no chance to attend) about [ licecense attribution for OER with emacas-reveal ](https://lechten.gitlab.io/talks-2019b/2019-09-19-DELFI.html#/sec-title-slide).

Jens embeds the license information with [RDFa](https://www.w3.org/MarkUp/2009/rdfa-for-html-authors) directly in the slides.
The metadata itself is taken from *.meta-Files, which he puts in an image folder.
When rendering the org-file with emacs-reveal the information gets read out and inserted into the rendered html.

While this approach is genius, I struggled with it, because it was just available with using [ org-mode ](https://orgmode.org/) of [Emacs](https://www.gnu.org/software/emacs/).
As he states correctly, org-mode is a lightweight markup-language.
The problem is that emacs is not an editor you can recommend to anyone, who is not in tech, as it quite has a steep learning curve to learn all the keybindings and stuff.
Because of this I took the opportunity at a small hackathon-like event at [OERcamp Lisum](https://www.oercamp.de/werkstatt/berlin/) and converted this approach to be usable with Markdown and GitLab.

As with Jens' approach you can add *.meta-Files in an image folder and provide metadata there, e.g.: 

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

The markdown-file gets then piped through a GitLab-CI-Pipeline, where a python-script checks if respective meta-files are there and adds the metadata information in the markdown file.
Afterwards the file is converted with pandoc to an html-Document.

Well, so this was where I got my feet wet with RDFa first though I did not fully understand it at that time.
Now, half a year later, I'm planning to provide an approach on how information about competencies can be embedded in learning resources using it.

More on that in a next post.
