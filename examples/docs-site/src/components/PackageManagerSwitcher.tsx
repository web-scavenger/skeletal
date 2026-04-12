'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'
import { CopyButton } from './CopyButton'

const MANAGERS = ['pnpm', 'npm', 'yarn'] as const
type PM = (typeof MANAGERS)[number]

const INSTALL: Record<PM, string> = {
  pnpm: 'pnpm add skeletal-ui',
  npm: 'npm install skeletal-ui',
  yarn: 'yarn add skeletal-ui',
}

const INIT: Record<PM, string> = {
  pnpm: 'pnpm dlx skeletal-ui init',
  npm: 'npx skeletal-ui init',
  yarn: 'yarn dlx skeletal-ui init',
}

const ANALYZE: Record<PM, string> = {
  pnpm: 'pnpm dlx skeletal-ui analyze',
  npm: 'npx skeletal-ui analyze',
  yarn: 'yarn dlx skeletal-ui analyze',
}

interface Props {
  generatedConfigBlock: ReactNode
}

export function PackageManagerSwitcher({ generatedConfigBlock }: Props) {
  const [pm, setPm] = useState<PM>('pnpm')

  return (
    <div className="flex flex-col gap-8">
      {/* Step 1 — Install */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">1. Install</p>
          <div className="flex gap-1 p-1 rounded-lg bg-slate-900 border border-slate-800">
            {MANAGERS.map(m => (
              <button
                key={m}
                onClick={() => setPm(m)}
                className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition-colors ${
                  pm === m
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-sm">
          <div className="flex items-center gap-3 text-slate-300 min-w-0">
            <span className="text-slate-500 select-none flex-shrink-0">$</span>
            <span className="truncate">{INSTALL[pm]}</span>
          </div>
          <CopyButton text={INSTALL[pm]} />
        </div>
      </div>

      {/* Step 2 — Init wizard */}
      <div>
        <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">2. Init</p>
        <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-sm">
          <div className="flex items-center gap-3 text-slate-300 min-w-0">
            <span className="text-slate-500 select-none flex-shrink-0">$</span>
            <span className="truncate">{INIT[pm]}</span>
          </div>
          <CopyButton text={INIT[pm]} />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Interactive wizard — detects your framework, discovers routes from disk,
          previews the config before writing <code className="font-mono">skeletal.config.ts</code>.
        </p>
        <div className="mt-4">
          <p className="text-xs font-medium text-slate-500 mb-2">Example generated config:</p>
          {generatedConfigBlock}
        </div>
      </div>

      {/* Step 3 — Analyze */}
      <div>
        <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">3. Analyze</p>
        <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-sm">
          <div className="flex items-center gap-3 text-slate-300 min-w-0">
            <span className="text-slate-500 select-none flex-shrink-0">$</span>
            <span className="truncate">{ANALYZE[pm]}</span>
          </div>
          <CopyButton text={ANALYZE[pm]} />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Scans components, crawls with Playwright, and generates{' '}
          <code className="font-mono">.skeleton.tsx</code> files next to each component.
          Add <code className="font-mono">--no-browser</code> to skip Playwright and generate
          minimal skeletons from AST alone.
        </p>
      </div>
    </div>
  )
}
