'use client'

import { Component, Suspense } from 'react'
import type { ComponentType, ReactNode } from 'react'
import { DefaultPulseSkeleton } from './DefaultPulseSkeleton.js'

interface ErrorBoundaryProps {
  fallback: ReactNode
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

export interface SkeletonWrapperProps {
  children: ReactNode
  fallback?: ReactNode
  /** Explicitly show the skeleton. Use for CSR components where you control the loading state. */
  loading?: boolean
}

function resolveSkeleton(children: ReactNode): ReactNode {
  // Extract skeleton from child component's static .skeleton property
  if (children !== null && typeof children === 'object' && 'type' in children) {
    const child = children as { type?: ComponentType & { skeleton?: ComponentType } }
    if (child.type && typeof child.type === 'function' && child.type.skeleton) {
      const SkeletonComponent = child.type.skeleton
      return <SkeletonComponent />
    }
  }
  return null
}

export function SkeletonWrapper({ children, fallback, loading }: SkeletonWrapperProps) {
  const resolvedFallback = fallback ?? resolveSkeleton(children) ?? <DefaultPulseSkeleton />

  if (loading) {
    return <>{resolvedFallback}</>
  }

  return (
    <ErrorBoundary fallback={resolvedFallback}>
      <Suspense fallback={resolvedFallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  )
}
