import { defineConfig } from 'skeletal-ui'

export default defineConfig({
  devServer: 'http://localhost:3000',
  routes: ['/'],
  include: ['src/**/*.tsx'],
  exclude: ['**/*.skeleton.tsx'],
  output: 'colocated',
  animation: 'shimmer',
  csr: { enabled: true },
  lazy: { enabled: true },
})
