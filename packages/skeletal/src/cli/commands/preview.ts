import * as clack from '@clack/prompts'
import { loadConfig } from '../../config/loader.js'
import { createLogger } from '../../logger.js'
import { startPreviewServer } from '../../preview/server.js'

export async function runPreview(options: {
  projectRoot: string
  verbose: boolean
}): Promise<void> {
  const { projectRoot, verbose } = options
  const logger = createLogger(verbose)

  clack.intro('skeletal preview')

  const configResult = await loadConfig(projectRoot)
  if (configResult.isErr()) {
    clack.log.error(configResult.error.message)
    process.exit(2)
  }

  const result = await startPreviewServer(configResult.value, [], logger)
  if (result.isErr()) {
    clack.log.error(result.error.message)
    process.exit(1)
  }
}
