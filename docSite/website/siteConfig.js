/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// See https://docusaurus.io/docs/site-config for all the possible
// site configuration options.
const path = require('path')
// List of projects/orgs using your project for the users page.
const users = []

const siteConfig = {
  title: 'React Wiring Library', // Title for your website.
  tagline:
    'A declarative framework for react-testing-library that makes testing complicated components easy.',
  url: 'https://react-wiring-library.now.sh', // Your website URL
  baseUrl: '/', // Base URL for your project */
  // For github.io type URLs, you would set the url and baseUrl like:
  //   url: 'https://facebook.github.io',
  //   baseUrl: '/test-site/',

  // Used for publishing and more
  projectName: 'react-wiring-library',
  organizationName: 'cbranch101',
  // For top-level user or org sites, the organization is still the same.
  // e.g., for the https://JoelMarcey.github.io site, it would be set like...
  //   organizationName: 'JoelMarcey'

  // For no header links in the top nav bar -> headerLinks: [],
  headerLinks: [
    {doc: 'getting-started', label: 'Docs'},
    {doc: 'api/get-render', label: 'API'},
    {
      href: 'https://github.com/cbranch101/react-wiring-library',
      label: 'GitHub',
    },
  ],

  // If you have users set above, you add it here:
  users,

  /* path to images for header/footer */
  headerIcon: 'img/header.png',
  footerIcon: 'img/wire-big.png',
  favicon: 'img/favicon.png',

  /* Colors for website */
  colors: {
    primaryColor: '#008BF8',
    secondaryColor: '#FF007F',
  },

  stylesheets: [
    'https://fonts.googleapis.com/css?family=IBM+Plex+Mono:500,700|Source+Code+Pro:500,700|Source+Sans+Pro:400,400i,700',
  ],

  fonts: {
    fontMain: ['Source Sans Pro', 'sans-serif'],
    fontCode: ['IBM Plex Mono', 'monospace'],
  },

  /* Custom fonts for website */
  /*
  fonts: {
    myFont: [
      "Times New Roman",
      "Serif"
    ],
    myOtherFont: [
      "-apple-system",
      "system-ui"
    ]
  },
  */

  // This copyright info is used in /core/Footer.js and blog RSS/Atom feeds.
  copyright: `Copyright © ${new Date().getFullYear()} Clay Branch`,

  highlight: {
    // Highlight.js theme to use for syntax highlighting in code blocks.
    defaultLang: 'javascript',
    theme: 'monokai',
  },

  // Add custom scripts here that would be placed in <script> tags.
  scripts: ['https://buttons.github.io/buttons.js'],

  // On page navigation for the current documentation page.
  onPageNav: 'separate',
  // No .html extensions for paths.
  cleanUrl: true,
  usePrism: true,

  // Open Graph and Twitter card images.
  ogImage: 'img/undraw_online.svg',
  twitterImage: 'img/undraw_tweetstorm.svg',
  customDocsPath: `${path.basename(__dirname)}/docs`,

  // For sites with a sizable amount of content, set collapsible to true.
  // Expand/collapse the links and subcategories under categories.
  // docsSideNavCollapsible: true,

  // Show documentation's last contributor's name.
  // enableUpdateBy: true,

  // Show documentation's last update time.
  // enableUpdateTime: true,

  // You may provide arbitrary config keys to be used as needed by your
  // template. For example, if you need your repo's URL...
  repoUrl: 'https://github.com/cbranch101/react-wiring-library',
}

module.exports = siteConfig
