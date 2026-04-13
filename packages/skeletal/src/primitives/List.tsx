import type { ReactNode } from 'react'
import { useSkeletalContext } from './context.js'

export interface ListProps {
  count?: number
  gap?: number
  renderItem?: () => ReactNode
  className?: string
}

export function List({ count, gap, renderItem, className }: ListProps) {
  const ctx = useSkeletalContext()
  const resolvedCount = count ?? ctx.primitives?.list?.count ?? 3
  const resolvedGap = gap ?? ctx.primitives?.list?.gap ?? 12

  return (
    <span
      style={{ display: 'flex', flexDirection: 'column', gap: resolvedGap }}
      className={className}
      aria-hidden="true"
    >
      {Array.from({ length: resolvedCount }).map((_, i) => (
        <span key={i}>
          {renderItem ? renderItem() : null}
        </span>
      ))}
    </span>
  )
}
