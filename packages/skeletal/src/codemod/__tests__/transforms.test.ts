import { describe, expect, it } from 'vitest'
import { Project } from 'ts-morph'
import { applyWrapWithSkeletonWrapper, applyLazyToLazyWith, applyDynamicToDynamicWith } from '../transforms.js'
import type { SkeletalCandidate } from '../../ast-scanner/types.js'

function createCandidate(
  overrides: Partial<SkeletalCandidate> = {},
): SkeletalCandidate {
  return {
    name: 'HeavyChart',
    sourceFile: '/src/components/HeavyChart.tsx',
    usageFile: '/src/app/page.tsx',
    pattern: 'lazy',
    codemod: 'lazy-to-lazy-with',
    hasSkeleton: false,
    isEjected: false,
    astHash: 'abc12345',
    ...overrides,
  }
}

describe('applyWrapWithSkeletonWrapper', () => {
  it('adds skeleton import and fallback prop to SkeletonWrapper', () => {
    const project = new Project({ useInMemoryFileSystem: true })
    project.createSourceFile('/src/app/page.tsx', `
import { SkeletonWrapper } from 'skeletal-ui'
import { UserCard } from '../components/UserCard'

export default function Page() {
  return (
    <SkeletonWrapper>
      <UserCard userId="u1" />
    </SkeletonWrapper>
  )
}
`)
    const candidate = createCandidate({
      name: 'UserCard',
      sourceFile: '/src/components/UserCard.tsx',
      usageFile: '/src/app/page.tsx',
      pattern: 'rsc',
      codemod: 'wrap-with-skeleton-wrapper',
    })
    const result = applyWrapWithSkeletonWrapper(candidate, project)
    expect(result.isOk()).toBe(true)
    if (result.isOk()) expect(result.value.alreadyApplied).toBe(false)
    const text = project.getSourceFile('/src/app/page.tsx')?.getFullText() ?? ''
    expect(text).toContain('UserCardSkeleton')
    expect(text).toContain('fallback={<UserCardSkeleton />}')
    expect(text).not.toContain('Object.assign')
  })

  it('is idempotent when fallback prop already present', () => {
    const project = new Project({ useInMemoryFileSystem: true })
    project.createSourceFile('/src/app/page.tsx', `
import { SkeletonWrapper } from 'skeletal-ui'
import { UserCard } from '../components/UserCard'
import { UserCardSkeleton } from '../components/UserCard.skeleton'

export default function Page() {
  return (
    <SkeletonWrapper fallback={<UserCardSkeleton />}>
      <UserCard userId="u1" />
    </SkeletonWrapper>
  )
}
`)
    const candidate = createCandidate({
      name: 'UserCard',
      sourceFile: '/src/components/UserCard.tsx',
      usageFile: '/src/app/page.tsx',
      pattern: 'rsc',
      codemod: 'wrap-with-skeleton-wrapper',
    })
    const result = applyWrapWithSkeletonWrapper(candidate, project)
    expect(result.isOk()).toBe(true)
    if (result.isOk()) expect(result.value.alreadyApplied).toBe(true)
  })
})

describe('applyLazyToLazyWith', () => {
  it('adds lazyWithSkeleton import and replaces React.lazy', () => {
    const project = new Project({ useInMemoryFileSystem: true })
    project.createSourceFile('/src/app/page.tsx', `
import React from 'react'
const HeavyChart = React.lazy(() => import('./HeavyChart'))
`)
    const candidate = createCandidate()
    const result = applyLazyToLazyWith(candidate, project)
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.alreadyApplied).toBe(false)
    }
    const sf = project.getSourceFile('/src/app/page.tsx')
    const text = sf?.getFullText() ?? ''
    expect(text).toContain('lazyWithSkeleton')
    expect(text).not.toContain('React.lazy')
  })

  it('is idempotent when already applied', () => {
    const project = new Project({ useInMemoryFileSystem: true })
    project.createSourceFile('/src/app/page.tsx', `
import { lazyWithSkeleton } from 'skeletal-ui'
const HeavyChart = lazyWithSkeleton(() => import('./HeavyChart'))
`)
    const candidate = createCandidate()
    const result = applyLazyToLazyWith(candidate, project)
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.alreadyApplied).toBe(true)
    }
  })
})

describe('applyDynamicToDynamicWith', () => {
  it('adds dynamicWithSkeleton import and replaces dynamic', () => {
    const project = new Project({ useInMemoryFileSystem: true })
    project.createSourceFile('/src/app/page.tsx', `
import dynamic from 'next/dynamic'
const Map = dynamic(() => import('./Map'), { ssr: false })
`)
    const candidate = createCandidate({
      name: 'Map',
      pattern: 'dynamic',
      codemod: 'dynamic-to-dynamic-with',
    })
    const result = applyDynamicToDynamicWith(candidate, project)
    expect(result.isOk()).toBe(true)
    const sf = project.getSourceFile('/src/app/page.tsx')
    const text = sf?.getFullText() ?? ''
    expect(text).toContain('dynamicWithSkeleton')
    expect(text).not.toContain('dynamic(() =>')
  })
})
