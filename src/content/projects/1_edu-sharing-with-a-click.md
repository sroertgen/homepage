---
title: "Edu-Sharing with a click"
date: "2019-08-28"
link: "https://github.com/sroertgen/edu-sharing-with-a-click"
---

Im Rahmen des OER- und IT-Sommercamps in Weimar habe ich eine kleine Python-Flask-App entwickelt, die eine Installation von [edu-sharing](www.edu-sharing) (eine Open-Source Bildungscloud) mit automatischer Anbindung einer Moodle-Instanz durchführt. Das Projekt basiert auf [Vorarbeiten der TIB Hannover](https://github.com/TIBHannover/edu-sharing-box) und wurde um die automatische Moodle-Anbindung erweitert, die von der TIB in das Projekt aufgenommen wurde.

---

Hier die Kopie eines Blog-Artikels dazu aus dem [Jointly-Blog](https://jointly.info/announcement/edu-software-mit-einem-klick-hack4oer-im-sommercamp/):

Auf dem OERcamp 2019 Lübeck, das vom 13.6. – 14.6. stattfand, hat sich in Gesprächen mit einzelnen Teilnehmer:innen ergeben, dass einige Lehrpersonen an ihrer Schule bereits gerne Software wie edu-sharing, Moodle oder WordPress zur Bereitstellung von Lerninhalten oder Kursen benutzen möchten, jedoch oft sowohl Linux-Kenntnisse fehlen und die IT-Infrastruktur an der jeweiligen Schule noch nicht so weit ist. Teilweise wurden sich deshalb mühevoll nach der Arbeitszeit IT-Kenntnisse angeeignet und mit Hilfe von Tutorials erlernt, diese Software auf eigens betriebenen Servern zu installieren.

Aufbauend auf diesen Erfahrungen und mit Hilfe der TIB Hannover, die in ihrem Projekt „OER-Portal Niedersachsen“ Ansible-Skripte zur automatischen Installation von edu-sharing oder Moodle bereitstellen (https://github.com/TIBHannover/edu-sharing-box und https://github.com/TIBHannover/moodle-box), wurde daher im Rahmen des OER- und IT-Sommercamp-Hackathons eine kleine Web-App prototypisch entwickelt, die das Installieren und Bereitstellen von edu-sharing, Moodle oder WordPress erleichtern soll (https://github.com/sroertgen/edu-sharing-with-a-click). In dieser Web-App müssen lediglich IP-Adresse(n), ggf. Domain, Username und Passwort eingetragen werden, um eine entsprechende Instanz auf einem Server zu installieren. Außerdem wurden die Skripte so erweitert, dass eine automatische Anbindung von Moodle an das edu-sharing Repositorium erfolgen kann. Diese Funktion wurde mittlerweile auch in die Skripte der TIB Hannover integriert.

Wer keinen eigenen Server zur Verfügung hat oder betreiben möchte, kann die Software auch lokal ausprobieren und mit Hilfe der Vagrantfiles der TIB Hannover auf seinem eigenen Rechner lokal installieren und testen.

Auch wenn das Nutzen der entsprechenden Skripte immer noch IT-Kenntnisse erfordert, wurden durch die Skripte die Installation von edu-sharing und Moodle stark vereinfacht sowie eine automatisierte Anbindung der Systeme ermöglicht, so dass je nach Serverkonfiguration eine edu-sharing Umgebung inklusive Moodle innerhalb von 30-45 Minuten vollautomatisch eingerichtet werden kann. So kann einigen Schul-Admins zukünftig hoffentlich die Arbeit erleichtert werden.

Wem auch das alles (verständlicherwiese) noch zu kompliziert ist, dem sei außerdem ein Blick zur [moodlebox](https://moodlebox.net/de/) ans Herz gelegt.

