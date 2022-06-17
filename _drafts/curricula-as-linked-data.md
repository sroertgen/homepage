# Lehrpläne als Linked Open Data


## Die Herausforderung

Im Schulbereich, in der Hochschule, aber auch in vielen anderen Bereichen, in denen Bildung systematisch vermittelt wird, existieren Lehrpläne, die beschreiben, welche Wissen in einem bestimmten Bereich vermittelt werden soll.
Diese Lehrpläne dienen somit einerseits als Beschreibung und Systematisierung von Wissenszusammenhängen, andererseits auch als Referenz für Lehrende und Lernende, an denen Unterricht organisiert wird.
Sie dienen als systematische Zusammenhänge, um abhängig von Klassenstufe und Bildungseinrichtung die Lerninhalte und Lernziele zu definieren.

Im Projekt wirlernenonline.de, das im Zuge der COVID-19-Krise entstanden ist, hat sich gezeigt, dass vor allem Lehrende auch innerhalb dieser Systematiken Material erstellen, dieses aufeinander beziehen und einordnen.
Andere Lehrende suchen wieder innerhalb dieser Lehrpläne Material und auch Lernende können darin suchen, da sie oft wissen, welche Themen in dem Schuljahr behandelt werden.
In einer Suche ist dieser Zugang für die Suchenden oft sogar eher gewünscht, als über die klassischen Filterkriterien, wie beispielsweise "Materialtyp" (learning resource type), da der Materialtyp für die Wissensvermittlung oft nicht primär ist.

Um eine Materialzuordnung über Lehrpläne ermöglichen zu können, ist jedoch eine wichtige Voraussetzungen nötig:

    - Die Lehrpläne müssen in maschinenlesbarer Form vorliegen.

Dies ist leider in der Digitalisierungswüste Deutschland nicht der Fall und mir ist bis jetzt auch keine offizielle Initiative bekannt, die sich dies zur Aufgabe gemacht hat.
Es gibt jedoch Einzelpersonen, die aus Eigeninitiative heraus Anstrengungen unternehmen, sich bei der Digitalisierung der Lehrpläne zu vernetzen.
Dabei ergeben sich verschiedene Herausforderungen:

    - 16 Bundesländer mit verschiedenen Lehrplänen
    - unterschiedliche Vorlieben in  der Form maschinenlesbarer Abbildungen von Wissen (XML, JSON, ...)
    
Darüber hinaus ergibt sich (für mich) die Anforderung, dass die maschinenlesbaren Abbildungen miteinander kompatibel sein müssen.
Nur wenn es ein grundlegendes gemeinsames Modell gibt, können die Lehrpläne auch miteinander verknüpft werden.
Aber warum ist diese Verknüpfung wichtig und wünschenswert?

## Mehrwert von Lerhplänen als Linked Open Data

Ein Beispiel: (TODO eventuell nach vorne als Einstieg?)
Ina ist Chemielehrerin, hat bereits von OER gehört und veröffentlich ihre Materialien gerne online.
Ihr Bundesland gehört bereits zu den digitalen Vorreitern und stellt ihr dafür ein Repositorium zur Verfügung, in dem sie Material hochladen, dies mit einer offenen Lizenz kennzeichnen sogar so veröffentlichen kann, dass es von anderen Menschen auf dem Repositorium gefunden werden kann. Klasse!
Ihr Bundesland stellt auch eine digitale Abbildung des Lehrplans zur Verfügung und sie kann ihr Material genau einer Klassenstufe und einem Themenbereich in ihrem Lehrplan zuorndnen.
So finden es andere Lehrer:innen schnell, wenn sie Material für ihren Unterricht suchen.

Alle Lehrer:innen? Nein, nicht alle!

Anja aus ihrem Nachbarbundesland hat einen anderen Lehrplan und kann kennt sich in dem Lehrplan von Ina nicht aus.
Selbst wenn sie sich die Mühe macht und das Repositorium ihrer Kollegin durchforstet, findet sie das Material nicht oder eventuell erst nach langer Zeit, da sie sich mühevoll durch den Lehrplan klicken muss.
Wäre es nicht schön, wenn Anja einfach in ihrem Lehrplan suchen könnte und dort automatisch Inas Material findet?

Das wäre schön! Und ich möchte nun einen Weg vorstellen, wie wir das schaffen!

## Was ist dieses Linked Open Data?

Tim Berners-Lee, der Erfinder des World Wide Web, wie wir es kennen, hat einen Vorschlag unterbreitet, wie Daten im Internet maschinenlesbar werden. 
Dieses Konzept ist unter dem Bergriff "Semantic Web" bekannt.
Kurz gesagt werden unter diesem Begriff Standards und best-practices gesammelt um Daten und die Bedeutung dieser Daten über das Web zu teilen und für Anwendungen zugänglich zu machen.
Um diese Daten zu organisieren wurde das "Resource Description Framework" (RDF) eingeführt, ein Datenmodell zur Abbildung und guten Verwaltung von verteilten Daten.
Das Modell basiert dabei auf der Idee Aussagen über Dinge (i.e. Daten) in der Form von *Subjekt*-*Prädikat*-*Objekt* zu treffen.



- kann in unterschiedlichen Formaten serialisiert werden.

### TODO was ist RDF?

"Linked", also verknüpt werden diese Daten dadurch, dass wir Verknüpfungen, also Hyperlinks zu anderen Daten einfügen.

Dabei werden von Tim vier Prinzipien genannt, die bei der Verlinkung helfen:

    1. Benutzen Sie Uniform Resource Identifiers (URIs) als Namen für Dinge.
    2. Benutzen Sie HTTP URIs, so dass diese Namen nachgeschlagen werden können.
    3. Wenn jemand eine URI nachschlägt, liefern Sie nützliche Informationen und nutzen Sie dabei die Standards (RDF*, SPARQL).
    4. Fügen Sie Links zu anderen URIs bei, so dass der User weitere Dinge entdecken kann. 
    

Wie könnte das im Bildungsbereich aussehen?

Trotz aller Unterschiede zwischen den Bundesländern gibt es Gemeinsamkeiten, welche könnten das sein?

    - Klassenstufen
    - Fächer (eventuell mit anderen Bezeichnungen, aber es gibt schon große Überschneidungen)
    - Bildungsbereich (Elementarbereich, Primarstufe, Sekundarstufe,...)
    
Das ist doch schonmal was!
Bevor wir nun also einen Lehrplan definieren, könnten wir diese übergreifenden gemeinsamen Daten defnieren, um darauf zu rekurrieren.
Wie machen wir das?


##  SKOS zur Defition von Vokabularen

Um genau so etwas zu tun, wurde der Standard [SKOS](https://www.w3.org/TR/swbp-skos-core-guide/) geschaffen (Die DINI-KIM-AG hat [hier](https://dini-ag-kim.github.io/skos-einfuehrung/#/) eine tolle deutsche Einführung verfasst).
SKOS steht dabei für **S**imple **K**nowledge **O**rganization **S**ystem. 
Ist also nicht so schwer.
SKOS hilft dabei kontrollierte Vokabulare zu erstellen, das heisst, es hilft festzulegen, welche Werte wir für einen bestimmten Daten-, bzw. Wissensbereich verwenden wollen.
Es 
