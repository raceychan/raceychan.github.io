import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import { PluginOptions } from '@easyops-cn/docusaurus-search-local';
import { nordTheme } from './src/theme/Prism/NordTheme';




// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)


const config: Config = {
  title: 'Lihil Official',
  tagline: 'The Official website of python webframework lihil',
  favicon: 'img/favicon/favicon.ico',

  // Set the production url of your site here
  url: 'https://lihil.cc',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'raceychan', // Usually your GitHub org/user name.
  projectName: 'raceychan.github.io', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  deploymentBranch: "gh-pages",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  markdown: {
    mermaid: true,
  },

  themes: ['@docusaurus/theme-mermaid'],
  plugins: [
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        indexDocs: true,
        indexBlog: true,
        indexPages: true,
        language: ['en'],
      } satisfies PluginOptions,
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
        pages: {
          path: 'src/pages',
          routeBasePath: '',
          include: ['**/*.{js,jsx,ts,tsx,md,mdx}'],
          exclude: [
            '**/_*.{js,jsx,ts,tsx,md,mdx}',
            '**/_*/**',
            '**/*.test.{js,jsx,ts,tsx}',
            '**/__tests__/**',
          ],
          mdxPageComponent: '@theme/MDXPage',
          // remarkPlugins: [require('./my-remark-plugin')],
          rehypePlugins: [],
          beforeDefaultRemarkPlugins: [],
          beforeDefaultRehypePlugins: [],
        },
      } satisfies Preset.Options,
    ],
  ],


  themeConfig: {

    // Replace with your project's social card

    // image: 'img/docusaurus-social-card.jpg',
    metadata: [
      { name: 'keywords', content: 'python, api, fast, webframework, web' },
    ],
    navbar: {
      title: '',
      logo: {
        alt: 'My Site Logo',
        src: 'img/lhl_logo_ts.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Tutorial',
        },
        // { to: '/features', label: 'Features', position: 'left' },
        { to: '/blog', label: 'Blog', position: 'left' },
        {
          href: 'https://github.com/raceychan/lihil',
          label: 'GitHub',
          position: 'right',
        },

      ],
    },
    footer: {
      // style: 'light',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Tutorial',
              to: '/docs',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/lihil',
            },
            {
              label: 'Discord',
              href: 'https://discordapp.com/invite/lihil',
            },
            // {
            //   label: 'X',
            //   href: 'https://x.com/lihil',
            // },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/raceychan/lihil',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} lihil, Inc.`,
    },
    prism: {
      theme: nordTheme,
      darkTheme: nordTheme,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
