import { createServer } from 'node:http'
import { fromPromise } from '../errors.js'
import type { ResultAsync, SkeletalError } from '../errors.js'
import type { SkeletalConfig } from '../config/types.js'
import type { SkeletalCandidate } from '../ast-scanner/types.js'
import type { Logger } from '../logger.js'

const PREVIEW_PORT = 3737

function buildPreviewHtml(
  candidates: SkeletalCandidate[],
  devServerUrl: string,
): string {
  const candidateLinks = candidates.map(c =>
    `<li><a href="?component=${encodeURIComponent(c.name)}">${c.name} (${c.pattern})</a></li>`,
  ).join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>skeletal preview</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; }
    .layout { display: grid; grid-template-columns: 240px 1fr; height: 100vh; }
    .sidebar { padding: 16px; border-right: 1px solid #e2e8f0; overflow-y: auto; }
    .sidebar h2 { font-size: 14px; font-weight: 600; margin: 0 0 12px; }
    .sidebar ul { list-style: none; margin: 0; padding: 0; }
    .sidebar li { margin: 4px 0; }
    .sidebar a { color: #4f46e5; text-decoration: none; font-size: 13px; }
    .sidebar a:hover { text-decoration: underline; }
    .main { display: grid; grid-template-rows: 1fr; overflow: hidden; }
    .panels { display: grid; grid-template-columns: 1fr 1fr; height: 100%; }
    .panel { padding: 16px; border-right: 1px solid #e2e8f0; overflow: auto; }
    .panel h3 { font-size: 13px; font-weight: 500; color: #64748b; margin: 0 0 12px; }
    .empty { display: flex; align-items: center; justify-content: center; height: 100%; color: #94a3b8; font-size: 13px; }
  </style>
</head>
<body>
  <div class="layout">
    <div class="sidebar">
      <h2>skeletal preview</h2>
      <ul>${candidateLinks || '<li style="color:#94a3b8">No candidates found</li>'}</ul>
    </div>
    <div class="main">
      <div class="panels">
        <div class="panel">
          <h3>Skeleton</h3>
          <div id="skeleton-panel"><div class="empty">Select a component</div></div>
        </div>
        <div class="panel">
          <h3>Live (proxied from ${devServerUrl})</h3>
          <div id="live-panel"><div class="empty">Select a component</div></div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`
}

export function startPreviewServer(
  config: SkeletalConfig,
  candidates: SkeletalCandidate[],
  logger: Logger,
): ResultAsync<void, SkeletalError> {
  return fromPromise(
    new Promise<void>((resolve, reject) => {
      const server = createServer((req, res) => {
        const html = buildPreviewHtml(candidates, config.devServer)
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        res.end(html)
      })

      server.listen(PREVIEW_PORT, () => {
        logger.success(`Preview server running at http://localhost:${PREVIEW_PORT}`)
        logger.info('Press Ctrl+C to stop.')

        process.on('SIGINT', () => {
          server.close()
          resolve()
          process.exit(0)
        })
      })

      server.on('error', reject)
    }),
    (cause): SkeletalError => ({
      code: 'FILE_WRITE_FAILED' as const,
      message: `Failed to start preview server: ${cause instanceof Error ? cause.message : String(cause)}`,
      cause,
      recoverable: false,
    }),
  )
}
