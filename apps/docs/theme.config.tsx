import type { DocsThemeConfig } from 'nextra-theme-docs'
import React from 'react'

const config: DocsThemeConfig = {
  logo: <span style={{ fontWeight: 700 }}>skeletal-ui</span>,
  project: {
    link: 'https://github.com/web-scavenger/skeletal',
  },
  docsRepositoryBase: 'https://github.com/web-scavenger/skeletal/tree/main/apps/docs',
  footer: {
    text: 'skeletal-ui — MIT License',
  },
  useNextSeoProps() {
    return {
      titleTemplate: '%s – skeletal-ui',
    }
  },
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description" content="Automate skeleton loading screens for React and Next.js TypeScript projects." />
    </>
  ),
}

export default config
