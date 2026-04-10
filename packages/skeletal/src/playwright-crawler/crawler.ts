import { chromium } from '@playwright/test'
import type { Browser, BrowserContext, Page } from '@playwright/test'
import { fromPromise } from '../errors.js'
import { ERROR_CODES } from '../errors.js'
import type { ResultAsync, SkeletalError } from '../errors.js'
import type { SkeletalConfig, RouteConfig } from '../config/types.js'
import type { SkeletalCandidate, LoadingPattern } from '../ast-scanner/types.js'
import { LOADING_PATTERNS } from '../ast-scanner/types.js'
import type { Logger } from '../logger.js'
import { extractChildGeometryScript, normalizeChildGeometry } from './geometry.js'
import type { ExtractedGeometry, BoundingBox } from './types.js'

const PHASE2_TIMEOUT = 30_000
const LAYOUT_SETTLE_MS = 150
const MAX_CONCURRENT_PAGES = 4

function getRouteUrl(devServer: string, route: string | RouteConfig): string {
  const path = typeof route === 'string' ? route : route.path
  const base = devServer.replace(/\/$/, '')
  return `${base}${path}`
}

function getRouteAuth(route: string | RouteConfig): string | undefined {
  return typeof route === 'object' ? route.auth : undefined
}

async function waitForComponent(
  page: Page,
  componentName: string,
  pattern: LoadingPattern,
): Promise<void> {
  // Phase 1: Network idle
  // For all patterns: ensure React has fully hydrated with the latest compiled bundles.
  // For lazy/dynamic: also waits for the lazy chunk to be loaded by the module system.
  // (goto already uses networkidle, but a second wait is a safety net for chunks that
  //  load after React's initial render completes — e.g. deferred lazy imports.)
  if (pattern === LOADING_PATTERNS.LAZY || pattern === LOADING_PATTERNS.DYNAMIC) {
    await page.waitForLoadState('networkidle', { timeout: PHASE2_TIMEOUT })
  }

  // Phase 2: data-sk element visible
  await page.locator(`[data-sk="${componentName}"]`).waitFor({
    state: 'visible',
    timeout: PHASE2_TIMEOUT,
  })

  // Phase 3: Layout settle
  await page.waitForTimeout(LAYOUT_SETTLE_MS)
}

async function measureAtBreakpoint(
  context: BrowserContext,
  url: string,
  candidate: SkeletalCandidate,
  breakpoint: number,
  logger: Logger,
): Promise<ExtractedGeometry> {
  const page = await context.newPage()
  await page.setViewportSize({ width: breakpoint, height: 900 })

  try {
    // Use networkidle so the browser has received and executed all JS bundles
    // (including any that are still compiling due to a recent HMR source change)
    // before we attempt to locate data-sk elements. Without this, React may hydrate
    // with a stale client bundle and overwrite SSR attributes during reconciliation.
    await page.goto(url, { waitUntil: 'networkidle', timeout: PHASE2_TIMEOUT })

    try {
      await waitForComponent(page, candidate.name, candidate.pattern)
    } catch {
      logger.warn(`Timeout waiting for [data-sk="${candidate.name}"] at ${url} (${breakpoint}px)`)
      return {
        componentName: candidate.name,
        pattern: candidate.pattern,
        breakpoint,
        boundingBox: { x: 0, y: 0, width: 0, height: 0 },
        children: [],
        timedOut: true,
      }
    }

    const locator = page.locator(`[data-sk="${candidate.name}"]`).first()
    const box = await locator.boundingBox()
    const boundingBox: BoundingBox = box ?? { x: 0, y: 0, width: 0, height: 0 }

    const childrenRaw = await locator.evaluate(
      new Function('element', `return (${extractChildGeometryScript()})(element)`) as (el: Element) => unknown,
    )
    const children = normalizeChildGeometry(childrenRaw)

    return {
      componentName: candidate.name,
      pattern: candidate.pattern,
      breakpoint,
      boundingBox,
      children,
      timedOut: false,
    }
  } finally {
    await page.close()
  }
}

async function crawlCandidate(
  context: BrowserContext,
  url: string,
  candidate: SkeletalCandidate,
  breakpoints: number[],
  logger: Logger,
): Promise<ExtractedGeometry[]> {
  const results: ExtractedGeometry[] = []

  for (const breakpoint of breakpoints) {
    logger.debug(`Measuring ${candidate.name} at ${breakpoint}px on ${url}`)
    const geometry = await measureAtBreakpoint(context, url, candidate, breakpoint, logger)
    results.push(geometry)
  }

  return results
}

export function crawlRoutes(
  config: SkeletalConfig,
  candidates: SkeletalCandidate[],
  logger: Logger,
): ResultAsync<ExtractedGeometry[], SkeletalError> {
  return fromPromise(
    (async () => {
      let browser: Browser | null = null

      try {
        browser = await chromium.launch()
      } catch (e) {
        throw Object.assign(new Error(`Playwright browser launch failed: ${e instanceof Error ? e.message : String(e)}`), {
          code: ERROR_CODES.PLAYWRIGHT_LAUNCH_FAILED,
        })
      }

      const allGeometries: ExtractedGeometry[] = []

      try {
        for (const route of config.routes) {
          const url = getRouteUrl(config.devServer, route)
          const authPath = getRouteAuth(route)

          const contextOptions = authPath ? { storageState: authPath } : {}
          const context = await browser.newContext(contextOptions)

          // Group candidates for this route; process in chunks of MAX_CONCURRENT_PAGES
          const candidateChunks: SkeletalCandidate[][] = []
          for (let i = 0; i < candidates.length; i += MAX_CONCURRENT_PAGES) {
            candidateChunks.push(candidates.slice(i, i + MAX_CONCURRENT_PAGES))
          }

          for (const chunk of candidateChunks) {
            const chunkResults = await Promise.all(
              chunk.map(c => crawlCandidate(context, url, c, config.breakpoints, logger)),
            )
            for (const results of chunkResults) {
              allGeometries.push(...results)
            }
          }

          await context.close()
        }
      } finally {
        await browser.close()
      }

      return allGeometries
    })(),
    (cause): SkeletalError => {
      const err = cause instanceof Error ? cause : new Error(String(cause))
      const isLaunchFail = err.message.includes('Playwright browser launch failed')
      return {
        code: isLaunchFail ? ERROR_CODES.PLAYWRIGHT_LAUNCH_FAILED : ERROR_CODES.PLAYWRIGHT_TIMEOUT,
        message: err.message,
        cause,
        recoverable: false,
      }
    },
  )
}
