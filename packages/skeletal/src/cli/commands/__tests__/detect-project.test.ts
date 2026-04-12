import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { detectProject } from '../detect-project.js'

function tmp(): string {
  const dir = resolve(tmpdir(), `skeletal-test-${Math.random().toString(36).slice(2)}`)
  mkdirSync(dir, { recursive: true })
  return dir
}

function writePkg(root: string, pkg: Record<string, unknown>): void {
  writeFileSync(resolve(root, 'package.json'), JSON.stringify(pkg), 'utf-8')
}

function makeDir(root: string, ...parts: string[]): string {
  const dir = resolve(root, ...parts)
  mkdirSync(dir, { recursive: true })
  return dir
}

function writePage(root: string, ...parts: string[]): void {
  const dir = makeDir(root, ...parts.slice(0, -1))
  writeFileSync(resolve(dir, parts[parts.length - 1] ?? 'page.tsx'), '', 'utf-8')
}

describe('detectProject', () => {
  let root: string

  beforeEach(() => { root = tmp() })
  afterEach(() => { rmSync(root, { recursive: true, force: true }) })

  describe('framework detection', () => {
    it('detects nextjs from dependencies', () => {
      writePkg(root, { dependencies: { next: '14.0.0' } })
      expect(detectProject(root).framework).toBe('nextjs')
    })

    it('detects vite from devDependencies', () => {
      writePkg(root, { devDependencies: { vite: '5.0.0' } })
      expect(detectProject(root).framework).toBe('vite')
    })

    it('returns undefined when no known framework', () => {
      writePkg(root, { dependencies: { react: '18.0.0' } })
      expect(detectProject(root).framework).toBeUndefined()
    })

    it('returns undefined when no package.json', () => {
      expect(detectProject(root).framework).toBeUndefined()
    })
  })

  describe('dev server URL detection', () => {
    it('defaults to 3000 for nextjs', () => {
      writePkg(root, { dependencies: { next: '14.0.0' } })
      expect(detectProject(root).devServerUrl).toBe('http://localhost:3000')
    })

    it('defaults to 5173 for vite', () => {
      writePkg(root, { devDependencies: { vite: '5.0.0' } })
      expect(detectProject(root).devServerUrl).toBe('http://localhost:5173')
    })

    it('extracts --port from dev script', () => {
      writePkg(root, { dependencies: { next: '14.0.0' }, scripts: { dev: 'next dev --port 4000' } })
      expect(detectProject(root).devServerUrl).toBe('http://localhost:4000')
    })

    it('extracts -p from dev script', () => {
      writePkg(root, { scripts: { dev: 'vite -p 8080' } })
      expect(detectProject(root).devServerUrl).toBe('http://localhost:8080')
    })

    it('falls back to start script', () => {
      writePkg(root, { scripts: { start: 'node server.js --port 9000' } })
      expect(detectProject(root).devServerUrl).toBe('http://localhost:9000')
    })
  })

  describe('app router discovery', () => {
    it('discovers root page in src/app/', () => {
      writePage(root, 'src', 'app', 'page.tsx')
      const result = detectProject(root)
      expect(result.routerType).toBe('app')
      expect(result.routes).toContain('/')
    })

    it('discovers nested route in app/', () => {
      writePage(root, 'app', 'page.tsx')
      writePage(root, 'app', 'dashboard', 'page.tsx')
      const result = detectProject(root)
      expect(result.routerType).toBe('app')
      expect(result.routes).toContain('/')
      expect(result.routes).toContain('/dashboard')
    })

    it('strips route groups from path', () => {
      writePage(root, 'app', '(marketing)', 'about', 'page.tsx')
      const result = detectProject(root)
      expect(result.routes).toContain('/about')
      expect(result.routes.some(r => r.includes('(marketing)'))).toBe(false)
    })

    it('preserves dynamic segments', () => {
      writePage(root, 'app', 'blog', '[slug]', 'page.tsx')
      const result = detectProject(root)
      expect(result.routes).toContain('/blog/[slug]')
    })

    it('ignores _ prefixed dirs like _not-found', () => {
      writePage(root, 'app', 'page.tsx')
      writePage(root, 'app', '_not-found', 'page.tsx')
      const result = detectProject(root)
      expect(result.routes).not.toContain('/_not-found')
      expect(result.routes).toContain('/')
    })

    it('prefers src/app/ over app/', () => {
      writePage(root, 'src', 'app', 'page.tsx')
      writePage(root, 'app', 'other', 'page.tsx')
      const result = detectProject(root)
      // src/app wins — only '/' should appear, not '/other'
      expect(result.routes).toContain('/')
      expect(result.routes).not.toContain('/other')
    })
  })

  describe('pages router discovery', () => {
    it('discovers index as /', () => {
      writePage(root, 'pages', 'index.tsx')
      const result = detectProject(root)
      expect(result.routerType).toBe('pages')
      expect(result.routes).toContain('/')
    })

    it('discovers nested page', () => {
      writePage(root, 'pages', 'about.tsx')
      const result = detectProject(root)
      expect(result.routes).toContain('/about')
    })

    it('strips /index suffix from nested dirs', () => {
      writePage(root, 'pages', 'blog', 'index.tsx')
      const result = detectProject(root)
      expect(result.routes).toContain('/blog')
    })

    it('excludes api/ routes', () => {
      writePage(root, 'pages', 'index.tsx')
      writePage(root, 'pages', 'api', 'users.ts')
      const result = detectProject(root)
      expect(result.routes).not.toContain('/api/users')
    })

    it('excludes _ prefixed files', () => {
      writePage(root, 'pages', 'index.tsx')
      writePage(root, 'pages', '_app.tsx')
      writePage(root, 'pages', '_document.tsx')
      const result = detectProject(root)
      expect(result.routes).not.toContain('/_app')
      expect(result.routes).not.toContain('/_document')
    })
  })

  describe('fallback', () => {
    it('returns ["/"] with routerType none when no router found', () => {
      writePkg(root, { dependencies: { react: '18.0.0' } })
      const result = detectProject(root)
      expect(result.routerType).toBe('none')
      expect(result.routes).toEqual(['/'])
    })
  })
})
