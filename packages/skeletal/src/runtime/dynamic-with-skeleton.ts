// This module is only used in Next.js environments (skeletal/next entry point).
// next/dynamic is resolved at runtime — we avoid a static import to keep this
// file compilable without next installed as a peer dep of the monorepo.

import type { ComponentType } from 'react'

interface DynamicOptions {
  ssr?: boolean
  loading?: ComponentType
  [key: string]: unknown
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFactory = () => Promise<{ default: ComponentType<any> }>

type WithSkeleton<P> = ComponentType<P> & { skeleton?: ComponentType }

type NextDynamic = (factory: AnyFactory, options?: DynamicOptions) => ComponentType

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function dynamicWithSkeleton<P = any>(
  factory: () => Promise<{ default: ComponentType<P> }>,
  options?: DynamicOptions,
): WithSkeleton<P> {
  let skeletonComponent: ComponentType | undefined

  const wrappedFactory: AnyFactory = async () => {
    const mod = await factory()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const component = mod.default as WithSkeleton<any>
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

  return DynComponent as unknown as WithSkeleton<P>
}
