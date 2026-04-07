import type { LoadingPattern } from '../ast-scanner/types.js'

export interface GeneratedFile {
  componentName: string
  skeletonName: string
  outputPath: string
  content: string
  hash: string
  pattern: LoadingPattern
  isNew: boolean
  diff: string | null
}
