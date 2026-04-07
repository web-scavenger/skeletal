import { writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import * as clack from '@clack/prompts'

export async function runInit(projectRoot: string): Promise<void> {
  clack.intro('skeletal — skeleton loading screen generator')

  const configPath = resolve(projectRoot, 'skeletal.config.ts')

  if (existsSync(configPath)) {
    const overwrite = await clack.confirm({
      message: 'skeletal.config.ts already exists. Overwrite?',
      initialValue: false,
    })
    if (clack.isCancel(overwrite) || !overwrite) {
      clack.cancel('Init cancelled.')
      return
    }
  }

  const devServer = await clack.text({
    message: 'What is your dev server URL?',
    placeholder: 'http://localhost:3000',
    defaultValue: 'http://localhost:3000',
    validate: (v) => {
      try {
        new URL(v)
        return undefined
      } catch {
        return 'Please enter a valid URL'
      }
    },
  })

  if (clack.isCancel(devServer)) {
    clack.cancel('Init cancelled.')
    return
  }

  const routes = await clack.text({
    message: 'Which routes should skeletal crawl? (comma-separated)',
    placeholder: '/, /dashboard, /profile',
    defaultValue: '/',
  })

  if (clack.isCancel(routes)) {
    clack.cancel('Init cancelled.')
    return
  }

  const routeList = String(routes)
    .split(',')
    .map(r => r.trim())
    .filter(Boolean)
    .map(r => `'${r}'`)
    .join(', ')

  const configContent = [
    'import { defineConfig } from \'skeletal\'',
    '',
    'export default defineConfig({',
    `  devServer: '${String(devServer)}',`,
    `  routes: [${routeList}],`,
    '  include: [\'src/**/*.tsx\'],',
    '  output: \'colocated\',',
    '})',
    '',
  ].join('\n')

  writeFileSync(configPath, configContent, 'utf-8')

  clack.note(
    [
      '1. Install the Playwright browser (one-time):',
      '   npx playwright install chromium',
      '',
      '2. Start your dev server, then run:',
      '   npx skeletal analyze',
      '',
      '3. To skip browser crawl and generate minimal skeletons:',
      '   npx skeletal analyze --no-browser',
    ].join('\n'),
    'Next steps',
  )

  clack.outro('Created skeletal.config.ts')
}
