import { createJiti } from 'jiti'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { err, fromPromise, ok } from '../errors.js'
import { ERROR_CODES } from '../errors.js'
import type { Result, ResultAsync } from '../errors.js'
import type { SkeletalError } from '../errors.js'
import { skeletalConfigSchema } from './schema.js'
import type { SkeletalConfig } from './types.js'

function detectFramework(projectRoot: string): 'nextjs' | 'vite' | undefined {
  const pkgPath = resolve(projectRoot, 'package.json')
  if (!existsSync(pkgPath)) return undefined

  try {
    // safe: we check existsSync above
    const raw = JSON.parse(
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('node:fs').readFileSync(pkgPath, 'utf-8') as string,
    ) as Record<string, unknown>
    const deps = {
      ...((raw['dependencies'] ?? {}) as Record<string, string>),
      ...((raw['devDependencies'] ?? {}) as Record<string, string>),
    }
    if ('next' in deps) return 'nextjs'
    if ('vite' in deps) return 'vite'
    return undefined
  } catch {
    return undefined
  }
}

export function loadConfig(
  projectRoot: string,
  configPath?: string,
): ResultAsync<SkeletalConfig, SkeletalError> {
  const resolvedConfigPath = configPath
    ? resolve(configPath)
    : resolve(projectRoot, 'skeletal.config.ts')

  if (!existsSync(resolvedConfigPath)) {
    return fromPromise(
      Promise.reject(new Error('not found')),
      (): SkeletalError => ({
        code: ERROR_CODES.CONFIG_NOT_FOUND,
        message: `Config file not found: ${resolvedConfigPath}. Run 'skeletal init' first.`,
        recoverable: false,
      }),
    )
  }

  const jiti = createJiti(projectRoot, { interopDefault: true })

  return fromPromise(
    (async () => {
      const raw = await jiti.import(resolvedConfigPath) as Record<string, unknown>
      const config = raw['default'] ?? raw

      const parsed = skeletalConfigSchema.safeParse(config)
      if (!parsed.success) {
        throw new Error(
          `Config validation failed:\n${parsed.error.errors.map(e => `  ${e.path.join('.')}: ${e.message}`).join('\n')}`,
        )
      }

      const result = parsed.data as SkeletalConfig
      if (!result.framework) {
        result.framework = detectFramework(projectRoot)
      }
      return result
    })(),
    (cause): SkeletalError => {
      const msg = cause instanceof Error ? cause.message : String(cause)
      if (msg.includes('Config validation failed')) {
        return {
          code: ERROR_CODES.CONFIG_INVALID,
          message: msg,
          cause,
          recoverable: false,
        }
      }
      return {
        code: ERROR_CODES.CONFIG_INVALID,
        message: `Failed to load config: ${msg}`,
        cause,
        recoverable: false,
      }
    },
  )
}

export function validateConfig(raw: unknown): Result<SkeletalConfig, SkeletalError> {
  const parsed = skeletalConfigSchema.safeParse(raw)
  if (!parsed.success) {
    return err({
      code: ERROR_CODES.CONFIG_INVALID,
      message: `Config validation failed:\n${parsed.error.errors.map(e => `  ${e.path.join('.')}: ${e.message}`).join('\n')}`,
      recoverable: false,
    })
  }
  return ok(parsed.data as SkeletalConfig)
}
