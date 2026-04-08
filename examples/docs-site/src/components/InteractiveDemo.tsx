'use client'

import { useState } from 'react'
import { SkeletonWrapper } from 'skeletal-ui'
import { DemoCard } from './DemoCard'
import { DemoCardSkeleton } from './DemoCard.skeleton'
import { DemoFeed } from './DemoFeed'
import { DemoFeedSkeleton } from './DemoFeed.skeleton'
import { DemoArticle } from './DemoArticle'
import { DemoArticleSkeleton } from './DemoArticle.skeleton'

export function InteractiveDemo() {
  const [loaded, setLoaded] = useState(true)

  return (
    <section className="py-24 px-4 bg-slate-900/30">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">See it in action</h2>
            <p className="text-slate-400">Toggle between loaded and skeleton state across real components.</p>
          </div>
          <button
            onClick={() => setLoaded(l => !l)}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white"
          >
            <span
              className={`w-2 h-2 rounded-full transition-colors ${
                loaded ? 'bg-green-400' : 'bg-indigo-400 animate-pulse'
              }`}
            />
            {loaded ? 'Show skeletons' : 'Show loaded'}
          </button>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
          <ComponentPreview label="ProfileCard" component="DemoCard.skeleton.tsx">
            <SkeletonWrapper loading={!loaded} fallback={<DemoCardSkeleton />}>
              <DemoCard />
            </SkeletonWrapper>
          </ComponentPreview>

          <ComponentPreview label="ActivityFeed" component="DemoFeed.skeleton.tsx">
            <SkeletonWrapper loading={!loaded} fallback={<DemoFeedSkeleton />}>
              <DemoFeed />
            </SkeletonWrapper>
          </ComponentPreview>

          <ComponentPreview label="ArticleCard" component="DemoArticle.skeleton.tsx" className="md:col-span-2 xl:col-span-1">
            <SkeletonWrapper loading={!loaded} fallback={<DemoArticleSkeleton />}>
              <DemoArticle />
            </SkeletonWrapper>
          </ComponentPreview>
        </div>
      </div>
    </section>
  )
}

function ComponentPreview({
  label,
  component,
  children,
  className = '',
}: {
  label: string
  component: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-xl border border-slate-800 bg-slate-900 overflow-hidden flex flex-col ${className}`}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800">
        <span className="text-sm font-medium text-white">{label}</span>
        <span className="text-xs text-slate-500 font-mono">{component}</span>
      </div>
      <div className="p-5 flex-1">
        {children}
      </div>
    </div>
  )
}
