#!/usr/bin/env node
import { Command } from 'commander'
import { runInit } from './commands/init.js'
import { runAnalyze } from './commands/analyze.js'
import { runCheckCommand } from './commands/check.js'
import { runWatch } from './commands/watch.js'
import { runEject } from './commands/eject.js'
import { runPreview } from './commands/preview.js'

const projectRoot = process.cwd()

const program = new Command()
  .name('skeletal-ui')
  .description('Automate skeleton loading screens for React/Next.js TypeScript projects')
  .version('0.2.0')

program
  .command('init')
  .description('First-time setup wizard')
  .action(async () => {
    await runInit(projectRoot)
  })

program
  .command('analyze')
  .description('Scan components, crawl routes, generate skeleton files')
  .option('--only <name>', 'Only process a specific component by name')
  .option('--dry-run', 'Preview changes without writing files', false)
  .option('--no-browser', 'Generate minimal skeletons without browser crawl')
  .option('--verbose', 'Verbose output', false)
  .action(async (options: { only?: string; dryRun: boolean; browser: boolean; verbose: boolean }) => {
    await runAnalyze({
      projectRoot,
      dryRun: options.dryRun,
      noBrowser: !options.browser,
      only: options.only,
      verbose: options.verbose,
    })
  })

program
  .command('check')
  .description('Verify skeleton files are up to date with source components')
  .option('--json', 'Output results as JSON', false)
  .option('--verbose', 'Verbose output', false)
  .action(async (options: { json: boolean; verbose: boolean }) => {
    await runCheckCommand({
      projectRoot,
      json: options.json,
      verbose: options.verbose,
    })
  })

program
  .command('watch')
  .description('Watch for file changes and report affected skeletons')
  .option('--verbose', 'Verbose output', false)
  .action(async (options: { verbose: boolean }) => {
    await runWatch({ projectRoot, verbose: options.verbose })
  })

program
  .command('preview')
  .description('Start a local preview server showing real components vs skeletons')
  .option('--verbose', 'Verbose output', false)
  .action(async (options: { verbose: boolean }) => {
    await runPreview({ projectRoot, verbose: options.verbose })
  })

program
  .command('eject <componentName>')
  .description('Remove skeleton hash to allow manual editing without staleness warnings')
  .action(async (componentName: string) => {
    await runEject({ componentName, projectRoot })
  })

process.on('unhandledRejection', (reason) => {
  const msg = reason instanceof Error ? reason.message : String(reason)
  process.stderr.write(`\nskeletal: unhandled error: ${msg}\nThis may be a skeletal bug. Please report at https://github.com/...\n`)
  process.exit(1)
})

program.parse()
