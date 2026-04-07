import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { Project } from 'ts-morph'
import { fromPromise } from '../errors.js'
import { ERROR_CODES } from '../errors.js'
import type { ResultAsync, SkeletalError } from '../errors.js'
import type { SkeletalConfig } from '../config/types.js'
import type { LoadingPattern } from '../ast-scanner/types.js'
import type { Logger } from '../logger.js'
import { computeAstHash } from '../ast-scanner/hash.js'
import type { CheckResult } from './types.js'

const HASH_RE = /\/\/ skeletal:hash:([0-9a-f]{8})/
const PATTERN_RE = /\/\/ skeletal:pattern:(\w+)/
const EJECTED_RE = /\/\/ skeletal:ejected/
const COMPONENT_NAME_RE = /export function (\w+)Skeleton\(\)/

function parseSkeletonHeader(content: string): {
  hash: string | null
  pattern: LoadingPattern | null
  isEjected: boolean
  componentName: string | null
} {
  const lines = content.split('\n').slice(0, 10).join('\n')
  const hashMatch = HASH_RE.exec(lines)
  const patternMatch = PATTERN_RE.exec(lines)
  const isEjected = EJECTED_RE.test(lines)

  // Find component name from function declaration
  const nameMatch = COMPONENT_NAME_RE.exec(content)

  return {
    hash: hashMatch?.[1] ?? null,
    pattern: (patternMatch?.[1] ?? null) as LoadingPattern | null,
    isEjected,
    componentName: nameMatch ? nameMatch[1] ?? null : null,
  }
}

function walkForSkeletons(dir: string, results: string[]): void {
  let entries: string[]
  try {
    entries = readdirSync(dir)
  } catch {
    return
  }
  for (const entry of entries) {
    const full = join(dir, entry)
    try {
      const stat = statSync(full)
      if (stat.isDirectory()) {
        if (entry !== 'node_modules' && entry !== '.git' && entry !== 'dist') {
          walkForSkeletons(full, results)
        }
      } else if (entry.endsWith('.skeleton.tsx')) {
        results.push(full)
      }
    } catch {
      // skip
    }
  }
}

function findSkeletonFiles(
  config: SkeletalConfig,
  projectRoot: string,
): string[] {
  const results: string[] = []
  // Search within the first static segment of each include pattern
  for (const pattern of config.include) {
    const parts = pattern.split('/')
    const staticParts: string[] = []
    for (const part of parts) {
      if (part.includes('*')) break
      staticParts.push(part)
    }
    const baseDir = resolve(projectRoot, ...staticParts)
    if (existsSync(baseDir)) {
      walkForSkeletons(baseDir, results)
    }
  }
  return [...new Set(results)]
}

export function runCheck(
  config: SkeletalConfig,
  projectRoot: string,
  logger: Logger,
): ResultAsync<CheckResult[], SkeletalError> {
  return fromPromise(
    (async () => {
      const skeletonFiles = findSkeletonFiles(config, projectRoot)
      logger.debug(`Checking ${skeletonFiles.length} skeleton files...`)

      const tsconfigPath = resolve(projectRoot, 'tsconfig.json')
      const project = new Project({
        tsConfigFilePath: existsSync(tsconfigPath) ? tsconfigPath : undefined,
        skipAddingFilesFromTsConfig: true,
      })

      const results: CheckResult[] = []

      for (const skeletonFile of skeletonFiles) {
        if (!existsSync(skeletonFile)) continue

        let content: string
        try {
          content = readFileSync(skeletonFile, 'utf-8')
        } catch {
          logger.warn(`Cannot read skeleton file: ${skeletonFile}`)
          continue
        }

        const { hash: storedHash, pattern: storedPattern, isEjected, componentName } = parseSkeletonHeader(content)

        if (isEjected) {
          logger.debug(`Skipping ejected skeleton: ${skeletonFile}`)
          continue
        }

        if (!storedHash || !storedPattern || !componentName) {
          logger.warn(`Skeleton file missing required headers: ${skeletonFile}`)
          continue
        }

        // Find the source component file
        const sourceFile = skeletonFile.replace('.skeleton.tsx', '.tsx')
        if (!existsSync(sourceFile)) {
          logger.warn(`Source file not found for skeleton: ${skeletonFile}`)
          results.push({
            componentName,
            skeletonFile,
            storedHash,
            currentHash: '',
            storedPattern,
            currentPattern: storedPattern,
            hashMatch: false,
            patternMatch: true,
            isEjected: false,
          })
          continue
        }

        let sf = project.getSourceFile(sourceFile)
        if (!sf) {
          sf = project.addSourceFileAtPath(sourceFile)
        }

        const fn = sf.getFunction(componentName)
        const hashNode = fn ?? sf
        const currentHash = computeAstHash(hashNode)

        // Detect current pattern only for RSC/CSR — lazy/dynamic patterns
        // are determined by usage site, not by the source function's async status.
        let currentPattern: LoadingPattern = storedPattern
        if (fn && (storedPattern === 'rsc' || storedPattern === 'csr')) {
          currentPattern = fn.isAsync() ? 'rsc' : 'csr'
        }

        results.push({
          componentName,
          skeletonFile,
          storedHash,
          currentHash,
          storedPattern,
          currentPattern,
          hashMatch: storedHash === currentHash,
          patternMatch: storedPattern === currentPattern,
          isEjected: false,
        })
      }

      return results
    })(),
    (cause): SkeletalError => ({
      code: ERROR_CODES.SOURCE_FILE_NOT_FOUND,
      message: `Check failed: ${cause instanceof Error ? cause.message : String(cause)}`,
      cause,
      recoverable: false,
    }),
  )
}
