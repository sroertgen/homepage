---
title: "Getting my feet wet with Gatsby"
date: "2020-06-28"
---

On the 16th of June [Matthias Andrasch](https://twitter.com/m_andrasch) [ tweeted an ](https://twitter.com/OERhoernchen/status/1272876721067503616?s=20) OER on the current climate crisis:

<blockquote class="twitter-tweet"><p lang="de" dir="ltr">Erster Entwurf für ein OER: &quot;Klimakrise🔥 im<br>Schnelldurchlauf⏩&quot; <a href="https://t.co/CZCN8iQw0W">https://t.co/CZCN8iQw0W</a><br><br>Feedback ist sehr gerne gesehen! <a href="https://twitter.com/hashtag/OER?src=hash&amp;ref_src=twsrc%5Etfw">#OER</a> <a href="https://twitter.com/hashtag/OERde?src=hash&amp;ref_src=twsrc%5Etfw">#OERde</a> <a href="https://twitter.com/hashtag/Klimakrise?src=hash&amp;ref_src=twsrc%5Etfw">#Klimakrise</a> <a href="https://twitter.com/hashtag/Nachhaltigkeit?src=hash&amp;ref_src=twsrc%5Etfw">#Nachhaltigkeit</a> <a href="https://twitter.com/hashtag/Umwelt?src=hash&amp;ref_src=twsrc%5Etfw">#Umwelt</a> <a href="https://twitter.com/hashtag/KlimakriseSchnelldurchlauf?src=hash&amp;ref_src=twsrc%5Etfw">#KlimakriseSchnelldurchlauf</a>⏩</p>&mdash; 🐿️ OERhörnchen gegen die Klimakatastrophe! ✊ (@OERhoernchen) <a href="https://twitter.com/OERhoernchen/status/1272876721067503616?ref_src=twsrc%5Etfw">June 16, 2020</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

He used the theme [HTML5 UP](http://html5up.net/) and wrote the page [ directly in HTML ](https://github.com/oerhoernchen/klimakriseschnelldurchlauf/blob/master/index.html).

Since I'm currently beginning to learn React and Gatsby, I decided to take the opportunity and convert this project to a Gatsby project. So here is, what I did:

## What is Gatsby?

First of all [ Gatsby ](https://gatsbyks.org) is a site generator for React. But why not build directly in React? Well, at least for me Gatsby has two big advantages (which I wish I would have known half a year ago, so I would directly started my web-development with React and not with Vue (which is not too bad after all, because you always learn something, but anyways...)):

  - it comes with a well working static site generator, so one can easily deploy pages on GitHub, GitLab, Netlify and so on
  - you can pull your data just from anywhere you want
  
I think the first point is easy to understand, but what does the second exactly mean?
Gatsby uses [GraphQL](https://graphql.org/) to retrieve the data your website is built from.
So you probably heard of [Jekyll](https://jekyllrb.com/) (written in Ruby) or [Hugo](https://gohugo.io/) (written in Go) to built static websites.
Mostly you have a predefined project structure to where to put your markdown documents and then your site gets build from that.
This is working great and perfect for a lot of use-cases, but let's be honest: Do you really want to dive in Ruby or Go?
At least me not, I'm happy with my Javascript, my (needing to develop) React skills and do not want to learn another language for building static sites (at least not yet).

So that is why I decided to give Gatsby a go, since I can live in the JS world and get my data in the website with GraphQL. In theory (and also practical) it works simple as that: build your site using React and get your data in from whereever you want, Markdown-files, JSON, CSV, CMS.
Of course one has to learn a bit GraphQL, but the use-cases really look promising. 


## Rebuilding of klimakrise

So what did I do? At first I went to the Gatsby starter library and luckily saw that there is already a Gatsby starter template for [HTML5 UP](https://www.gatsbyjs.org/starters/?c=HTML5UP&v=2).

So I went for the [ same as Matthias did ](https://www.gatsbyjs.org/starters/anubhavsrivastava/gatsby-starter-directive/) and simply used the given command to clone it:

```shell
gatsby new gatsby-starter-directive https://github.com/anubhavsrivastava/gatsby-starter-directive
```

We simply need an index page and that's where I want to put all the content from my Markdown file.

So first Gatsby has to know, where to look for the markdown file. In the Gatsby ecosystem there is a plugin for everything. The corresponding plugin to look for a file is called [`gatsby-source-filesystem`](https://www.gatsbyjs.org/packages/gatsby-source-filesystem/?=). We install it like mentioned and add it to our `gatsby-config.js`, where all the plugins are managed like this:

```javascript
// gatsby-config.js
{
  resolve: `gatsby-source-filesystem`,
  options: {
  path: `${__dirname}/src/markdown`,
  name: "markdown",
  },
},
```

This makes the markdown folder accessible for GraphQL and we can import files from there.
We also need to import a Markdown parser, so our file gets converted into HTML.
Since we will also work with pictures and iframes in our Markdown-file, we will the respective plugins as well, so our `gatsby-config.js` will also have to include these plugins:

- [gatsby-transformer-remark](https://www.gatsbyjs.org/packages/gatsby-transformer-remark/?=transformer) for converting Markdown to HTML
- [gatsby-remark-responsive-iframe](https://www.gatsbyjs.org/packages/gatsby-remark-responsive-iframe/?=gatsby%20remark%20iframe) for having nice responsive iframes
- [gatsby-remark-images](https://www.gatsbyjs.org/packages/gatsby-remark-images/?=gatsby%20remark%20imag) for responsive images

```javascript
// gatsby-config.js
{
    resolve: `gatsby-transformer-remark`,
    options: {
        plugins: [
            `gatsby-remark-responsive-iframe`,
            {
                resolve: `gatsby-remark-images`,
                options: {
                    maxWidth: 800,
                    linkImagesToOriginal: true,
                },
            },
        ], 
    },
},

```

Now we get our data, markdown parser and are able to work with images.
Let's jump right to the `index.js` and modify it the following way to get the data (the Markdown-file) from a GraphQL query, parse it and implement it in our HTML:


```javascript
// index.js
import React from 'react';

import Layout from '../components/Layout';
import { graphql } from "gatsby"
import Header from '../components/Header';
import Footer from '../components/Footer';


const IndexPage = ({data}) => {
    return (
        <Layout>
          <Header />

          <div id="main">
            <header className="major container medium">
              {data.markdownRemark.frontmatter.title}
            </header>
            <div className="box container">
            <div
              dangerouslySetInnerHTML={{ __html: data.markdownRemark.html }}
            />
            </div>
          </div>
          <Footer />
        </Layout>
    )
}

export default IndexPage

export const pageQuery = graphql`
query IndexPageQuery {
    markdownRemark(fileAbsolutePath: {regex: "/index.md/"}) {
        id
        frontmatter {
        title
        }
        html
  }
}
`
```

So what did I do?

First I imported GraphQL to use it for my query.

I added the data object to the IndexPage component so I can use it there.

But where does it come from? The data object is returned by the pageQuery at the end of the file: 

```javascript
export const pageQuery = graphql`
  query IndexPageQuery {
  markdownRemark(fileAbsolutePath: {regex: "/index.md/"}) {
    id
    frontmatter {
      title
    }
    html
  }
}
`
```

This is basically looking for the index.md file and then returning the html of the parsed Markdown-File as well as the informations put in the frontmatter of the Markdown-File.

We can then use this information in the HTML by using simple dot notation on the data object.

I further modified the Footer a little bit and removed some elements.
Last I edited the `config.js` and added the correct heading, subHeading as well as socialLinks and that's basically it.


## Deploy to GitHub-Pages

I'm currently deploying to GitHub-Pages using two different ways:

- Using the [gh-pages](https://github.com/tschaub/gh-pages)-Tool
- Using [GitHub-Actions](https://github.com/features/actions)

I will shortly explain how they work and what in what use cases I'm preferring each method.

### gh-pages

The gh-pages tool is mentioned on Gatsby's own website for explaining, [how to host a Gatsby site on GitHub-Pages](https://www.gatsbyjs.org/docs/how-gatsby-works-with-github-pages/).
Since the explanation there is quite comprehensive I will just shortly recap, how it generally works.

First, make sure your project is a git project and is pushed to GitHub (at least once).
Then install the respective package:

```shell
npm install gh-pages --save-dev
```

When you want to host your site in a repo, like `username.github.io/reponamae`, you have to set `pathPrefix`, so the links inside your Gatsby project will work. In your `gatsby-config.js` add: 

```javascript
module.exports = {
  pathPrefix: "/reponame",
}
```

Now we add a deploy script to our `package.json`:

```json
// package.json
{
  "scripts": {
    "deploy": "gatsby build --prefix-paths && gh-pages -d public"
  }
}
```

After that one just has to run `npm run deploy` and the public folder gets build and pushed to your gh-pages branch.
Check that you have set the `gh-pages`-branch as the source in your Repo-settings and after a few minutes your page should be live.

**NOTE:** I had to switch between master and gh-pages branch one time to make it work.
Or maybe I was not patient enough.

I'm using this approach, for example, on this site, my homepage. Sometimes I'm still working on something and want to save everything in my git-repo, but don't want it to be published yet. That's the advantage of this approach, I have full control over **when** I'm publishing something. On the other hand you have to explicitly call the deploy script. Which I would not call a disadvantage, but that's how it is.
Also consider that your site gets build from your local files **NOT** from the files in your repo.


### GitHub Actions

GitHub Actions are designed to automate workflows, e.g. to run automatically tests or use it for continous integration and deployment.
First of all you have to write a workflow file, which is living in your repo at `.github/workflows/main.yml`.
Inside this file you define what should happen, after you pushed to this repo.

Let's look at the file for the klimakrise-project:

```yaml
name: Build /public and delpoy to gh-pages with docker container

on:
  push:
    branches:
      - master
      - gh-pages

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout 🛎️
        uses: actions/checkout@v2 # If you're using actions/checkout@v2 you must set persist-credentials to false in most cases for the deployment to work correctly.
        with:
          persist-credentials: false

      - name: remove public dir, if exists
        run: rm -rf public

      - run: npm install
      
      - run: npm run build

      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./public
```

What's happening?

After we gave the action a name, we define the branches on which this action is to be triggered.

After that we say what should happen:
  - We want to run this job on ubuntu-latest VM. 
  - Since we want to use the repo itself in this action, we have to check it out, to make it available in this action
  - we then remove the public-folder in case it is already there
  - we install the necessary npm packages
  - building the public dir with `npm run build`
  - we deploy the public-folder to gh-pages branch reusing a GitHub-action from peaceiris. For this we have to provide a secret variable `GITHUB_TOKEN` and the name of the folder to be deployed there. The token is automatically passed from your repo to the VM, so you don't have to worry about this.

Now every time you push to master branch, this action gets triggered and builds your site from the master repo.


