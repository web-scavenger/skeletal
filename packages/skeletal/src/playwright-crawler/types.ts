import type { LoadingPattern } from '../ast-scanner/types.js'

export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

export interface ExtractedChildGeometry {
  tagName: string
  role: string | null
  dataSkType: string | null
  boundingBox: BoundingBox
  computedStyles: {
    borderRadius: string
    aspectRatio: string
  }
  children: ExtractedChildGeometry[]
}

export interface ExtractedGeometry {
  componentName: string
  pattern: LoadingPattern
  breakpoint: number
  boundingBox: BoundingBox
  children: ExtractedChildGeometry[]
  timedOut: boolean
}
