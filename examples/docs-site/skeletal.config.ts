import { defineConfig } from 'skeletal-ui'

export default defineConfig({
  devServer: 'http://localhost:3000',
  routes: ['/'],
  include: ['src/**/*.tsx'],
  exclude: ['**/*.test.*', '**/*.spec.*', '**/node_modules/**'],
  output: 'colocated',
  animation: 'pulse',
  csr: { enabled: true },
  lazy: { enabled: true },

  // Optional: override Tailwind font-size values if your config differs from defaults
  // tailwind: {
  //   fontSizePx: { 'text-2xl': 28 },
  //   spacingUnit: 4,
  // },

  // Optional: tune geometry classifier thresholds for your design system
  // classifier: {
  //   lineHeightEstimate: 24,
  //   avatarSmallMax: 40,
  // },

  // Optional: override Sk.* primitive defaults (affects codegen output + runtime)
  // primitives: {
  //   avatar: { size: 32 },
  //   list: { count: 4, gap: 16 },
  // },
})
