import type { CSSProperties, ReactNode } from 'react'

export interface SkeletonProviderProps {
  color?: string
  highlight?: string
  radius?: number
  duration?: number
  children: ReactNode
}

export function SkeletonProvider({
  color,
  highlight,
  radius,
  duration,
  children,
}: SkeletonProviderProps) {
  const style: CSSProperties & Record<string, string> = {}
  if (color !== undefined) style['--sk-color'] = color
  if (highlight !== undefined) style['--sk-highlight'] = highlight
  if (radius !== undefined) style['--sk-radius'] = `${radius}px`
  if (duration !== undefined) style['--sk-duration'] = `${duration}s`

  return (
    <div style={style}>
      {children}
    </div>
  )
}
