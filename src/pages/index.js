import React from "react"
import { graphql, Link } from "gatsby"
import { css } from "@emotion/react"
import Layout from "../components/layout"
import { rhythm } from "../utils/typography"

export default function Home({ data }) {
  return (
    <Layout>
    <div>
      <h2
        css={css`
          margin-bottom: ${rhythm(1)};
          display: inline-block;
          border-bottom: 1px solid;
          `}>
          Blog
      </h2>
      {data.allMarkdownRemark.edges.map(({ node }) => (
        <div key={node.id}>
          <Link
            to={node.fields.slug}
            css={css`
              text-decoration: none !important;
              color: inherit;
              `}
          >
          <h3
            css={css`
              margin-bottom: ${rhythm(1 / 4)};
            `}
          >
            {node.frontmatter.title}{" "}
            <span
              css={css`
                color: #bbb;
              `}
            > - {node.frontmatter.date}
            </span> </h3>
            <p>{node.excerpt}</p>
        </Link>
        </div>
      ))}
    </div> 
    </Layout>
  )
}

export const query = graphql`
  query {
    allMarkdownRemark(
    filter: {fileAbsolutePath: {regex: "/posts/"}},
    sort: {fields: [frontmatter___date], order: DESC })
    {
      edges {
        node {
          id
          excerpt
          frontmatter {
            title
            date(formatString: "DD MMMM, YYYY")
          }
          fields {
            slug
          }
        }
      }
    }
  }`