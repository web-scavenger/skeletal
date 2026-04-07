// This module is only used in Next.js environments (skeletal/next entry point).
// next/dynamic is resolved at runtime — we avoid a static import to keep this
// file compilable without next installed as a peer dep of the monorepo.

import type { ComponentType } from 'react'

interface DynamicOptions {
  ssr?: boolean
  loading?: ComponentType
  [key: string]: unknown
}

type DynamicFactory = () => Promise<{ default: ComponentType<unknown> }>

type ComponentWithSkeleton = ComponentType<unknown> & {
  skeleton?: ComponentType
}

type NextDynamic = (
  factory: DynamicFactory,
  options?: DynamicOptions,
) => ComponentWithSkeleton

export function dynamicWithSkeleton(
  factory: DynamicFactory,
  options?: DynamicOptions,
): ComponentWithSkeleton {
  let skeletonComponent: ComponentType | undefined

  const wrappedFactory: DynamicFactory = async () => {
    const mod = await factory()
    const component = mod.default as ComponentWithSkeleton
    const modRecord = mod as Record<string, unknown>

    if (typeof modRecord['skeleton'] === 'function') {
      skeletonComponent = modRecord['skeleton'] as ComponentType
    } else if (typeof component.skeleton === 'function') {
      skeletonComponent = component.skeleton
    }

    return { default: component }
  }

  // Dynamically require next/dynamic to avoid compile-time dependency
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const dynamic = (require('next/dynamic') as { default: NextDynamic }).default ?? (require('next/dynamic') as NextDynamic)
  const DynComponent = dynamic(wrappedFactory, options)

  Object.defineProperty(DynComponent, 'skeleton', {
    get() {
      return skeletonComponent
    },
    configurable: true,
  })

  return DynComponent
}
