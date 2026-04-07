import type { ReactNode } from 'react'

export interface CardProps {
  width?: string | number
  height?: string | number
  padding?: number
  children?: ReactNode
  className?: string
}

export function Card({
  width = '100%',
  height,
  padding = 16,
  children,
  className,
}: CardProps) {
  return (
    <span
      className={`sk-base${className ? ` ${className}` : ''}`}
      style={{
        display: 'block',
        width,
        height,
        padding,
        boxSizing: 'border-box',
      }}
      aria-hidden="true"
    >
      {children}
    </span>
  )
}
