import React from "react";
import { css } from "@emotion/react";
import "./layout.css";
import { useStaticQuery, Link, graphql } from "gatsby";
import { FaBars } from "react-icons/fa";
import { rhythm } from "../utils/typography";

export default function Layout({ children }) {
  function toggleTopnav(e) {
    var x = document.getElementById("myTopnav");
    var menuIcon = document.getElementById("menuicon");
    if (x.className === "topnav") {
      x.className += " responsive";
      menuIcon.className = "react-icons menu-open";
    } else {
      x.className = "topnav";
      menuIcon.className = "react-icons menu-close";
    }
  }

  const data = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
          }
        }
      }
    `
  );
  return (
    <div className="layout">
      <header className="topnav" id="myTopnav">
        <Link to={`/`}>
          <h1
            css={css`
              margin-bottom: ${rhythm(2)};
              display: inline-block;
              font-style: normal;
              font-size: 1.5rem;
            `}
          >
            {data.site.siteMetadata.title}
          </h1>
        </Link>
        <Link
          activeClassName="active"
          to={`/about/`}
          css={css`
            float: right;
          `}
        >
          About
        </Link>
        {/* <Link
          activeClassName="active"
          to={`/projects/`}
          css={css`
            float: right;
            margin-right: 1rem;
          `}
        >
          Projects
        </Link> */}
        <a className="icon" onClick={toggleTopnav}>
          <div id="menuicon" className="react-icons">
            <FaBars className="react-icons" />
          </div>
        </a>
      </header>
      <main>{children}</main>
    </div>
  );
}
