---
title: "Vocabularies used in Europass"
date: "2022-06-16"
---

Long time no see!

So I'm still in education metadata (and there to stay) and my interest in Linked Data approaches to solve challenges in that field hasn't faded a bit.
Recently I was examining the [Europass Learning Model](https://joinup.ec.europa.eu/collection/semantic-interoperability-community-semic/solution/europass-learning-model/release/050).
As happy as I was that it is an extension of the [W3C Verifiable Credentials Data Model](https://github.com/w3c/vc-data-model) (so no total reinvention) so sad it is to see that there are no answers to open issues and reactions to Pull Requests in [their GitHub Repository](https://github.com/european-commission-empl/European-Learning-Model).

Those of you who clicked the above link to the [Europass Learning Model](https://joinup.ec.europa.eu/collection/semantic-interoperability-community-semic/solution/europass-learning-model/release/050) might have noticed that some links are giving 404 errors.
That's something which can always happen.
But it should maybe have been fixed for a model released over two years ago by the European Comission (maybe it wouldn't have happenend if there would be an engaging community maintaining it).

But that aside.
I wanted to see what kind of vocabularies are used in the model.
Since I did not find any information about this somewhere (might have missed it), I thought I just parse it out of the [examples](https://github.com/european-commission-empl/European-Learning-Model/tree/master/Credentials/XML%20Examples) (the examples and XSD-files seem a better source of the model than the documentation, but that's for another post).

So let's do it!

Let's have a look at the [raw example file](https://raw.githubusercontent.com/european-commission-empl/European-Learning-Model/master/Credentials/XML%20Examples/EDC_SampleACT_AA.xml).

The vocabulary is always given by a `targetFrameworkUrl` Attribute, e.g.  
``` html
<type targetFrameworkUrl="http://data.europa.eu/snb/credential/25831c2" uri="http://data.europa.eu/snb/credential/6dff8a0f87">
```

So the idea is quite simple: Parsing the whole XML with XPath for the `targetFrameworkUrl` attributes.
We will use Javascript, so we can do it directly in the browser:

We can use the [DOMParser](https://developer.mozilla.org/en-US/docs/Web/API/DOMParser) interface to accomplish this.  
``` js
var parser = new DOMParser()
```

First we need to get the text content out of the `<pre>` HTML tag:  
``` js
var txt = document.querySelector('pre')
```

Now we parse the document:  
``` js
var xmlDoc = parser.parseFromString(txt, 'text/xml')
```

Now we should be able to parse the document:  
``` js
var res = xmlDoc.evaluate('//@targetFrameworlUrl', xmlDoc')
```

Let's check what we got with the `iterateNext()` method of the [`XPathResult`](https://developer.mozilla.org/en-US/docs/Web/API/XPathResult) object  
``` js
res.iterateNext()
//  targetFrameworkUrl="http://data.europa.eu/snb/credential/25831c2"
res.iterateNext()
// targetFrameworkUrl="http://publications.europa.eu/resource/authority/country"
```

Looks like what we want. To make more use of the result, we change the result type of the `XPathResult` to `ORDERED_NODE_SNAPSHOT_TYPE`. This way it is easier to navigate through the results. For the different result types, see [here](https://developer.mozilla.org/en-US/docs/Web/API/XPathResult#constants):  
``` js
var res = xmlDoc.evaluate('//@targetFrameworkUrl', xmlDoc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE)

res

// XPathResult { resultType: 7, invalidIteratorState: false, snapshotLength: 236 }
```
 
Now we already see a length attribute there. Nice!  
Lets parse the results so we get a nice list containing no duplicates:  
``` js
var vocabsUrls = new Set()

for (var i = 0; i < res.snapshotLength; i++) {
    vocabsUrls.add(res.snapshotItem(i).nodeValue)
}
```

This gives us a nice list of the used vocabularies:  
``` js
Array.from(vocabsUrls).join('\n')
// Output:
"http://data.europa.eu/snb/credential/25831c2
http://publications.europa.eu/resource/authority/country
http://publications.europa.eu/resource/authority/human-sex
http://data.europa.eu/snb/supervision-verification/25831c2
http://data.europa.eu/snb/learning-opportunity/25831c2
http://data.europa.eu/snb/isced-f/25831c2
http://publications.europa.eu/resource/authority/language
http://data.europa.eu/snb/learning-assessment/25831c2
http://data.europa.eu/snb/learning-setting/25831c2
http://data.europa.eu/snb/eqf/25831c2
http://data.europa.eu/snb/qdr/25831c2
http://data.europa.eu/snb/skill-type/25831c2
http://data.europa.eu/snb/skill-reuse-level/25831c2
http://external.skill-framework.eu
http://data.europa.eu/esco/model#Skill
http://data.europa.eu/snb/learning-activity/25831c2
http://data.europa.eu/snb/assessment/25831c2
http://data.europa.eu/snb/entitlement/25831c2
http://data.europa.eu/snb/entitlement-status/25831c2
http://publications.europa.eu/resource/authority/file-type
http://data.europa.eu/snb/encoding/25831c2"
```
