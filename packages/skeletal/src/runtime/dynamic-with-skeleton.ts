// This module is only used in Next.js environments (skeletal/next entry point).

import type { ComponentType } from 'react'
// next/dynamic is a peer dependency — only available in Next.js projects.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import dynamic from 'next/dynamic'

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

  const nextDynamic = (dynamic as unknown as { default?: NextDynamic }).default ?? (dynamic as unknown as NextDynamic)
  const DynComponent = nextDynamic(wrappedFactory, options)

  Object.defineProperty(DynComponent, 'skeleton', {
    get() {
      return skeletonComponent
    },
    configurable: true,
  })

  return DynComponent as unknown as WithSkeleton<P>
}
