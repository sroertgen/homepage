---
title: "Docker hOERnchen 2.0"
date: "2020-03-25"
link: "https://github.com/sroertgen/oerhoernchen20_docker"
---


Dies ist eine Weiterentwicklung des Ansatzes von [Matthis Andrasch](https://twitter.com/m_andrasch) Prototypen eines OER-Indexes ([oerhoernchen20](https://github.com/programmieraffe/oerhoernchen20)).
Ich habe eine ETL-Pipeline erstellt, die Inhalte von anderen Repos crawlt, die Metadaten in einer Datenbank speichert und anschließend in eine Elasticsearch-Instanz überführt.
Das gesamte Projekt ist dockerisiert und lässt sich dadurch einfach nachnutzen und weiterentwickeln. 
Teile des Projektes und der Ideen werden von der TIB Hannover in ihrem Projekt [ "OER Search Index" ](https://gitlab.com/TIBHannover/oer/oersi-setup) und dem Projekt [wirlernenonline.de](https://wirlernenonline.de) ([Git-Repo](https://github.com/openeduhub)) nachgenutzt.

---

## Details (from README)

This project is a dockerized version of the [oerhoernchen20](https://github.com/programmieraffe/oerhoernchen20) made by [Matthias Andrasch](https://twitter.com/m_andrasch). It tries to combine the central OER search engine approach proprosed by Matthias with the [personalized search engine](https://ebildungslabor.de/blog/oersuchtool/) approach proposed by [Nele Hirsch](https://twitter.com/eBildungslabor) as it is also possible to insert ones own data to the search engines index.

The general idea of this prototype is to establish a example pipeline of how a OER search engine could work.

This **PROTOTYPE** is based on the following technologies all packed into docker-containers (beside the the scapy-crawler):

- **Scrapy**: First OER repositories are crawled using **[Scrapy](http://scrapy.org/)**. Currently the following repositories are crawled:

  - [HOOU](https://www.hoou.de/)
  - a bit of [OERinfo](https://open-educational-resources.de/)
  - [TIB-AV-Portal](https://av.tib.eu)
  - [digiLL](https://digill.de/)
  - [OpenRUB](https://open.ruhr-uni-bochum.de)
  - [HHU-Mediathek](https://mediathek.hhu.de/)
  - MOOCs of [oncampus](https://www.oncampus.de/)
  - [ZOERR](https://uni-tuebingen.oerbw.de)

  Entries without a proper license are skipped and not stored). The results are stored in a MySQL database.

- **MySQL**: Used to store the results of the crawl.
- **Logstash**: Logstash is regulary checking the MySQL database, if any new items are added or changes are made to existing entries.
- **Elasticsearch**: Elasticsearch is the search engine and indexes the input it gets from Logstash.
- **VueJS**: The WebApp is made with VueJS and using [ReactSearch](https://docs.appbase.io/docs/reactivesearch/vue/overview/QuickStart/) to connect to Elasticsearch. It provides the user interface to make search queries or add items to Elasticsearch. It is deployed using Nginx, which also provides some reverse proxy services to connect the App with the Docker network.

## Run it locally

### OERhörnchen 2.0

- make sure you have git installed (<https://www.atlassian.com/git/tutorials/install-git>)
- make sure you have [Docker installed](https://docs.docker.com/install/)
- `git clone`
- `cd oerhoernchen20_docker/docker_hoernchen`
- `docker-compose up` this may take a while on the first run as some images will have to be build.
- after a few minutes you should be able to go to <http://localhost> and see your "OERhörnchen 2.0" instance ready (if it still says "Loading entries" you might just have to wait a bit longer)

- (for DockerPros: Don't get confused with the indexer-contaier throwing some errors at the beginning. It is started right at the beginning and looking for Elasticsearch, even if it's not ready yet. It stops throwing errors after a minute or so. Have to fix this, shouldn't be too complicated.)

### Crawler

- make sure you have python3 installed (<https://docs.python-guide.org/starting/install3/osx/>)
- go to project root
- `cd oer_scrapy`
- `python -m venv oerhoernchen`
- `source oerhoernchen/bin/activate`
- `pip3 install -r requirements.txt`
- crawler can be run with `scrapy crawl hoou_spider`. It assumes that you have the MySQL database running, so you should run the `docker-compose up` command from before.


## Metadata

- The mapping in Elasticsearch currently uses the LRMI as used by the HOOU [LRMI (Learning Resource Metadata Initiative)](https://www.dublincore.org/specifications/lrmi/lrmi_terms/).

## Additional notices

### Sitemaps for the crawler

- ZOERR: <https://uni-tuebingen.oerbw.de/edu-sharing/eduservlet/sitemap?from=0#osds>

### Database

#### Creating a mysql database dump with docker container

- `docker exec some-mysql sh -c 'exec mysqldump --all-databases -uroot -p"$MYSQL_ROOT_PASSWORD"' > /some/path/on/your/host/all-databases.sql`

### Vue Hörnchen

#### Ressources

- <https://docs.appbase.io/docs/reactivesearch/vue/overview/QuickStart/>
- [Getting started guide](https://opensource.appbase.io/reactive-manual/getting-started/reactivebase.html)

### Multiple database inputs via logstash

- <https://stackoverflow.com/questions/37613611/multiple-inputs-on-logstash-jdbc>

### Duplicate detection

- logstash Fingerprint vor duplicate detection?
  - <https://www.elastic.co/de/blog/logstash-lessons-handling-duplicates>
  - <https://www.elastic.co/de/blog/efficient-duplicate-prevention-for-event-based-data-in-elasticsearch>

## License

Just take it.

<p xmlns:dct="http://purl.org/dc/terms/" xmlns:vcard="http://www.w3.org/2001/vcard-rdf/3.0#">
  <a rel="license"
     href="http://creativecommons.org/publicdomain/zero/1.0/">
    <img src="http://i.creativecommons.org/p/zero/1.0/88x31.png" style="border-style: none;" alt="CC0" />
  </a>
  <br />
  To the extent possible under law,
  <a rel="dct:publisher"
     href="https://github.com/sroertgen/oerhoernchen20_docker">
    <span property="dct:title">Steffen Rörtgen</span></a>
  has waived all copyright and related or neighboring rights to
  <span property="dct:title">Docker-Hoernchen 2.0</span>.
This work is published from:
<span property="vcard:Country" datatype="dct:ISO3166"
      content="DE" about="https://github.com/sroertgen/oerhoernchen20_docker">
  Deutschland</span>.
</p>
