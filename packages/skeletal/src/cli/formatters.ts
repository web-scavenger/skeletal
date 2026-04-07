import chalk from 'chalk'
import type { CheckResult } from '../check/types.js'
import type { GeneratedFile } from '../codegen/types.js'

export function formatCheckResults(results: CheckResult[]): string {
  if (results.length === 0) {
    return chalk.green('✓ All skeleton files are up to date')
  }

  const stale = results.filter(r => !r.hashMatch || !r.patternMatch)
  const fresh = results.filter(r => r.hashMatch && r.patternMatch)

  const lines: string[] = []

  if (fresh.length > 0) {
    lines.push(chalk.green(`✓ ${fresh.length} skeleton(s) up to date`))
  }

  if (stale.length > 0) {
    lines.push(chalk.red(`✗ ${stale.length} skeleton(s) stale:`))
    for (const r of stale) {
      const reasons: string[] = []
      if (!r.hashMatch) reasons.push(`hash changed (${r.storedHash} → ${r.currentHash})`)
      if (!r.patternMatch) reasons.push(`pattern changed (${r.storedPattern} → ${r.currentPattern})`)
      lines.push(`  ${chalk.yellow(r.componentName)}: ${reasons.join(', ')}`)
      lines.push(`  ${chalk.dim(r.skeletonFile)}`)
    }
  }

  return lines.join('\n')
}

export function formatCheckResultsJson(results: CheckResult[]): string {
  return JSON.stringify(results, null, 2)
}

export function formatGeneratedFiles(files: GeneratedFile[]): string {
  const lines: string[] = []
  for (const f of files) {
    const status = f.isNew ? chalk.green('created') : chalk.yellow('updated')
    lines.push(`  ${status} ${f.outputPath}`)
    if (f.diff) {
      const diffLines = f.diff.split('\n').slice(0, 20)
      lines.push(chalk.dim(diffLines.map(l => `    ${l}`).join('\n')))
    }
  }
  return lines.join('\n')
}

export function formatDiff(diff: string): string {
  return diff.split('\n').map(line => {
    if (line.startsWith('+')) return chalk.green(line)
    if (line.startsWith('-')) return chalk.red(line)
    return chalk.dim(line)
  }).join('\n')
}
