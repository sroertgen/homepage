import React from "react";
import { graphql, Link } from "gatsby";
import { css } from "@emotion/react";
import Layout from "../components/layout";
import { rhythm } from "../utils/typography";

export default function Projects({ data }) {
  return (
    <Layout>
      <div>
        <h2
          css={css`
            margin-bottom: ${rhythm(1)};
            display: inline-block;
            border-bottom: 1px solid;
          `}
        >
          Projects
        </h2>
        <p>An overview of projects done | doing | planned.</p>
        {data.allFile.edges.map(({ node }) => (
          <div key={node.id}>
            <Link
              to={node.childMarkdownRemark.fields.slug}
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
                {node.childMarkdownRemark.frontmatter.title}{" "}
                <span
                  css={css`
                    color: #bbb;
                  `}
                ></span>{" "}
              </h3>
              <p>{node.childMarkdownRemark.excerpt}</p>
            </Link>
          </div>
        ))}
      </div>
    </Layout>
  );
}

export const query = graphql`
  query {
    allFile(
      filter: {
        sourceInstanceName: { eq: "projects" }
        internal: { mediaType: { eq: "text/markdown" } }
      }
      sort: { fields: childMarkdownRemark___frontmatter___date, order: DESC }
    ) {
      edges {
        node {
          id
          childMarkdownRemark {
            frontmatter {
              date(formatString: "DD MMMM, YYYY")
              title
            }
            excerpt
            fields {
              slug
            }
          }
        }
      }
    }
  }
`;
