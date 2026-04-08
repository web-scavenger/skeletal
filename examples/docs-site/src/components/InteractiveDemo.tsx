'use client'

import { useEffect, useRef, useState } from 'react'
import { SkeletonWrapper, lazyWithSkeleton } from 'skeletal-ui'
import { DemoCard } from './DemoCard'
import { DemoCardSkeleton } from './DemoCard.skeleton'
import { DemoFeed } from './DemoFeed'
import { DemoFeedSkeleton } from './DemoFeed.skeleton'
import { DemoArticle } from './DemoArticle'
import { DemoArticleSkeleton } from './DemoArticle.skeleton'
import { DemoSSR } from './DemoSSR'
import { DemoSSRSkeleton } from './DemoSSR.skeleton'
import { DemoDynamicSkeleton } from './DemoDynamic.skeleton'

// Drop-in for React.lazy — skeleton export is auto-attached after first load.
// SkeletonWrapper resolves it via child.type.skeleton (no explicit fallback needed
// in production; we pass fallback here only for the interactive toggle).
const DemoDynamic = lazyWithSkeleton(() => import('./DemoDynamic'))

export function InteractiveDemo() {
  return (
    <section className="py-24 px-4 bg-slate-900/30">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-white mb-2">See it in action</h2>
          <p className="text-slate-400">Toggle each component independently to compare loaded and skeleton state.</p>
        </div>

        <PatternGroup label="Client-Side Rendering" tag="csr">
          {/* Explicit SkeletonWrapper at call site — required for AST scanner to detect candidates */}
          <ComponentPreview label="ProfileCard" component="DemoCard.skeleton.tsx">
            {(loading) => (
              <SkeletonWrapper loading={loading} fallback={<DemoCardSkeleton />}>
                <DemoCard />
              </SkeletonWrapper>
            )}
          </ComponentPreview>

          <ComponentPreview label="ActivityFeed" component="DemoFeed.skeleton.tsx">
            {(loading) => (
              <SkeletonWrapper loading={loading} fallback={<DemoFeedSkeleton />}>
                <DemoFeed />
              </SkeletonWrapper>
            )}
          </ComponentPreview>

          <ComponentPreview label="ArticleCard" component="DemoArticle.skeleton.tsx" className="md:col-span-2 xl:col-span-1">
            {(loading) => (
              <SkeletonWrapper loading={loading} fallback={<DemoArticleSkeleton />}>
                <DemoArticle />
              </SkeletonWrapper>
            )}
          </ComponentPreview>
        </PatternGroup>

        <PatternGroup label="React Server Components" tag="rsc">
          <ComponentPreview label="BlogPost" component="DemoSSR.skeleton.tsx" className="md:col-span-2 xl:col-span-1">
            {(loading) => (
              <SkeletonWrapper loading={loading} fallback={<DemoSSRSkeleton />}>
                <DemoSSR />
              </SkeletonWrapper>
            )}
          </ComponentPreview>
        </PatternGroup>

        <PatternGroup label="React.lazy / next/dynamic" tag="lazy">
          {/* lazyWithSkeleton: SkeletonWrapper auto-resolves skeleton via child.type.skeleton.
              In production no fallback prop is needed — shown here for the interactive toggle. */}
          <ComponentPreview label="WeeklyChart" component="DemoDynamic.skeleton.tsx" className="md:col-span-2 xl:col-span-1">
            {(loading) => (
              <SkeletonWrapper loading={loading} fallback={<DemoDynamicSkeleton />}>
                <DemoDynamic />
              </SkeletonWrapper>
            )}
          </ComponentPreview>
        </PatternGroup>
      </div>
    </section>
  )
}

function PatternGroup({
  label,
  tag,
  children,
}: {
  label: string
  tag: string
  children: React.ReactNode
}) {
  return (
    <div className="mb-12 last:mb-0">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
          {tag}
        </span>
        <span className="text-sm font-medium text-slate-300">{label}</span>
        <div className="flex-1 h-px bg-slate-800" />
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
        {children}
      </div>
    </div>
  )
}

const SIMULATED_FETCH_MS = 3000

function ComponentPreview({
  label,
  component,
  children,
  className = '',
}: {
  label: string
  component: string
  children: (loading: boolean) => React.ReactNode
  className?: string
}) {
  const [loading, setLoading] = useState(true)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const startFetch = () => {
    setLoading(true)
    timerRef.current = setTimeout(() => setLoading(false), SIMULATED_FETCH_MS)
  }

  useEffect(() => {
    startFetch()
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleToggle = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (loading) {
      // skip the wait — show loaded immediately
      setLoading(false)
    } else {
      // simulate a re-fetch
      startFetch()
    }
  }

  return (
    <div className={`rounded-xl border border-slate-800 bg-slate-900 overflow-hidden flex flex-col ${className}`}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800">
        <span className="text-sm font-medium text-white">{label}</span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-mono">{component}</span>
          <button
            onClick={handleToggle}
            className="flex items-center gap-1.5 text-xs font-medium transition-colors text-slate-500 hover:text-white"
            title={loading ? 'Skip to loaded' : 'Simulate re-fetch'}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                loading ? 'bg-indigo-400 animate-pulse' : 'bg-green-400'
              }`}
            />
            {loading ? 'loading' : 'loaded'}
          </button>
        </div>
      </div>
      <div className="p-5 flex-1">
        {children(loading)}
      </div>
    </div>
  )
}
