'use client'

import { useEffect, useRef, useState } from 'react'
import { SkeletonWrapper, lazyWithSkeleton } from 'skeletal-ui'
import { DemoCard } from './DemoCard'
import { DemoCardSkeleton } from './DemoCard.skeleton'
import { DemoSSR } from './DemoSSR'
import { DemoSSRSkeleton } from './DemoSSR.skeleton'
import { DemoDynamicSkeleton } from './DemoDynamic.skeleton'

const DemoDynamic = lazyWithSkeleton(() => import('./DemoDynamic'))

const SIMULATED_FETCH_MS = 3000

export type PatternId = 'rsc' | 'csr' | 'lazy' | 'dynamic'

const DEMO_META: Record<PatternId, { skeletonFile: string }> = {
  rsc: { skeletonFile: 'DemoSSR.skeleton.tsx' },
  csr: { skeletonFile: 'DemoCard.skeleton.tsx' },
  lazy: { skeletonFile: 'DemoDynamic.skeleton.tsx' },
  dynamic: { skeletonFile: 'DemoDynamic.skeleton.tsx' },
}

export function PatternLiveDemo({ patternId }: { patternId: PatternId }) {
  // Start loaded so Playwright can immediately capture geometry.
  // Users click "Simulate fetch" to trigger the loading animation.
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const startFetch = () => {
    setLoading(true)
    timerRef.current = setTimeout(() => setLoading(false), SIMULATED_FETCH_MS)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const handleToggle = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (loading) {
      setLoading(false)
    } else {
      startFetch()
    }
  }

  const meta = DEMO_META[patternId]

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 gap-3">
        <span className="text-xs font-mono text-slate-500 truncate">{meta.skeletonFile}</span>
        <button
          onClick={handleToggle}
          className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border whitespace-nowrap flex-shrink-0 transition-all ${
            loading
              ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/25'
              : 'bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700 hover:border-slate-500'
          }`}
        >
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
            loading ? 'bg-indigo-400 animate-pulse' : 'bg-green-400'
          }`} />
          {loading ? 'Loading…' : 'Simulate fetch'}
        </button>
      </div>
      <div className="p-5">
        <DemoContent patternId={patternId} loading={loading} />
      </div>
    </div>
  )
}

function DemoContent({ patternId, loading }: { patternId: PatternId; loading: boolean }) {
  if (patternId === 'rsc' || patternId === 'dynamic') {
    return (
      <SkeletonWrapper loading={loading} fallback={<DemoSSRSkeleton />}>
        <DemoSSR />
      </SkeletonWrapper>
    )
  }
  if (patternId === 'csr') {
    return (
      <SkeletonWrapper loading={loading} fallback={<DemoCardSkeleton />}>
        <DemoCard />
      </SkeletonWrapper>
    )
  }
  return (
    <SkeletonWrapper loading={loading} fallback={<DemoDynamicSkeleton />}>
      <DemoDynamic />
    </SkeletonWrapper>
  )
}
