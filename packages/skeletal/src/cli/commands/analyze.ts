import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import * as clack from '@clack/prompts'
import { loadConfig } from '../../config/loader.js'
import { scanCandidates } from '../../ast-scanner/scanner.js'
import { crawlRoutes } from '../../playwright-crawler/crawler.js'
import { classify } from '../../classifier/classifier.js'
import { generateSkeleton, generateSkeletonFromBody } from '../../codegen/generator.js'
import { applyCodemod } from '../../codemod/apply.js'
import { injectDataSk } from '../../marker-injector/transform.js'
import { generateSkeletonBodyFromSource, generateSkeletonBodyWithGeometry } from '../../ast-skeleton-generator/index.js'
import { createLogger } from '../../logger.js'
import { Project } from 'ts-morph'
import type { SkeletalCandidate } from '../../ast-scanner/types.js'
import type { SkeletalConfig } from '../../config/types.js'
import type { Logger } from '../../logger.js'

export interface AnalyzeContext {
  config: SkeletalConfig
  logger: Logger
  dryRun: boolean
  noBrowser: boolean
  only: string | undefined
}

export async function runAnalyze(options: {
  projectRoot: string
  dryRun: boolean
  noBrowser: boolean
  only: string | undefined
  verbose: boolean
}): Promise<void> {
  const { projectRoot, dryRun, noBrowser, only, verbose } = options
  const logger = createLogger(verbose)

  clack.intro('skeletal analyze')

  // Load config
  const configResult = await loadConfig(projectRoot)
  if (configResult.isErr()) {
    clack.log.error(configResult.error.message)
    process.exit(2)
  }
  const config = configResult.value

  // Scan for candidates
  const s = clack.spinner()
  s.start('Scanning TypeScript files...')
  const scanResult = await scanCandidates(config, projectRoot, logger)
  if (scanResult.isErr()) {
    s.stop('Scan failed')
    clack.log.error(scanResult.error.message)
    process.exit(1)
  }
  let candidates = scanResult.value
  s.stop(`Found ${candidates.length} skeleton candidates`)

  if (only !== undefined) {
    candidates = candidates.filter(c => c.name === only)
    if (candidates.length === 0) {
      clack.log.warn(`No candidate found with name: ${only}`)
      process.exit(0)
    }
  }

  if (candidates.length === 0) {
    clack.outro('No skeleton candidates found. Wrap components with <SkeletonWrapper> to get started.')
    return
  }

  if (noBrowser) {
    clack.log.info('Skipping browser crawl (--no-browser). Generating minimal skeletons.')
    await generateMinimalSkeletons(candidates, config, projectRoot, dryRun, logger)
    clack.outro('Done.')
    return
  }

  // Inject data-sk markers into source files before crawling
  const originalSources = new Map<string, string>()
  const sourceFilePaths = [...new Set(candidates.map(c => c.sourceFile))]
  for (const filePath of sourceFilePaths) {
    try {
      const original = readFileSync(filePath, 'utf-8')
      const modified = injectDataSk(original, filePath, candidates)
      if (modified !== original) {
        originalSources.set(filePath, original)
        writeFileSync(filePath, modified, 'utf-8')
        logger.debug(`Injected data-sk into ${filePath}`)
      }
    } catch {
      // Non-fatal: skip injection for this file
    }
  }

  // Allow dev server to detect the file changes and begin recompiling.
  // The Playwright goto (networkidle) will wait for bundles to finish serving,
  // but giving Next.js a head start avoids the first navigation being slow.
  if (originalSources.size > 0) {
    await new Promise<void>(resolve => setTimeout(resolve, 3000))
  }

  // Crawl with Playwright
  s.start('Crawling routes with Playwright...')
  const crawlResult = await crawlRoutes(config, candidates, logger)

  // Restore original source files regardless of crawl outcome
  for (const [filePath, original] of originalSources) {
    try {
      writeFileSync(filePath, original, 'utf-8')
    } catch {
      logger.warn(`Could not restore ${filePath}`)
    }
  }

  if (crawlResult.isErr()) {
    s.stop('Crawl failed')
    clack.log.error(crawlResult.error.message)
    if (crawlResult.error.code === 'PLAYWRIGHT_LAUNCH_FAILED') {
      clack.log.info('Run: npx playwright install chromium')
    }
    process.exit(1)
  }
  const geometries = crawlResult.value
  s.stop(`Extracted geometry from ${geometries.length} measurements`)

  // Generate skeletons
  const project = new Project({
    tsConfigFilePath: resolve(projectRoot, 'tsconfig.json'),
    skipAddingFilesFromTsConfig: true,
  })

  let generated = 0
  let failed = 0

  for (const candidate of candidates) {
    // Find geometries for this candidate
    const candidateGeometries = geometries.filter(g => g.componentName === candidate.name)
    // Use largest breakpoint geometry for codegen (or first available)
    const geometry = candidateGeometries.sort((a, b) => b.breakpoint - a.breakpoint)[0]

    if (!geometry) {
      logger.warn(`No geometry found for ${candidate.name}. Skipping.`)
      continue
    }

    const outputPath = candidate.sourceFile.replace(/\.(js|tsx?|jsx?)$/, '') + '.skeleton.tsx'

    // AST structure + Playwright geometry for real sizes
    const astBody = generateSkeletonBodyWithGeometry(candidate.sourceFile, candidate.name, geometry)
    const genResult = astBody !== null
      ? generateSkeletonFromBody(candidate, astBody, outputPath, logger)
      : generateSkeleton(candidate, classify(geometry), outputPath, logger)
    if (genResult.isErr()) {
      logger.error(`Codegen failed for ${candidate.name}: ${genResult.error.message}`)
      failed++
      continue
    }

    const file = genResult.value

    if (!dryRun) {
      try {
        mkdirSync(dirname(file.outputPath), { recursive: true })
        writeFileSync(file.outputPath, file.content, 'utf-8')
        logger.success(`${file.isNew ? 'Created' : 'Updated'}: ${file.outputPath}`)
      } catch (e) {
        logger.error(`Failed to write ${file.outputPath}: ${e instanceof Error ? e.message : String(e)}`)
        failed++
        continue
      }

      // Apply codemod if autoWire
      if (config.autoWire && !candidate.isEjected) {
        project.addSourceFileAtPath(candidate.usageFile)
        const codemodResult = await applyCodemod(candidate, project, logger)
        if (codemodResult.isErr()) {
          logger.warn(`Codemod failed for ${candidate.name}. Apply manually.`)
        }
      }
    } else {
      logger.info(`[dry-run] Would ${file.isNew ? 'create' : 'update'}: ${file.outputPath}`)
    }

    generated++
  }

  const summary = dryRun
    ? `Dry run complete: ${generated} skeleton(s) would be generated`
    : `Done: ${generated} skeleton(s) generated${failed > 0 ? `, ${failed} failed` : ''}`

  clack.outro(summary)

  if (failed > 0 && !dryRun) {
    process.exit(1)
  }
}

async function generateMinimalSkeletons(
  candidates: SkeletalCandidate[],
  config: SkeletalConfig,
  projectRoot: string,
  dryRun: boolean,
  logger: Logger,
): Promise<void> {
  const project = new Project({
    tsConfigFilePath: resolve(projectRoot, 'tsconfig.json'),
    skipAddingFilesFromTsConfig: true,
  })

  for (const candidate of candidates) {
    const outputPath = candidate.sourceFile.replace(/\.(js|tsx?|jsx?)$/, '') + '.skeleton.tsx'

    // Try AST-based generation first; fall back to minimal card
    const astBody = generateSkeletonBodyFromSource(candidate.sourceFile, candidate.name)
    const genResult = astBody !== null
      ? generateSkeletonFromBody(candidate, astBody, outputPath, logger)
      : generateSkeleton(candidate, [{
        primitiveType: 'Card' as const,
        props: { width: '100%', height: 200 },
        relativeWidth: '100%',
        children: [],
      }], outputPath, logger)

    if (genResult.isErr()) {
      logger.error(`Codegen failed for ${candidate.name}`)
      continue
    }

    const file = genResult.value
    if (!dryRun) {
      try {
        mkdirSync(dirname(file.outputPath), { recursive: true })
        writeFileSync(file.outputPath, file.content, 'utf-8')
        logger.success(`${file.isNew ? 'Created' : 'Updated'}: ${file.outputPath}`)
      } catch (e) {
        logger.error(`Failed to write ${file.outputPath}: ${e instanceof Error ? e.message : String(e)}`)
        continue
      }

      if (config.autoWire && !candidate.isEjected) {
        project.addSourceFileAtPath(candidate.usageFile)
        await applyCodemod(candidate, project, logger)
      }
    } else {
      logger.info(`[dry-run] Would ${file.isNew ? 'create' : 'update'}: ${file.outputPath}`)
    }
  }
}
