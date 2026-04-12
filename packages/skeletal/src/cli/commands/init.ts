import { writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import * as clack from '@clack/prompts'
import { detectProject } from './detect-project.js'

function assertNotCancelled<T>(value: T | symbol): T {
  if (clack.isCancel(value)) {
    clack.cancel('Init cancelled.')
    process.exit(0)
  }
  return value as T
}

interface QuickConfig {
  devServer: string
  routes: string[]
  animation: 'shimmer' | 'pulse' | 'none'
}

interface AdvancedConfig extends QuickConfig {
  radius: number
  framework?: 'nextjs' | 'vite'
  concurrency: string
}

const DEFAULT_INCLUDE = 'src/**/*.tsx'
const DEFAULT_EXCLUDE = ['**/*.test.*', '**/*.spec.*', '**/node_modules/**']

function serializeQuickConfig(cfg: QuickConfig): string {
  const routesLiteral = cfg.routes.map(r => `'${r}'`).join(', ')
  const excludeLiteral = DEFAULT_EXCLUDE.map(e => `'${e}'`).join(', ')
  return [
    'import { defineConfig } from \'skeletal-ui\'',
    '',
    'export default defineConfig({',
    `  devServer: '${cfg.devServer}',`,
    `  routes: [${routesLiteral}],`,
    `  include: ['${DEFAULT_INCLUDE}'],`,
    `  exclude: [${excludeLiteral}],`,
    '  output: \'colocated\',',
    `  animation: '${cfg.animation}',`,
    '})',
    '',
  ].join('\n')
}

function serializeAdvancedConfig(cfg: AdvancedConfig): string {
  const routesLiteral = cfg.routes.map(r => `'${r}'`).join(', ')
  const excludeLiteral = DEFAULT_EXCLUDE.map(e => `'${e}'`).join(', ')
  const lines: string[] = [
    'import { defineConfig } from \'skeletal-ui\'',
    '',
    'export default defineConfig({',
    `  devServer: '${cfg.devServer}',`,
    `  routes: [${routesLiteral}],`,
    `  include: ['${DEFAULT_INCLUDE}'],`,
    `  exclude: [${excludeLiteral}],`,
    '  output: \'colocated\',',
    `  animation: '${cfg.animation}',`,
    `  radius: ${cfg.radius},`,
  ]
  if (cfg.framework) {
    lines.push(`  framework: '${cfg.framework}',`)
  }
  lines.push('  csr: { enabled: true },')
  lines.push('  lazy: { enabled: true },')
  lines.push('  dynamic: { enabled: true, detectStandalone: true },')
  lines.push(`  concurrency: ${cfg.concurrency},`)
  lines.push('})')
  lines.push('')
  return lines.join('\n')
}

function parseRouteInput(input: string): string[] {
  return input
    .split(',')
    .map(r => r.trim())
    .filter(Boolean)
}

export async function runInit(projectRoot: string): Promise<void> {
  clack.intro('skeletal — skeleton loading screen generator')

  const detected = detectProject(projectRoot)

  const configPath = resolve(projectRoot, 'skeletal.config.ts')

  if (existsSync(configPath)) {
    const overwrite = assertNotCancelled(
      await clack.confirm({
        message: 'skeletal.config.ts already exists. Overwrite?',
        initialValue: false,
      }),
    )
    if (!overwrite) {
      clack.cancel('Init cancelled.')
      return
    }
  }

  // --- Mode selection ---
  const mode = assertNotCancelled(
    await clack.select({
      message: 'Which setup mode do you want?',
      options: [
        { value: 'quick', label: 'Quick', hint: 'devServer + routes, sensible defaults' },
        { value: 'advanced', label: 'Advanced', hint: 'full config with all options' },
      ],
    }),
  ) as 'quick' | 'advanced'

  // --- Shared prompts (both modes) ---

  const devServer = assertNotCancelled(
    await clack.text({
      message: 'Dev server URL?',
      initialValue: detected.devServerUrl,
      validate: (v) => {
        try { new URL(v); return undefined } catch { return 'Please enter a valid URL' }
      },
    }),
  ) as string

  let finalRoutes: string[]

  if (detected.routes.length > 1 || (detected.routes.length === 1 && detected.routes[0] !== '/')) {
    const routeOptions = [
      ...detected.routes.map(r => ({ value: r, label: r })),
      { value: '__custom__', label: '+ Enter custom routes…' },
    ]

    const selected = assertNotCancelled(
      await clack.multiselect({
        message: 'Which routes should skeletal crawl?',
        options: routeOptions,
        initialValues: detected.routes,
        required: false,
      }),
    ) as string[]

    let customRoutes: string[] = []
    if (selected.includes('__custom__')) {
      const customInput = assertNotCancelled(
        await clack.text({
          message: 'Additional routes (comma-separated):',
          placeholder: '/about, /contact',
        }),
      ) as string
      customRoutes = parseRouteInput(customInput)
    }

    const discovered = selected.filter(r => r !== '__custom__')
    finalRoutes = [...new Set([...discovered, ...customRoutes])]
    if (finalRoutes.length === 0) finalRoutes = ['/']
  } else {
    const routeInput = assertNotCancelled(
      await clack.text({
        message: 'Which routes should skeletal crawl? (comma-separated)',
        placeholder: '/, /dashboard, /profile',
        initialValue: '/',
      }),
    ) as string
    finalRoutes = parseRouteInput(routeInput)
    if (finalRoutes.length === 0) finalRoutes = ['/']
  }

  const animation = assertNotCancelled(
    await clack.select({
      message: 'Loading animation?',
      options: [
        { value: 'shimmer', label: 'shimmer' },
        { value: 'pulse', label: 'pulse' },
        { value: 'none', label: 'none' },
      ],
      initialValue: 'shimmer',
    }),
  ) as 'shimmer' | 'pulse' | 'none'

  if (mode === 'quick') {
    const cfg: QuickConfig = { devServer, routes: finalRoutes, animation }
    const configContent = serializeQuickConfig(cfg)

    clack.note(configContent, 'Generated skeletal.config.ts')

    const doWrite = assertNotCancelled(
      await clack.confirm({ message: 'Write this config?', initialValue: true }),
    )

    if (!doWrite) {
      clack.cancel('Init cancelled.')
      return
    }

    writeFileSync(configPath, configContent, 'utf-8')
    printNextSteps()
    return
  }

  // --- Advanced-only prompts ---

  const radiusRaw = assertNotCancelled(
    await clack.text({
      message: 'Border radius (px)?',
      initialValue: '6',
      validate: (v) => (isNaN(parseInt(v, 10)) ? 'Must be a number' : undefined),
    }),
  ) as string
  const radius = parseInt(radiusRaw, 10)

  let framework: 'nextjs' | 'vite' | undefined = detected.framework
  if (!detected.framework) {
    const fw = assertNotCancelled(
      await clack.select({
        message: 'Framework?',
        options: [
          { value: 'nextjs', label: 'Next.js' },
          { value: 'vite', label: 'Vite' },
          { value: 'none', label: 'None / Other' },
        ],
        initialValue: 'none',
      }),
    ) as 'nextjs' | 'vite' | 'none'
    framework = fw === 'none' ? undefined : fw
  } else {
    clack.log.info(`Detected framework: ${detected.framework}`)
  }

  const concurrency = assertNotCancelled(
    await clack.text({
      message: 'Playwright concurrency (parallel pages)?',
      initialValue: '4',
      validate: (v) => (isNaN(parseInt(v, 10)) ? 'Must be a number' : undefined),
    }),
  ) as string

  const cfg: AdvancedConfig = {
    devServer,
    routes: finalRoutes,
    animation,
    radius,
    framework,
    concurrency,
  }

  const configContent = serializeAdvancedConfig(cfg)

  clack.note(configContent, 'Generated skeletal.config.ts')

  const doWrite = assertNotCancelled(
    await clack.confirm({ message: 'Write this config?', initialValue: true }),
  )

  if (!doWrite) {
    clack.cancel('Init cancelled.')
    return
  }

  writeFileSync(configPath, configContent, 'utf-8')
  printNextSteps()
}

function printNextSteps(): void {
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
