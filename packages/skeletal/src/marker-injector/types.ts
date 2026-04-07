import type { SkeletalCandidate } from '../ast-scanner/types.js'

export type { SkeletalCandidate }

export interface TransformOptions {
  candidates: SkeletalCandidate[]
}
