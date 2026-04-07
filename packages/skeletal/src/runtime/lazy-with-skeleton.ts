import { lazy } from 'react'
import type { ComponentType } from 'react'

type LazyFactory = () => Promise<{ default: ComponentType<unknown> }>

type ComponentWithSkeleton = ComponentType<unknown> & {
  skeleton?: ComponentType
}

export function lazyWithSkeleton(factory: LazyFactory): ComponentWithSkeleton {
  let skeletonComponent: ComponentType | undefined

  const wrappedFactory: LazyFactory = async () => {
    const mod = await factory()
    const component = mod.default as ComponentWithSkeleton

    // Extract the skeleton named export from the lazily-loaded module
    const modRecord = mod as Record<string, unknown>
    if (typeof modRecord['skeleton'] === 'function') {
      skeletonComponent = modRecord['skeleton'] as ComponentType
    } else if (typeof component.skeleton === 'function') {
      skeletonComponent = component.skeleton
    }

    return { default: component }
  }

  const LazyComponent = lazy(wrappedFactory) as unknown as ComponentWithSkeleton

  // Define a getter so SkeletonWrapper can read the skeleton after first load
  Object.defineProperty(LazyComponent, 'skeleton', {
    get() {
      return skeletonComponent
    },
    configurable: true,
  })

  return LazyComponent
}
