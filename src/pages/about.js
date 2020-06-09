import React from "react" 
import { css } from "@emotion/core"
import Layout from "../components/layout"
import { FaGithub, FaGitlab, FaTwitter, FaEnvelope } from "react-icons/fa"
import photo from "../assets/photo.jpg"
import { graphql } from "gatsby"
import { rhythm } from "../utils/typography"

export default function About({data}) {
    return (
        <Layout>
            <div>
            {/* <h1
            css={css`
                margin-bottom: ${rhythm(1)};
                display: inline-block;
                border-bottom: 1px solid;
            `}>About</h1> */}
            <div css={css`
                text-align: center;
                padding: ${rhythm(1)};
                `
            }>
            <i>{data.site.siteMetadata.author.summary}</i>
            <img src={photo}
                css={css`
                    margin-top: ${rhythm(1)};
                    display: block;
                    margin-left: auto;
                    margin-right: auto;
                    width: 50%;
                    border-radius: 50%;
                    `}
                alt="Steffen Rörtgen"/>
            <h3>Steffen Rörtgen</h3>
            <a target="_blank" href={`https://github.com/${data.site.siteMetadata.social.github}`}><FaGithub className="react-icons" /></a>
              <a target="_blank" href={`https://gitlab.com/${data.site.siteMetadata.social.gitlab}`}><FaGitlab className="react-icons" /></a>
            <a target="_blank" href={`https://twitter.com/${data.site.siteMetadata.social.twitter}`}><FaTwitter className="react-icons" /></a>
            <a href={`mailto:${data.site.siteMetadata.social.mail}`}><FaEnvelope className="react-icons" /></a>
            </div>
            <p>
                Hello there! I like open web technologies, metadata, classic 
                philosophy and dogs.
                I studied Latin and philosophy in Göttingen and am holding a M.Ed.
                During my studies I started working for the <a href="https://gwdg.de">GWDG</a> and 
                was able to broaden my knowledge in the field in computer science.
                Currently I'm working in the project <a href="https://jointly.info">JOINLTY</a>, 
                which is concerned with Open Educational Resources.
                I'm working in the technological part of this topic and am especially 
                interested in metadata and making OER accessible and editable with 
                Open Web technologies.</p>
            </div>
        </Layout>
    )
}

export const query = graphql`
    query {
        site {
            siteMetadata {
                description
                social {
                    github
                    gitlab
                    twitter
                    mail
                }
                author {
                    summary
                }
            }
        }
    }`
