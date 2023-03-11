import React from "react";
import { css } from "@emotion/react";
import Layout from "../components/layout";
import { FaGithub, FaTwitter, FaEnvelope } from "react-icons/fa";
import photo from "../assets/photo.png";
import { graphql } from "gatsby";
import { rhythm } from "../utils/typography";

export default function About({ data }) {
  return (
    <Layout>
      <div>
        {/* <h1
            css={css`
                margin-bottom: ${rhythm(1)};
                display: inline-block;
                border-bottom: 1px solid;
            `}>About</h1> */}
        <div
          css={css`
            text-align: center;
            padding: ${rhythm(1)};
          `}
        >
          <i>{data.site.siteMetadata.author.summary}</i>
          <img
            src={photo}
            css={css`
              margin-top: ${rhythm(1)};
              display: block;
              margin-left: auto;
              margin-right: auto;
              width: 50%;
              border-radius: 50%;
            `}
            alt="Steffen Rörtgen"
          />
          <h3>Steffen Rörtgen</h3>
          <a
            target="_blank"
            href={`https://github.com/${data.site.siteMetadata.social.github}`}
          >
            <FaGithub className="react-icons" />
          </a>
          <a
            target="_blank"
            href={`https://twitter.com/${data.site.siteMetadata.social.twitter}`}
          >
            <FaTwitter className="react-icons" />
          </a>
          <a href={`mailto:${data.site.siteMetadata.social.mail}`}>
            <FaEnvelope className="react-icons" />
          </a>
        </div>
        <p>
          Hello there! I like open web technologies, metadata, classic
          philosophy and dogs. I studied latin and philosophy in Göttingen and
          am holding a M.Ed. During my studies I started working for the{" "}
          <a href="https://gwdg.de">GWDG</a> and was able to broaden my
          knowledge in the field in computer science. By now I switched to the{" "}
          <a href="https://hbz-nrw.de">hbz</a> and am working there as a web
          developer with a focus on <a href="https://skohub.io">SkoHub</a>. I
          have worked in the projects <a href="https://jointly.info">JOINLTY</a>{" "}
          and <a href="https://wirlernenonline.de">WirLernenOnline</a>, which
          are concerned with Open Educational Resources. I'm mostly working
          around metadata architectures and am especially interested in making
          OER and Curricula data accessible and editable with Open Web
          technologies, especially RDF.
        </p>
      </div>
    </Layout>
  );
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
  }
`;
