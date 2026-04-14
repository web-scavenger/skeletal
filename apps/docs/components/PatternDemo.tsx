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

type PatternId = 'rsc' | 'csr' | 'lazy' | 'dynamic'

const PATTERNS: { id: PatternId; label: string; skeletonFile: string }[] = [
  { id: 'rsc', label: 'RSC', skeletonFile: 'DemoSSR.skeleton.tsx' },
  { id: 'csr', label: 'CSR', skeletonFile: 'DemoCard.skeleton.tsx' },
  { id: 'lazy', label: 'React.lazy', skeletonFile: 'DemoDynamic.skeleton.tsx' },
  { id: 'dynamic', label: 'next/dynamic', skeletonFile: 'DemoDynamic.skeleton.tsx' },
]

export function PatternDemo() {
  const [activePattern, setActivePattern] = useState<PatternId>('rsc')
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleToggle = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (loading) {
      setLoading(false)
    } else {
      setLoading(true)
      timerRef.current = setTimeout(() => setLoading(false), SIMULATED_FETCH_MS)
    }
  }

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  const pattern = PATTERNS.find(p => p.id === activePattern)!

  return (
    <div className="my-6 rounded-xl border border-gray-200 dark:border-neutral-800 overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 flex-wrap">
        {PATTERNS.map(p => (
          <button
            key={p.id}
            onClick={() => { setActivePattern(p.id); setLoading(false) }}
            className={`text-xs font-mono px-3 py-1 rounded border transition-all ${
              activePattern === p.id
                ? 'bg-indigo-50 dark:bg-indigo-500/20 border-indigo-200 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-300'
                : 'bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {p.label}
          </button>
        ))}
        <div className="flex-1" />
        <button
          onClick={handleToggle}
          className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
            loading
              ? 'bg-indigo-50 dark:bg-indigo-500/15 border-indigo-200 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-300'
              : 'bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-200 hover:border-gray-400 dark:hover:border-neutral-500'
          }`}
        >
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
            loading ? 'bg-indigo-500 animate-pulse' : 'bg-green-500'
          }`} />
          {loading ? 'Loading…' : 'Simulate fetch'}
        </button>
      </div>

      {/* File label */}
      <div className="flex items-center px-4 py-2 border-b border-gray-100 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-900/30">
        <span className="text-xs font-mono text-gray-400 dark:text-gray-500">{pattern.skeletonFile}</span>
      </div>

      {/* Preview */}
      <div className="p-5">
        <DemoContent patternId={activePattern} loading={loading} />
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
