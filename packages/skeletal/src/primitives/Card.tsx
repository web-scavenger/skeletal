import type { ReactNode } from 'react'
import { useSkeletalContext } from './context.js'

export interface CardProps {
  width?: string | number
  height?: string | number
  padding?: number
  children?: ReactNode
  className?: string
}

export function Card({
  width,
  height,
  padding,
  children,
  className,
}: CardProps) {
  const ctx = useSkeletalContext()
  const resolvedWidth = width ?? '100%'
  const resolvedPadding = padding ?? ctx.primitives?.card?.padding ?? 16

  return (
    <span
      className={`sk-base${className ? ` ${className}` : ''}`}
      style={{
        display: 'block',
        width: resolvedWidth,
        height,
        padding: resolvedPadding,
        boxSizing: 'border-box',
      }}
      aria-hidden="true"
    >
      {children}
    </span>
  )
}
