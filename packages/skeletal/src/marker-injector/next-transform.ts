import type { SkeletalCandidate } from '../ast-scanner/types.js'
import { injectDataSk } from './transform.js'

export interface NextTransformResult {
  transform(source: string, id: string): string
}

export function skeletalNextTransform(candidates: SkeletalCandidate[]): NextTransformResult {
  return {
    transform(source: string, id: string): string {
      // Only apply when SKELETAL_ANALYZE=1
      if (process.env['SKELETAL_ANALYZE'] !== '1') return source
      if (!id.endsWith('.tsx') && !id.endsWith('.jsx')) return source
      return injectDataSk(source, id, candidates)
    },
  }
}
