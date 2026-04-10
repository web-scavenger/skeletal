import { CodeBlock } from './CodeBlock'
import type { PatternId } from './PatternLiveDemo'
import { PatternLiveDemo } from './PatternLiveDemo'

const RSC_CODE = `// UserCard.tsx — async server component
export async function UserCard() {
  const user = await db.users.findFirst()
  return (
    <div className="card">
      <img src={user.avatar} alt={user.name} />
      <h2>{user.name}</h2>
      <p>{user.bio}</p>
    </div>
  )
}

// app/page.tsx
import { SkeletonWrapper } from 'skeletal-ui'
import { UserCard } from './UserCard'

export default function Page() {
  return (
    <SkeletonWrapper>
      <UserCard />
    </SkeletonWrapper>
  )
}

// UserCard.skeleton.tsx (auto-generated)
// skeletal:hash:a1b2c3d4
// skeletal:pattern:rsc
'use client'
import { Sk } from 'skeletal-ui'

export function UserCardSkeleton() {
  return (
    <div className="card">
      <Sk.Avatar size={48} />
      <Sk.Heading height="22px" width="55%" />
      <Sk.Text lines={2} height="14px" gap="12px" />
    </div>
  )
}

export { UserCardSkeleton as skeleton }`

const CSR_CODE = `// ProfileCard.tsx — React Query (non-async)
import { useQuery } from '@tanstack/react-query'

export function ProfileCard() {
  const { data } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
  })
  return (
    <div className="card">
      <h2>{data?.name}</h2>
      <p>{data?.bio}</p>
    </div>
  )
}

// Use the loading prop for explicit CSR control
import { SkeletonWrapper } from 'skeletal-ui'
import { ProfileCardSkeleton } from './ProfileCard.skeleton'

export default function Page() {
  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
  })
  return (
    <SkeletonWrapper loading={isLoading} fallback={<ProfileCardSkeleton />}>
      <ProfileCard />
    </SkeletonWrapper>
  )
}`

const LAZY_CODE = `import { lazyWithSkeleton } from 'skeletal-ui'

// Drop-in replacement for React.lazy()
const HeavyChart = lazyWithSkeleton(
  () => import('./HeavyChart')
)

export default function Dashboard() {
  // No explicit Suspense needed —
  // lazyWithSkeleton attaches the skeleton as fallback
  return <HeavyChart />
}

// HeavyChart.skeleton.tsx (auto-generated)
// skeletal:hash:b2c3d4e5
// skeletal:pattern:lazy
'use client'
import { Sk } from 'skeletal-ui'

export function HeavyChartSkeleton() {
  return <Sk.Image aspectRatio="16/9" width="100%" />
}

export { HeavyChartSkeleton as skeleton }`

const DYNAMIC_CODE = `import { dynamicWithSkeleton } from 'skeletal-ui/next'

// Drop-in replacement for next/dynamic()
const HeavyChart = dynamicWithSkeleton(
  () => import('./HeavyChart')
)

export default function Dashboard() {
  // skeleton export is used as the loading state —
  // no loading: () => <Spinner /> needed
  return <HeavyChart />
}

// HeavyChart.skeleton.tsx (auto-generated)
// skeletal:hash:b2c3d4e5
// skeletal:pattern:dynamic
'use client'
import { Sk } from 'skeletal-ui'

export function HeavyChartSkeleton() {
  return <Sk.Image aspectRatio="16/9" width="100%" />
}

export { HeavyChartSkeleton as skeleton }`

const patterns: {
  id: PatternId
  tag: string
  title: string
  description: string
  code: string
}[] = [
  {
    id: 'rsc',
    tag: 'rsc',
    title: 'React Server Components',
    description:
      'Wrap any async server component. skeletal-ui detects the async function, captures rendered geometry via Playwright (bounding box, font-size, line-height, border-radius), and generates a co-located .skeleton.tsx file with pixel-accurate sizes that eliminate layout jump on state change.',
    code: RSC_CODE,
  },
  {
    id: 'csr',
    tag: 'csr',
    title: 'Client-Side Rendering',
    description:
      'Works with React Query, SWR, or any non-async component. The same SkeletonWrapper API — skeletal-ui detects non-async functions and skips the network-idle Playwright phase. Use the loading prop for explicit control.',
    code: CSR_CODE,
  },
  {
    id: 'lazy',
    tag: 'lazy',
    title: 'React.lazy()',
    description:
      'Drop-in replacement for React.lazy(). The loaded module exports a skeleton() function that is shown while the chunk loads. No explicit Suspense needed — lazyWithSkeleton attaches it automatically.',
    code: LAZY_CODE,
  },
  {
    id: 'dynamic',
    tag: 'dynamic',
    title: 'next/dynamic()',
    description:
      'Drop-in replacement for Next.js dynamic imports. Uses the module\'s skeleton() export as the loading state — no loading: () => <Spinner /> required.',
    code: DYNAMIC_CODE,
  },
]

export function PatternSection() {
  return (
    <section className="py-24 px-4 bg-slate-900/20">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mb-14">
          <h2 className="text-3xl font-bold text-white mb-3">Four patterns, one API</h2>
          <p className="text-slate-400">
            skeletal handles every React loading pattern. Pick the wrapper that matches
            your component type.
          </p>
        </div>
        <div className="flex flex-col gap-20">
          {patterns.map(p => (
            <div key={p.id} id={`pattern-${p.id}`}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                  {p.tag}
                </span>
                <h3 className="text-xl font-semibold text-white">{p.title}</h3>
              </div>
              <p className="text-slate-400 mb-6 leading-relaxed max-w-3xl">{p.description}</p>
              <div className="grid lg:grid-cols-2 gap-6 items-start">
                <CodeBlock code={p.code} lang="tsx" />
                <PatternLiveDemo patternId={p.id} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
