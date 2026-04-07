import { resolve } from 'node:path'
import * as clack from '@clack/prompts'
import chokidar from 'chokidar'
import { loadConfig } from '../../config/loader.js'
import { scanCandidates } from '../../ast-scanner/scanner.js'
import { createLogger } from '../../logger.js'

export async function runWatch(options: {
  projectRoot: string
  verbose: boolean
}): Promise<void> {
  const { projectRoot, verbose } = options
  const logger = createLogger(verbose)

  clack.intro('skeletal watch')

  const configResult = await loadConfig(projectRoot)
  if (configResult.isErr()) {
    clack.log.error(configResult.error.message)
    process.exit(2)
  }
  const config = configResult.value

  const patterns = config.include.map(p => resolve(projectRoot, p))
  const watcher = chokidar.watch(patterns, {
    ignored: config.exclude,
    persistent: true,
  })

  clack.log.info(`Watching ${patterns.length} pattern(s) for changes...`)
  clack.log.info('Press Ctrl+C to stop.')

  const runScan = async (changedFile: string) => {
    logger.step(`File changed: ${changedFile}`)
    const scanResult = await scanCandidates(config, projectRoot, logger)
    if (scanResult.isErr()) {
      logger.error(`Scan failed: ${scanResult.error.message}`)
      return
    }
    const affected = scanResult.value.filter(c => c.sourceFile === changedFile || c.usageFile === changedFile)
    if (affected.length > 0) {
      logger.info(`${affected.length} candidate(s) affected. Run 'skeletal analyze --only ${affected.map(c => c.name).join(',')}' to regenerate.`)
    }
  }

  watcher.on('change', (path) => {
    runScan(path).catch((e: unknown) => {
      logger.error(`Watch error: ${e instanceof Error ? e.message : String(e)}`)
    })
  })

  // Keep process alive
  await new Promise<void>(() => {
    // Resolved by SIGINT/SIGTERM
    process.on('SIGINT', () => {
      watcher.close().catch(() => undefined)
      clack.outro('Watch stopped.')
      process.exit(0)
    })
  })
}
