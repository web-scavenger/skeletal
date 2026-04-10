import type { CSSProperties, ReactNode } from 'react'

export interface SkeletonProviderProps {
  color?: string
  radius?: number
  duration?: number
  children: ReactNode
}

export function SkeletonProvider({
  color,
  radius,
  duration,
  children,
}: SkeletonProviderProps) {
  const style: CSSProperties & Record<string, string> = {}
  if (color !== undefined) style['--sk-color'] = color
  if (radius !== undefined) style['--sk-radius'] = `${radius}px`
  if (duration !== undefined) style['--sk-duration'] = `${duration}s`

  return (
    <div style={style}>
      {children}
    </div>
  )
}
