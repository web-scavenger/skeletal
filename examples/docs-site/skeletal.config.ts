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
})
