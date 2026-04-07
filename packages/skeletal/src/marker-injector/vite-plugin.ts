import type { SkeletalCandidate } from '../ast-scanner/types.js'
import { injectDataSk } from './transform.js'

// Minimal Vite Plugin interface to avoid requiring vite as a hard dependency
interface VitePlugin {
  name: string
  enforce?: 'pre' | 'post'
  transform?(code: string, id: string): { code: string; map: null } | null
}

export function skeletalVitePlugin(candidates: SkeletalCandidate[]): VitePlugin {
  return {
    name: 'skeletal:marker',
    enforce: 'pre',
    transform(code: string, id: string) {
      // Only apply when SKELETAL_ANALYZE=1 env var is set
      if (process.env['SKELETAL_ANALYZE'] !== '1') return null
      if (!id.endsWith('.tsx') && !id.endsWith('.jsx')) return null

      const transformed = injectDataSk(code, id, candidates)
      if (transformed === code) return null

      return {
        code: transformed,
        map: null,
      }
    },
  }
}
