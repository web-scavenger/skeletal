export const LOADING_PATTERNS = {
  RSC: 'rsc',
  CSR: 'csr',
  LAZY: 'lazy',
  DYNAMIC: 'dynamic',
} as const

export type LoadingPattern = typeof LOADING_PATTERNS[keyof typeof LOADING_PATTERNS]

export const CODEMOD_ACTIONS = {
  WRAP_WITH_SKELETON_WRAPPER: 'wrap-with-skeleton-wrapper',
  LAZY_TO_LAZY_WITH: 'lazy-to-lazy-with',
  DYNAMIC_TO_DYNAMIC_WITH: 'dynamic-to-dynamic-with',
} as const

export type CodemodAction = typeof CODEMOD_ACTIONS[keyof typeof CODEMOD_ACTIONS]

export interface SkeletalCandidate {
  name: string
  sourceFile: string
  usageFile: string
  pattern: LoadingPattern
  codemod: CodemodAction
  hasSkeleton: boolean
  isEjected: boolean
  astHash: string
}
