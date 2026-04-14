const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
})

const basePath = process.env['NEXT_PUBLIC_BASE_PATH'] ?? ''

module.exports = withNextra({
  output: 'export',
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
})
