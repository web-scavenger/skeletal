// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'

afterEach(cleanup)
import { SkeletonWrapper } from '../SkeletonWrapper.js'

function Content() {
  return <div>loaded content</div>
}

function MySkeleton() {
  return <div>my skeleton</div>
}

describe('SkeletonWrapper — loading prop', () => {
  it('shows children when loading is false', () => {
    render(
      <SkeletonWrapper loading={false} fallback={<MySkeleton />}>
        <Content />
      </SkeletonWrapper>,
    )
    expect(screen.getByText('loaded content')).toBeDefined()
    expect(screen.queryByText('my skeleton')).toBeNull()
  })

  it('shows fallback when loading is true', () => {
    render(
      <SkeletonWrapper loading={true} fallback={<MySkeleton />}>
        <Content />
      </SkeletonWrapper>,
    )
    expect(screen.getByText('my skeleton')).toBeDefined()
    expect(screen.queryByText('loaded content')).toBeNull()
  })

  it('shows children when loading is undefined (default Suspense behaviour)', () => {
    render(
      <SkeletonWrapper fallback={<MySkeleton />}>
        <Content />
      </SkeletonWrapper>,
    )
    expect(screen.getByText('loaded content')).toBeDefined()
    expect(screen.queryByText('my skeleton')).toBeNull()
  })

  it('resolves skeleton from child .skeleton when loading is true and no fallback given', () => {
    function CardWithSkeleton() {
      return <div>card</div>
    }
    CardWithSkeleton.skeleton = MySkeleton

    render(
      <SkeletonWrapper loading={true}>
        <CardWithSkeleton />
      </SkeletonWrapper>,
    )
    expect(screen.getByText('my skeleton')).toBeDefined()
    expect(screen.queryByText('card')).toBeNull()
  })

  it('uses DefaultPulseSkeleton when loading is true, no fallback, and no .skeleton on child', () => {
    const { container } = render(
      <SkeletonWrapper loading={true}>
        <Content />
      </SkeletonWrapper>,
    )
    // DefaultPulseSkeleton renders an sk-base span
    expect(container.querySelector('.sk-base')).not.toBeNull()
    expect(screen.queryByText('loaded content')).toBeNull()
  })

  it('prefers explicit fallback over child .skeleton when loading is true', () => {
    function CardWithSkeleton() {
      return <div>card</div>
    }
    CardWithSkeleton.skeleton = () => <div>auto skeleton</div>

    render(
      <SkeletonWrapper loading={true} fallback={<div>explicit fallback</div>}>
        <CardWithSkeleton />
      </SkeletonWrapper>,
    )
    expect(screen.getByText('explicit fallback')).toBeDefined()
    expect(screen.queryByText('auto skeleton')).toBeNull()
  })

  it('transitions from loading to loaded when prop changes', () => {
    const { rerender } = render(
      <SkeletonWrapper loading={true} fallback={<MySkeleton />}>
        <Content />
      </SkeletonWrapper>,
    )
    expect(screen.getByText('my skeleton')).toBeDefined()

    rerender(
      <SkeletonWrapper loading={false} fallback={<MySkeleton />}>
        <Content />
      </SkeletonWrapper>,
    )
    expect(screen.getByText('loaded content')).toBeDefined()
    expect(screen.queryByText('my skeleton')).toBeNull()
  })
})
