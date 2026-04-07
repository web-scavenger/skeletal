import type { ExtractedChildGeometry } from '../playwright-crawler/types.js'
import type { ExtractedGeometry } from '../playwright-crawler/types.js'
import type { ClassifiedElement, SkeletonTree, SkPrimitiveType } from './types.js'
import { SK_PRIMITIVE_TYPES } from './types.js'
import { CLASSIFICATION_RULES } from './rules.js'

function classifyElement(
  el: ExtractedChildGeometry,
  parentWidth: number,
): ClassifiedElement {
  let primitiveType: SkPrimitiveType = SK_PRIMITIVE_TYPES.UNKNOWN
  let props: Record<string, unknown> = {}

  for (const rule of CLASSIFICATION_RULES) {
    if (rule.match(el)) {
      const result = rule.classify(el, parentWidth)
      primitiveType = result.type
      props = result.props
      break
    }
  }

  const relativeWidth = parentWidth > 0
    ? `${Math.round((el.boundingBox.width / parentWidth) * 100)}%`
    : '100%'

  // Recursively classify children
  const children: ClassifiedElement[] = el.children.map(
    child => classifyElement(child, el.boundingBox.width),
  )

  return {
    primitiveType,
    props,
    relativeWidth,
    children,
  }
}

export function classify(geometry: ExtractedGeometry): SkeletonTree {
  if (geometry.timedOut || geometry.children.length === 0) {
    // Minimal fallback skeleton
    return [{
      primitiveType: SK_PRIMITIVE_TYPES.CARD,
      props: {
        width: '100%',
        height: geometry.boundingBox.height || 200,
      },
      relativeWidth: '100%',
      children: [],
    }]
  }

  return geometry.children.map(
    child => classifyElement(child, geometry.boundingBox.width),
  )
}
