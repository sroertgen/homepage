---
title: "Linked Frameworks"
date: "2020-08-28"
link: "https://github.com/sroertgen/oeh-linked-frameworks"
---

[Link to GitHub-Repo.](https://github.com/sroertgen/oeh-linked-frameworks)


## Why?

Frameworks in Germany are currently not published machine-readable. That is very sad. Institutional learning takes always place in some kind of framework/curriculum and teachers are very used to them. Therefore material published should be able to be assigned to a certain framework or certain parts of it. Teachers (and students) would also be helped to be able to use framework data as a filter, when searching for teaching/learning material.

To accomplish this framework data has to be machine-readable.

Currently there are few dedicated persons coming together thinking about publishing their state-wide school curriculums data machine-readable. Though there is yet no common schema to be used and people coming from different backgrounds hae different likings writing down their curriculum (mainly XML or JSON).

This is why I want to propose the idea of jumping into the Semantic Web World!

Analyzing the current situation I see the following benefits:

- high interoperability
- free to choose serialization format
- AAA-approach (Anyone can say anything about any topic): though we have dedicated people it might be hard to fast decide on a model really going for everyone. Living in the semantic world this is no problem. We can easily add relations later on and connect the models
- We more or less get the API for free. Modelling based on RDF, we can easily load our data in some triple store and connect some Sparql endpoint to it (it is really quite easy!). All our data is there and there is a huge ecosystem of libraries in each programming language to make use of it
- Other big public players are already in the game. The European Union developed [ESCO](https://ec.europa.eu/esco/portal/home), a European wide multillingual classification of Skills, Competences, Qualifications and Occupations.
- --> Just imagine the possibilities when connecting frameworks to this catalogue and the ecosystem of apps being able to guide students to the job they want
- one of the **biggest benefits** of this approach is the ability of easy drawing relations. In Germany we have 16 states, each having their own curriculums, but of course the content is widely overlapping (is has to be for the nation wide Abitur to work). Now think of this: Teachers are knowing their state curriculum very well, it's their daily working basis. If we provide them a solution to upload material they want to share and they are willing to attach some metadata to it, like framework information, teachers teaching the same aspect of the curriculum can find it easily. **BUT NOW THINK OF THAT**: If we draw relations in the background between the frameworks a teacher/learner from another state can even find material  in HER state curriculum that was not originally attached there. Due to the linked data technology and the relations drawn it can show up there and so make life of every teacher/learner easier.


## So what did I build?

It's basically a tool for visualizing framework data.
Since there was no machine readable data, I crawled one state (Bavaria, since they have a [nice structured website](https://www.lehrplanplus.bayern.de/)), processed the data and put it into [some rdf compatible model](https://sroertgen.github.io/oeh-framework-bayern/) I developed. I heavily reused ideas proposed in the [k12ocx](https://k12ocx.github.io/k12ocx-specs/) project.

With that data I was able to set up a triple store using [Apache TDB](https://jena.apache.org/documentation/tdb/) and connect some SPARQL-endpoint to it using [Apache Fuseki](https://jena.apache.org/documentation/fuseki2/).

Now the Sparql endpoint was ready at hand waiting to be queried...

People like to see things, so what would be more appropriate for a linked data app than to build some visualization tool, to display the data? So I set up some React app, making queries to the endpoint with the help of the communica tool [@comunica/actor-init-sparql](https://www.npmjs.com/package/@comunica/actor-init-sparql) and visualizing them with [VisJs Network](https://visjs.github.io/vis-network/docs/network/), actually using [react-graph-vis](https://github.com/crubier/react-graph-vis#readme).

As a direct SPARQL-GUI is also nice, I attached [YASGUI](https://triply.cc/docs/yasgui-api#using-yasgui-in-react) to be able to explore the model (YASGUI -> YET ANOTHER SPARQL GUI, got to love that. Actually I did not find so many well documented ones, so I'm happy for further suggestions, though I'm totally happy with YASGUI).

## Run it

I packed everything in Docker containers, so you can test this app easily on your local machine. Do this:

1. [Get Docker](https://docs.docker.com/get-docker/)
1. clone this repo witch `git clone https://github.com/sroertgen/oeh-linked-frameworks.git`
1. cd into the repo and run `docker-compose up`
1. go to <http://localhost:1337>
1. click on `ADD` and select something. you can also add multiple selections.
1. click `BUILD GRAPH`. Hopefully something will happen and you see the framework data for your selection.
1. Play around, report bugs.
1. Cancel with `Ctrl-c` and run `docker-compose down`.

This is of course just the first part. I will continue to get some other curricula data and then draw relations between the graphs to show the big benefits of using this approach.

