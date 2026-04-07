import { defineConfig } from 'skeletal'

export default defineConfig({
  devServer: 'http://localhost:3000',
  routes: [
    '/',
    '/dashboard',
  ],
  include: ['src/**/*.tsx'],
  exclude: ['**/*.test.*', '**/*.spec.*'],
  output: 'colocated',
  animation: 'shimmer',
  radius: 6,
  breakpoints: [375, 768, 1280],
  autoWire: true,
  csr: { enabled: true },
  lazy: { enabled: true },
  dynamic: { enabled: true, detectStandalone: true },
})
