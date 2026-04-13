import type { ExtractedChildGeometry } from '../playwright-crawler/types.js'
import type { ExtractedGeometry } from '../playwright-crawler/types.js'
import type { ClassifiedElement, SkeletonTree, SkPrimitiveType } from './types.js'
import { SK_PRIMITIVE_TYPES } from './types.js'
import type { ClassificationRule, ClassifierThresholds } from './rules.js'
import { buildClassificationRules, resolveClassifierThresholds } from './rules.js'

function classifyElement(
  el: ExtractedChildGeometry,
  parentWidth: number,
  rules: ClassificationRule[],
): ClassifiedElement {
  let primitiveType: SkPrimitiveType = SK_PRIMITIVE_TYPES.UNKNOWN
  let props: Record<string, unknown> = {}

  for (const rule of rules) {
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
    child => classifyElement(child, el.boundingBox.width, rules),
  )

  return {
    primitiveType,
    props,
    relativeWidth,
    children,
  }
}

export function classify(geometry: ExtractedGeometry, thresholds?: ClassifierThresholds): SkeletonTree {
  const rules = buildClassificationRules(thresholds ?? resolveClassifierThresholds())

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
    child => classifyElement(child, geometry.boundingBox.width, rules),
  )
}
