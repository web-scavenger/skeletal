import { lazy } from 'react'
import type { ComponentType } from 'react'

type WithSkeleton<P> = ComponentType<P> & { skeleton?: ComponentType }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyWithSkeleton<P = any>(
  factory: () => Promise<{ default: ComponentType<P> }>,
): WithSkeleton<P> {
  let skeletonComponent: ComponentType | undefined

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wrappedFactory = async (): Promise<{ default: ComponentType<any> }> => {
    const mod = await factory()
    const component = mod.default as WithSkeleton<P>

    // Extract the skeleton named export from the lazily-loaded module
    const modRecord = mod as Record<string, unknown>
    if (typeof modRecord['skeleton'] === 'function') {
      skeletonComponent = modRecord['skeleton'] as ComponentType
    } else if (typeof component.skeleton === 'function') {
      skeletonComponent = component.skeleton
    }

    return { default: component }
  }

  const LazyComponent = lazy(wrappedFactory) as unknown as WithSkeleton<P>

  // Define a getter so SkeletonWrapper can read the skeleton after first load
  Object.defineProperty(LazyComponent, 'skeleton', {
    get() {
      return skeletonComponent
    },
    configurable: true,
  })

  return LazyComponent as WithSkeleton<P>
}
