import type { ExtractedChildGeometry } from '../playwright-crawler/types.js'
import { SK_PRIMITIVE_TYPES } from './types.js'
import type { SkPrimitiveType } from './types.js'

interface ClassificationRule {
  match(el: ExtractedChildGeometry): boolean
  classify(el: ExtractedChildGeometry, parentWidth: number): { type: SkPrimitiveType; props: Record<string, unknown> }
}

const LINE_HEIGHT_ESTIMATE = 20

// Rule 1: Explicit hint via data-sk-type
const explicitHintRule: ClassificationRule = {
  match: el => el.dataSkType !== null,
  classify: (el, parentWidth) => {
    const type = (el.dataSkType as SkPrimitiveType | null) ?? SK_PRIMITIVE_TYPES.UNKNOWN
    const relWidth = parentWidth > 0
      ? `${Math.round((el.boundingBox.width / parentWidth) * 100)}%`
      : '100%'
    return { type, props: { width: relWidth } }
  },
}

// Rule 2: ARIA role
const ariaRoleRule: ClassificationRule = {
  match: el => el.role !== null,
  classify: (el, parentWidth) => {
    const relWidth = parentWidth > 0
      ? `${Math.round((el.boundingBox.width / parentWidth) * 100)}%`
      : '100%'
    switch (el.role) {
    case 'img': return { type: SK_PRIMITIVE_TYPES.IMAGE, props: { width: relWidth } }
    case 'button': return { type: SK_PRIMITIVE_TYPES.BUTTON, props: { width: el.boundingBox.width, height: el.boundingBox.height } }
    case 'heading': return { type: SK_PRIMITIVE_TYPES.HEADING, props: { width: relWidth } }
    default: return { type: SK_PRIMITIVE_TYPES.CARD, props: { width: relWidth } }
    }
  },
}

// Rule 3: Tag-based
const tagRule: ClassificationRule = {
  match: el => ['img', 'h1', 'h2', 'h3', 'h4', 'p', 'button', 'ul', 'ol'].includes(el.tagName),
  classify: (el, parentWidth) => {
    const relWidth = parentWidth > 0
      ? `${Math.round((el.boundingBox.width / parentWidth) * 100)}%`
      : '100%'
    const { tagName, boundingBox } = el
    if (tagName === 'img') return { type: SK_PRIMITIVE_TYPES.IMAGE, props: { width: relWidth, aspectRatio: el.computedStyles.aspectRatio || '16/9' } }
    if (['h1', 'h2', 'h3', 'h4'].includes(tagName)) return { type: SK_PRIMITIVE_TYPES.HEADING, props: { width: relWidth } }
    if (tagName === 'p') {
      const lines = Math.max(1, Math.round(boundingBox.height / LINE_HEIGHT_ESTIMATE))
      return { type: SK_PRIMITIVE_TYPES.TEXT, props: { lines, width: relWidth, lastLineWidth: '60%' } }
    }
    if (tagName === 'button') return { type: SK_PRIMITIVE_TYPES.BUTTON, props: { width: boundingBox.width, height: boundingBox.height } }
    if (tagName === 'ul' || tagName === 'ol') return { type: SK_PRIMITIVE_TYPES.LIST, props: { count: el.children.length || 3 } }
    return { type: SK_PRIMITIVE_TYPES.CARD, props: { width: relWidth } }
  },
}

// Rule 4: Geometry-based
const geometryRule: ClassificationRule = {
  match: () => true,
  classify: (el, parentWidth) => {
    const { boundingBox } = el
    const { width, height } = boundingBox
    const relWidth = parentWidth > 0
      ? `${Math.round((width / parentWidth) * 100)}%`
      : '100%'

    // Small square → Avatar or Icon
    if (width === height && width <= 48) {
      const br = el.computedStyles.borderRadius
      if (br === '50%' || br.startsWith('50')) {
        return { type: SK_PRIMITIVE_TYPES.AVATAR, props: { size: width, shape: 'circle' } }
      }
      if (width <= 32) {
        return { type: SK_PRIMITIVE_TYPES.ICON, props: { size: width } }
      }
      return { type: SK_PRIMITIVE_TYPES.AVATAR, props: { size: width } }
    }

    // Small circular/square medium → Avatar
    if (width === height && width <= 80 && el.computedStyles.borderRadius === '50%') {
      return { type: SK_PRIMITIVE_TYPES.AVATAR, props: { size: width, shape: 'circle' } }
    }

    // Small narrow height (badge-like)
    if (height <= 28 && width <= 120) {
      return { type: SK_PRIMITIVE_TYPES.BADGE, props: { width, height } }
    }

    // Single line text
    if (height <= LINE_HEIGHT_ESTIMATE * 1.5 && width > 60) {
      return { type: SK_PRIMITIVE_TYPES.TEXT, props: { lines: 1, width: relWidth } }
    }

    // Multi-line text
    if (height > LINE_HEIGHT_ESTIMATE && height < LINE_HEIGHT_ESTIMATE * 6 && width > parentWidth * 0.4) {
      const lines = Math.max(1, Math.round(height / LINE_HEIGHT_ESTIMATE))
      return { type: SK_PRIMITIVE_TYPES.TEXT, props: { lines, width: relWidth, lastLineWidth: '60%' } }
    }

    // Large area image-like
    if (width > 100 && height > 100) {
      const aspectRatio = width / height
      if (aspectRatio > 1.2 || aspectRatio < 0.8) {
        return { type: SK_PRIMITIVE_TYPES.IMAGE, props: { width: relWidth, aspectRatio: el.computedStyles.aspectRatio || '16/9' } }
      }
    }

    // Default: card
    return { type: SK_PRIMITIVE_TYPES.CARD, props: { width: relWidth, height } }
  },
}

export const CLASSIFICATION_RULES: ClassificationRule[] = [
  explicitHintRule,
  ariaRoleRule,
  tagRule,
  geometryRule,
]
