import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import * as clack from '@clack/prompts'
import { loadConfig } from '../../config/loader.js'

export async function runEject(options: {
  componentName: string
  projectRoot: string
}): Promise<void> {
  const { componentName, projectRoot } = options

  clack.intro(`skeletal eject ${componentName}`)

  const configResult = await loadConfig(projectRoot)
  if (configResult.isErr()) {
    clack.log.error(configResult.error.message)
    process.exit(2)
  }

  // Find skeleton file
  let skeletonPath: string | null = null
  const candidates = [
    resolve(projectRoot, `src/components/${componentName}.skeleton.tsx`),
    resolve(projectRoot, `src/${componentName}.skeleton.tsx`),
  ]

  // Try to find the file by pattern
  for (const p of candidates) {
    if (existsSync(p)) {
      skeletonPath = p
      break
    }
  }

  if (!skeletonPath) {
    clack.log.error(`No skeleton file found for ${componentName}. Looked in: ${candidates.join(', ')}`)
    process.exit(1)
  }

  const content = readFileSync(skeletonPath, 'utf-8')

  // Remove the skeletal:hash line to mark as ejected
  const updated = content
    .replace(/\/\/ skeletal:hash:[0-9a-f]{8}\n/, '// skeletal:ejected\n')

  writeFileSync(skeletonPath, updated, 'utf-8')
  clack.log.success(`Ejected ${componentName}. The skeleton file is now yours to edit freely.`)
  clack.outro(`skeletal check will skip ${componentName}.skeleton.tsx going forward.`)
}
