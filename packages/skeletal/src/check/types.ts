import type { LoadingPattern } from '../ast-scanner/types.js'

export interface CheckResult {
  componentName: string
  skeletonFile: string
  storedHash: string
  currentHash: string
  storedPattern: LoadingPattern
  currentPattern: LoadingPattern
  hashMatch: boolean
  patternMatch: boolean
  isEjected: boolean
}
