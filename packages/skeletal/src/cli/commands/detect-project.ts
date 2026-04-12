import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { resolve, relative } from 'node:path'

export interface DetectedProject {
  framework: 'nextjs' | 'vite' | undefined
  devServerUrl: string
  routes: string[]
  routerType: 'app' | 'pages' | 'none'
}

function readPackageJson(projectRoot: string): Record<string, unknown> | undefined {
  const pkgPath = resolve(projectRoot, 'package.json')
  if (!existsSync(pkgPath)) return undefined
  try {
    return JSON.parse(readFileSync(pkgPath, 'utf-8')) as Record<string, unknown>
  } catch {
    return undefined
  }
}

function detectFramework(pkg: Record<string, unknown>): 'nextjs' | 'vite' | undefined {
  const deps = {
    ...((pkg['dependencies'] ?? {}) as Record<string, string>),
    ...((pkg['devDependencies'] ?? {}) as Record<string, string>),
  }
  if ('next' in deps) return 'nextjs'
  if ('vite' in deps) return 'vite'
  return undefined
}

function detectPort(pkg: Record<string, unknown>, framework: 'nextjs' | 'vite' | undefined): number {
  const scripts = (pkg['scripts'] ?? {}) as Record<string, string>
  const scriptValue = scripts['dev'] ?? scripts['start'] ?? ''
  const match = /(?:--port|-p)\s+(\d+)/.exec(scriptValue)
  if (match?.[1] !== undefined) {
    const parsed = parseInt(match[1], 10)
    if (!isNaN(parsed)) return parsed
  }
  return framework === 'vite' ? 5173 : 3000
}

function walkDir(dir: string): string[] {
  if (!existsSync(dir)) return []
  const results: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = resolve(dir, entry)
    try {
      const st = statSync(full)
      if (st.isDirectory()) {
        results.push(...walkDir(full))
      } else {
        results.push(full)
      }
    } catch {
      // skip inaccessible
    }
  }
  return results
}

function dirContainsPage(dir: string): boolean {
  try {
    return readdirSync(dir).some((f) => /^page\.[tj]sx?$/.test(f))
  } catch {
    return false
  }
}

function isSpecialAppDir(name: string): boolean {
  // Skip Next.js internal dirs: _not-found, _app, etc. and route groups are kept
  return name.startsWith('_')
}

function collectAppDirs(dir: string): string[] {
  if (!existsSync(dir)) return []
  const results: string[] = []
  if (dirContainsPage(dir)) {
    results.push(dir)
  }
  try {
    for (const entry of readdirSync(dir)) {
      if (isSpecialAppDir(entry)) continue
      const full = resolve(dir, entry)
      try {
        if (statSync(full).isDirectory()) {
          results.push(...collectAppDirs(full))
        }
      } catch {
        // skip
      }
    }
  } catch {
    // skip
  }
  return results
}

function dirToRoute(dir: string, appRoot: string): string {
  const rel = relative(appRoot, dir).replace(/\\/g, '/')
  if (!rel || rel === '.') return '/'
  // strip route groups like (group)
  const segments = rel.split('/').filter(s => !/^\(.*\)$/.test(s))
  if (segments.length === 0) return '/'
  return '/' + segments.join('/')
}

function discoverAppRoutes(appRoot: string): string[] {
  const dirs = collectAppDirs(appRoot)
  const routes = dirs.map(d => dirToRoute(d, appRoot))
  return [...new Set(routes)].sort()
}

function discoverPagesRoutes(pagesRoot: string): string[] {
  if (!existsSync(pagesRoot)) return []
  const files = walkDir(pagesRoot)
  const routes: string[] = []
  for (const f of files) {
    const rel = relative(pagesRoot, f).replace(/\\/g, '/')
    if (!/\.[tj]sx?$/.test(rel)) continue
    if (/^api\//.test(rel)) continue
    if (/^_/.test(rel.split('/').pop() ?? '')) continue
    const withoutExt = rel.replace(/\.[tj]sx?$/, '')
    const stripped = withoutExt === 'index' ? '' : withoutExt.replace(/\/index$/, '')
    const route = stripped === '' ? '/' : '/' + stripped
    routes.push(route)
  }
  return [...new Set(routes)].sort()
}

export function detectProject(projectRoot: string): DetectedProject {
  const pkg = readPackageJson(projectRoot)

  const framework = pkg ? detectFramework(pkg) : undefined
  const port = pkg ? detectPort(pkg, framework) : (framework === 'vite' ? 5173 : 3000)
  const devServerUrl = `http://localhost:${port}`

  // App router: try src/app/ then app/
  const appRoots = [
    resolve(projectRoot, 'src', 'app'),
    resolve(projectRoot, 'app'),
  ]
  for (const appRoot of appRoots) {
    if (existsSync(appRoot)) {
      const routes = discoverAppRoutes(appRoot)
      if (routes.length > 0) {
        return { framework, devServerUrl, routes, routerType: 'app' }
      }
    }
  }

  // Pages router: try src/pages/ then pages/
  const pagesRoots = [
    resolve(projectRoot, 'src', 'pages'),
    resolve(projectRoot, 'pages'),
  ]
  for (const pagesRoot of pagesRoots) {
    if (existsSync(pagesRoot)) {
      const routes = discoverPagesRoutes(pagesRoot)
      if (routes.length > 0) {
        return { framework, devServerUrl, routes, routerType: 'pages' }
      }
    }
  }

  return { framework, devServerUrl, routes: ['/'], routerType: 'none' }
}
