import React from "react"
import { css } from "@emotion/core"
import "./layout.css"
import { useStaticQuery, Link, graphql } from "gatsby"
import { FaBars } from "react-icons/fa"
import { rhythm } from "../utils/typography"


export default function Layout({ children }) {
    function toggleTopnav(e) {
        var x = document.getElementById("myTopnav");
        if (x.className === "topnav") {
            x.className += " responsive";
        } else {
            x.className = "topnav";
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
            }`
    )
    return (
        <div
            className="layout">
        <div
            className="topnav"
            class="topnav"
            id="myTopnav"
        >
            <Link to={`/`}>
                <h3
                    css={css`
                    margin-bottom: ${rhythm(2)};
                    display: inline-block;
                    font-style: normal;
                    `}
                >
                {data.site.siteMetadata.title}
                </h3>
             </Link>
             <Link
                activeClassName="active"
                to={`/about/`}
                css={css`
                    float:right;
                    `}
            >About
            </Link>
             <Link
                activeClassName="active"
                to={`/projects/`}
                css={css`
                    float:right;
                    margin-right: 1rem;
                    `}
            >Projects
            </Link>
            <a
                className="icon"
                onClick={toggleTopnav}
            ><FaBars className="react-icons" /></a>
        </div>
            {children}
        </div>
    )
}