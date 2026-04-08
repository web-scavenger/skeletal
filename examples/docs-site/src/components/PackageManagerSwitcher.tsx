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

interface Props {
  configBlock: ReactNode
}

export function PackageManagerSwitcher({ configBlock }: Props) {
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

      {/* Step 2 — Configure (server-rendered CodeBlock passed as prop) */}
      <div>
        <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">2. Configure</p>
        {configBlock}
      </div>

      {/* Step 3 — Init */}
      <div>
        <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">3. Init</p>
        <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-sm">
          <div className="flex items-center gap-3 text-slate-300 min-w-0">
            <span className="text-slate-500 select-none flex-shrink-0">$</span>
            <span className="truncate">{INIT[pm]}</span>
          </div>
          <CopyButton text={INIT[pm]} />
        </div>
        <p className="mt-2 text-xs text-slate-600">
          Validates your config, checks Playwright install, and runs a test crawl.
        </p>
      </div>
    </div>
  )
}
