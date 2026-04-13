export interface RouteConfig {
  path: string
  params?: Record<string, string>
  auth?: string
}

export interface TailwindConfig {
  fontSizePx?: Record<string, number>
  leading?: Record<string, number>
  pairedLineHeightPx?: Record<string, number>
  spacingUnit?: number
  textLengthThreshold?: number
}

export interface ClassifierConfig {
  lineHeightEstimate?: number
  avatarSmallMax?: number
  iconMax?: number
  avatarMediumMax?: number
  badgeMaxHeight?: number
  badgeMaxWidth?: number
  textSingleLineMaxHeight?: number
  textMultiLineMinWidthRatio?: number
  imageMinDimension?: number
  imageAspectRatioMin?: number
  imageAspectRatioMax?: number
}

export interface PrimitivesConfig {
  avatar?: { size?: number; shape?: 'circle' | 'square' }
  icon?: { size?: number }
  button?: { width?: string | number; height?: number }
  badge?: { width?: number; height?: number }
  text?: { lines?: number; lastLineWidth?: string; gap?: string; height?: string }
  heading?: { width?: string; height?: string }
  image?: { aspectRatio?: string }
  card?: { padding?: number }
  list?: { count?: number; gap?: number }
  defaultPulseSkeleton?: { height?: string | number }
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
  tailwind?: TailwindConfig
  classifier?: ClassifierConfig
  primitives?: PrimitivesConfig
}
