---
title: "RDF star and SPARQL star tried out"
date: "2021-03-13"
---

This blog post is still a bit in progress, but I had to put it out here!

<!-- ## TODO add Topics covered in this blog post -->

I recently stumbled across a blog post of Olaf Hartig concerning [progress on RDF* and SPARQL*](https://www.w3.org/community/rdf-dev/2020/12/22/progress-towards-rdf-star-and-sparql-star-community-report/).
Having heard about it already for a few times, I took that as a opportunity to find out, what it is about and thinking about possible use cases for my work.
Of course you can just go ahead and read the original article, but I will write it out here for me.
Explaining stuff to others is the most effective way to learn something is what they told us (and I think it's true.)

## What it is about?

So the general idea is this: RDF* wants to extend the RDF data model in a way to use statements as a subject or object of a RDF triple.
In RDF a statement consists of three things: "Subject, predicate, object ."(I think my history as a philologist also somehow drives me to RDF).
What does it mean to use a statement as a subject or object in natural language?
Lets get concrete:

"Peanuts are nuts" says Alice.

This sentence could be reshaped to:

Alice says "Peanuts are nuts".

This way we get the prototype sentence structure of subject-predicate-object, whereby our object itself is a sentence of the form subject-predicate-object.
This is a statement about a statement.
Nice.
But what do we need it for?

## What do we need  it for?

Olaf Hartig states that this is especially useful "[...]including the annotation of statements with certainty scores, weights, temporal restrictions, and provenance information"[TODO LINK EINFÜGEN].
So in our case we are using it for provenance information.
Olaf also proposed a syntax for making these statements in Turtle*[TODO LINK EINFÜGEN]:

```turtle
:alice :says <<:peanut a :nut>> .
```

The triple a statement is made about is included in double angle brackets.
So far so good!
*BUT PEANUTS BELONG TO THE BEAN FAMILY* you might be shouting already.
Fine.
Let's do this in RDF*:

```turtle
:bob :says <<:peanut a :bean>> .
```

Satisfied?
Good!
But who is right now?
Well let's look it up on wikipedia:

*"the peanut belongs to the botanical family Fabaceae; this is also known as Leguminosae, and commonly known as the bean, or pea, family."* [^1] 

[^1]: https://en.wikipedia.org/wiki/Peanut

Seems Bob is right.
Let's add that wikipedia statement to our graph:

```turtle
:wikipedia :says <<:peanut a :bean>> .
```

At this time you may say: Ok, that's nice. But do these statements imply peanut is a nut *AND* peanut is a bean?
The answer is: Neither nor.
The statements are just what they are: Statements about statements and nothing more.
*BUT* if you want to do so, Turtle* gives you the possibility to do so:

```turtle
:wikipedia :says  {|:peanut a :bean|} .
```

Which is equivalent to:

```turtle
:peanut a :bean .
:wikipedia :says  <<:peanut a :bean>> .
```

## What about SPARQL*?

We all know that RDF at best half the fun without SPARQL.
Let's have a look at how to query RDF*.
First let us take the previous statements (without the very last) as our example data:

```turtle
:alice :says <<:peanut a :nut>> .
:bob :says <<:peanut a :bean>> .
:wikipedia :says <<:peanut a :bean>> .
```

To query for all statements stated we can do the following:

```sparql
SELECT ?statement 
WHERE {
    ?s :says ?statement .
}
```

Using arq we get the following results (See [below](#current-implementations) for current implementations of the *-syntaxes)
TODO add links to data and queries.

```bash
--------------------------------
| statement                    |
================================
| << :peanut rdf:type :bean >> |
| << :peanut rdf:type :bean >> |
| << :peanut rdf:type :nut >>  |
--------------------------------
```

This is in line with what we should expect.
The statement as the object of the triple is itself a triple.

But can we use the double-angle-bracket style syntax in our queries?

```sparql
SELECT ?a ?b ?c

WHERE {
    ?a :says <<?b a ?c>> .
}
```

Yes, we can. But unfortunatley we won't get any result using arq.
That surprised me, because looking at the RDF* GitHub-Repository Jena was mentioned to have implemented the Syntax: https://github.com/w3c/rdf-star/
So I took the opportunity to ask a question of the Apache Jena Mailinglist, which is quite active with a kind community:

https://lists.apache.org/thread.html/r2944520e578850bc9119c26a4131d5ea091ebbac267d0a734d033986%40%3Cusers.jena.apache.org%3E

So the thing is, currently the SPARQL* implementation in Jena seems to be wrong in that aspect that queries won't be matched unless the base triple has been asserted.
Andy also mentioned SPARQL* being in PG-mode.

I already read this abbreviation in the table of the GitHub-Repo, but, to be honest, just did not look them up.
So gotten in a typical RTFM case, I took the opportunity and read about the distinction here:

https://w3c.github.io/rdf-star/cg-spec/editors_draft.html#sa-mode-and-pg-mode

So SA mode is for "Seperate Assertion" mode and means that an embedded triple is not asserted (like already talked above).
PG mode on the other stands for "Property Graph" mode and took every embedded triple also as being stated.

To get the best out of these two worlds the Turtle star syntax was extended with the above mentioned functionality to distinguish between embedded triples being asserted and those being not (To repeat: embedding with assertion with `{|:a :b :c|}` and just embedding with `<:a :b :c>` ).

As stated in the RDF star editor draft with the  Turtle Star Syntax extension the need for different modes was removed.

So still  wanting to see if this query works, we will have to try out some other Triple Store.
Bob Du Charme, the author of "Learning SPARQL" (http://www.learningsparql.com/), mentions in his blog post about [RDF* and SPARQL*](http://www.snee.com/bobdc.blog/2018/05/rdf-and-sparql.html) that he used [Blazegraph](https://blazegraph.com/).
Blazegraph has a [quick start guide](https://github.com/blazegraph/database/wiki/Main_Page), which helps you get it running locally in seconds.

After downloading it we basically just have to run `java -server -Xmx4g -jar blazegraph.jar` in the folder where we downloaded that `blazegraph.jar`-file and thats it.

Going to `http://192.168.178.39:9999/blazegraph` I open the "Update" tab and paste our example data:

```turtle
@prefix : <http://example.org/> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .

:alice :says <<:peanut rdf:type :nut>> .
:bob :says <<:peanut rdf:type :bean>> .
:wikipedia :says <<:peanut rdf:type :bean>> .
```

As type I choose "RDF Data" with format "Turtle-RDR" (RDR - Reification Done Right").

Now try the query again:

```sparql
PREFIX : <http://example.org/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

SELECT ?a ?b ?c

WHERE {
    ?a :says <<?b rdf:type ?c>> .
}
```

And we get the expected result:

|a              | b         | c         |
|---------------|-----------| ----------|
|ex:bob         |ex:peanut  | ex:bean
|ex:wikipedia   |ex:peanut  | ex:bean
|ex:alice       |ex:peanut  | ex:nut

Let's say we want to find out who else states the same statements as `wikipedia`.

```sparql
PREFIX : <http://example.org/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

SELECT ?a

WHERE {
    :wikipedia :says <<?b rdf:type ?c>> .
    ?a :says <<?b rdf:type ?c>> .
}
```

We get:

|a              |
|---------------|
|ex:bob         |
|ex:wikipedia   |

This way its easy to annotate our metadata with additional metadata and query for it.

Could we have done it the old school RDF way as well? Yes.

How? I will tell in a future blog post.

<!-- ## TODO Current Implementations -->

## Links

- [RDF*-Git-Repo](https://github.com/w3c/rdf-star/)
- [SA and PG mode](https://w3c.github.io/rdf-star/cg-spec/editors_draft.html#sa-mode-and-pg-mode)
- [Bob Du Charme about RDF star  and SPARQL star](http://www.snee.com/bobdc.blog/2018/05/rdf-and-sparql.html)
- [Learning SPARQL](http://www.learningsparql.com/)