---
title: "Maschinenlesbare CC-Lizenz"
date: "2019-11-22"
link: "https://gitlab.com/sroertgen/maschinenlesbare-cc-lizen"
---

Dieses Projekt ist ebenfalls im Zuge des OER-Camps Lisum entstanden und beschäftigt sich ebenfalls mit der Frage, wie maschinenlesbare Lizenzinformationen in Materialien hinterlegt werden können.

---

Die CC-Lizenzen basieren auf einem Dreischichten-Konzept:

- Lizenzvertrag: Traditionelle Lizenz, die in der Ausdrucksweise der Juristen gehalten ist.
- Commons Deed: Die menschenlesbare Lizenz, die auf praktische Art und Weise von Lizenzgeber:innen und Lizenznehmer:innen verwendetet werden kann
- CC Rights Expression Language (CC REL: Maschinenlesbare Lizenz für Suchmaschinen und Software).

In reinem Markdown können bisher keine maschinenlesbaren Lizenzinformationen hinterlegt werden, daher wurde ein Template erstellt, das zeigt, wie diese als HTML in eine Markdown-Datei eingefügt werden können, e.g.:

```html
<div about="https://i.imgur.com/WiYXnnp.jpg" class="figure"> 
 <img src="https://i.imgur.com/WiYXnnp.jpg" alt="Brown Cat With Green Eyes" /> 
 <span property="dc:title">Brown Cat With Green Eyes</span> 
 by <a rel="cc:attributionURL dc:creator" href="https://www.pexels.com/@kelvin809" property="cc:attributionName">Kelvin Valerio</a> under <a rel="license" href="https://creativecommons.org/publicdomain/zero/1.0/">CC 0</a> from <a rel=\"dc: source\" href="https://www.pexels.com/photo/adorable-animal-blur-cat-617278/">Pexels</a>

</div>
```

Mehr Informationen gibt es in der README des Repos.
