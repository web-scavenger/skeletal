import * as clack from '@clack/prompts'
import { loadConfig } from '../../config/loader.js'
import { runCheck } from '../../check/check.js'
import { createLogger } from '../../logger.js'
import { formatCheckResults, formatCheckResultsJson } from '../formatters.js'

export async function runCheckCommand(options: {
  projectRoot: string
  json: boolean
  verbose: boolean
}): Promise<void> {
  const { projectRoot, json, verbose } = options
  const logger = createLogger(verbose)

  if (!json) {
    clack.intro('skeletal check')
  }

  const configResult = await loadConfig(projectRoot)
  if (configResult.isErr()) {
    if (json) {
      process.stdout.write(JSON.stringify({ error: configResult.error.message }) + '\n')
    } else {
      clack.log.error(configResult.error.message)
    }
    process.exit(2)
  }

  const checkResult = await runCheck(configResult.value, projectRoot, logger)
  if (checkResult.isErr()) {
    if (json) {
      process.stdout.write(JSON.stringify({ error: checkResult.error.message }) + '\n')
    } else {
      clack.log.error(checkResult.error.message)
    }
    process.exit(1)
  }

  const results = checkResult.value

  if (json) {
    process.stdout.write(formatCheckResultsJson(results) + '\n')
  } else {
    const stale = results.filter(r => !r.hashMatch || !r.patternMatch)
    clack.log.message(formatCheckResults(results))
    clack.outro(stale.length === 0 ? 'All skeletons up to date.' : `${stale.length} skeleton(s) need regeneration. Run 'skeletal analyze'.`)
  }

  const hasStale = results.some(r => !r.hashMatch || !r.patternMatch)
  if (hasStale) {
    process.exit(1)
  }
}
