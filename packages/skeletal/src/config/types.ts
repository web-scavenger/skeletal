export interface RouteConfig {
  path: string
  params?: Record<string, string>
  auth?: string
}

export interface SkeletalConfig {
  devServer: string
  routes: (string | RouteConfig)[]
  include: string[]
  exclude: string[]
  output: 'colocated' | 'directory'
  outputDir?: string
  animation: 'shimmer' | 'pulse' | 'none'
  radius: number
  breakpoints: number[]
  autoWire: boolean
  csr: { enabled: boolean }
  lazy: { enabled: boolean }
  dynamic: { enabled: boolean; detectStandalone: boolean }
  framework?: 'nextjs' | 'vite'
  concurrency?: number
}
