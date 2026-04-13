import type { CSSProperties, ReactNode } from 'react'
import type { PrimitivesConfig } from '../config/types.js'
import { SkeletalContext } from './context.js'

export interface SkeletonProviderProps {
  color?: string
  radius?: number
  duration?: number
  primitives?: PrimitivesConfig
  children: ReactNode
}

export function SkeletonProvider({
  color,
  radius,
  duration,
  primitives,
  children,
}: SkeletonProviderProps) {
  const style: CSSProperties & Record<string, string> = {}
  if (color !== undefined) style['--sk-color'] = color
  if (radius !== undefined) style['--sk-radius'] = `${radius}px`
  if (duration !== undefined) style['--sk-duration'] = `${duration}s`

  return (
    <SkeletalContext.Provider value={{ primitives }}>
      <div style={style}>
        {children}
      </div>
    </SkeletalContext.Provider>
  )
}
