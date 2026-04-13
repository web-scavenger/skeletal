import { createContext, useContext } from 'react'
import type { PrimitivesConfig } from '../config/types.js'

interface SkeletalContextValue {
  primitives?: PrimitivesConfig
}

export const SkeletalContext = createContext<SkeletalContextValue>({})

export function useSkeletalContext(): SkeletalContextValue {
  return useContext(SkeletalContext)
}
