import type { ReactNode } from 'react'

export interface ListProps {
  count?: number
  gap?: number
  renderItem?: () => ReactNode
  className?: string
}

export function List({ count = 3, gap = 12, renderItem, className }: ListProps) {
  return (
    <span
      style={{ display: 'flex', flexDirection: 'column', gap }}
      className={className}
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <span key={i}>
          {renderItem ? renderItem() : null}
        </span>
      ))}
    </span>
  )
}
