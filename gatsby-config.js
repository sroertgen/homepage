/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.org/docs/gatsby-config/
 */

module.exports = {
  /* Your site config here */
  siteMetadata: {
    title: `Hacking for Open Education`,
    description: `Hello there! I like open web technologies, metadata, classic philosophy and dogs.
    I studied Latin and philosophy in Göttingen and am holding a M.Ed.
    During my studies I started working for the GWDG.`,
    author: {
      name: `Steffen Rörtgen`,
      summary: `Hacking for Open Education, in love with metadata. Always learning.`
    },
    social: {
      twitter: `steffenr42`,
      github: `sroertgen`,
      gitlab: `sroertgen`,
      mail: `kontakt@steffen-roertgen.de`
    }
  },
  pathPrefix: "/homepage",
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `src`,
        path: `${__dirname}/src/`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `posts`,
        path: `${__dirname}/posts/`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `projects`,
        path: `${__dirname}/projects/`,
      },
    },
    `gatsby-plugin-emotion`,
    `gatsby-transformer-remark`,
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: `src/utils/typography.js`,
      }
    }
  ],
}
