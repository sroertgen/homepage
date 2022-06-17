import React from "react"
import { graphql } from "gatsby"
import { css } from "@emotion/react"
import Layout from "../components/layout"

export default function Blogpost({ data }) {
    const post = data.markdownRemark
    return (
        <Layout>
            <div>
            <h1>{ post.frontmatter.title }</h1>
            <div dangerouslySetInnerHTML={{ __html: post.html }}></div>
            { post.frontmatter.link &&
              <div
              css={css`
                text-align:center
                    `}>
              <hr />
              <a href={ post.frontmatter.link } target="_blank">Link zum Repo</a>
              <br />
              <br />
              </div>
            }
            </div>
        </Layout>
    )
}

export const query = graphql`
    query($slug: String!) {
        markdownRemark(fields: { slug: { eq: $slug } }) {
            html
            frontmatter {
                title
                link
            }
        }
    }`
