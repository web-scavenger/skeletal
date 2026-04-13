import type { ExtractedChildGeometry } from '../playwright-crawler/types.js'
import type { ClassifierConfig } from '../config/types.js'
import { SK_PRIMITIVE_TYPES } from './types.js'
import type { SkPrimitiveType } from './types.js'

export interface ClassificationRule {
  match(el: ExtractedChildGeometry): boolean
  classify(el: ExtractedChildGeometry, parentWidth: number): { type: SkPrimitiveType; props: Record<string, unknown> }
}

export interface ClassifierThresholds {
  lineHeightEstimate: number
  avatarSmallMax: number
  iconMax: number
  avatarMediumMax: number
  badgeMaxHeight: number
  badgeMaxWidth: number
  textSingleLineMaxHeight: number
  textMultiLineMinWidthRatio: number
  imageMinDimension: number
  imageAspectRatioMin: number
  imageAspectRatioMax: number
}

const DEFAULT_THRESHOLDS: ClassifierThresholds = {
  lineHeightEstimate: 20,
  avatarSmallMax: 48,
  iconMax: 32,
  avatarMediumMax: 80,
  badgeMaxHeight: 28,
  badgeMaxWidth: 120,
  textSingleLineMaxHeight: 30,
  textMultiLineMinWidthRatio: 0.4,
  imageMinDimension: 100,
  imageAspectRatioMin: 0.8,
  imageAspectRatioMax: 1.2,
}

export function resolveClassifierThresholds(cfg?: ClassifierConfig): ClassifierThresholds {
  if (!cfg) return DEFAULT_THRESHOLDS
  return {
    lineHeightEstimate: cfg.lineHeightEstimate ?? DEFAULT_THRESHOLDS.lineHeightEstimate,
    avatarSmallMax: cfg.avatarSmallMax ?? DEFAULT_THRESHOLDS.avatarSmallMax,
    iconMax: cfg.iconMax ?? DEFAULT_THRESHOLDS.iconMax,
    avatarMediumMax: cfg.avatarMediumMax ?? DEFAULT_THRESHOLDS.avatarMediumMax,
    badgeMaxHeight: cfg.badgeMaxHeight ?? DEFAULT_THRESHOLDS.badgeMaxHeight,
    badgeMaxWidth: cfg.badgeMaxWidth ?? DEFAULT_THRESHOLDS.badgeMaxWidth,
    textSingleLineMaxHeight: cfg.textSingleLineMaxHeight ?? DEFAULT_THRESHOLDS.textSingleLineMaxHeight,
    textMultiLineMinWidthRatio: cfg.textMultiLineMinWidthRatio ?? DEFAULT_THRESHOLDS.textMultiLineMinWidthRatio,
    imageMinDimension: cfg.imageMinDimension ?? DEFAULT_THRESHOLDS.imageMinDimension,
    imageAspectRatioMin: cfg.imageAspectRatioMin ?? DEFAULT_THRESHOLDS.imageAspectRatioMin,
    imageAspectRatioMax: cfg.imageAspectRatioMax ?? DEFAULT_THRESHOLDS.imageAspectRatioMax,
  }
}

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
function buildTagRule(t: ClassifierThresholds): ClassificationRule {
  return {
    match: el => ['img', 'h1', 'h2', 'h3', 'h4', 'p', 'button', 'ul', 'ol'].includes(el.tagName),
    classify: (el, parentWidth) => {
      const relWidth = parentWidth > 0
        ? `${Math.round((el.boundingBox.width / parentWidth) * 100)}%`
        : '100%'
      const { tagName, boundingBox } = el
      if (tagName === 'img') return { type: SK_PRIMITIVE_TYPES.IMAGE, props: { width: relWidth, aspectRatio: el.computedStyles.aspectRatio || '16/9' } }
      if (['h1', 'h2', 'h3', 'h4'].includes(tagName)) return { type: SK_PRIMITIVE_TYPES.HEADING, props: { width: relWidth } }
      if (tagName === 'p') {
        const lines = Math.max(1, Math.round(boundingBox.height / t.lineHeightEstimate))
        return { type: SK_PRIMITIVE_TYPES.TEXT, props: { lines, width: relWidth, lastLineWidth: '60%' } }
      }
      if (tagName === 'button') return { type: SK_PRIMITIVE_TYPES.BUTTON, props: { width: boundingBox.width, height: boundingBox.height } }
      if (tagName === 'ul' || tagName === 'ol') return { type: SK_PRIMITIVE_TYPES.LIST, props: { count: el.children.length || 3 } }
      return { type: SK_PRIMITIVE_TYPES.CARD, props: { width: relWidth } }
    },
  }
}

// Rule 4: Geometry-based
function buildGeometryRule(t: ClassifierThresholds): ClassificationRule {
  return {
    match: () => true,
    classify: (el, parentWidth) => {
      const { boundingBox } = el
      const { width, height } = boundingBox
      const relWidth = parentWidth > 0
        ? `${Math.round((width / parentWidth) * 100)}%`
        : '100%'

      // Small square → Avatar or Icon
      if (width === height && width <= t.avatarSmallMax) {
        const br = el.computedStyles.borderRadius
        if (br === '50%' || br.startsWith('50')) {
          return { type: SK_PRIMITIVE_TYPES.AVATAR, props: { size: width, shape: 'circle' } }
        }
        if (width <= t.iconMax) {
          return { type: SK_PRIMITIVE_TYPES.ICON, props: { size: width } }
        }
        return { type: SK_PRIMITIVE_TYPES.AVATAR, props: { size: width } }
      }

      // Small circular/square medium → Avatar
      if (width === height && width <= t.avatarMediumMax && el.computedStyles.borderRadius === '50%') {
        return { type: SK_PRIMITIVE_TYPES.AVATAR, props: { size: width, shape: 'circle' } }
      }

      // Small narrow height (badge-like)
      if (height <= t.badgeMaxHeight && width <= t.badgeMaxWidth) {
        return { type: SK_PRIMITIVE_TYPES.BADGE, props: { width, height } }
      }

      // Single line text
      if (height <= t.textSingleLineMaxHeight && width > 60) {
        return { type: SK_PRIMITIVE_TYPES.TEXT, props: { lines: 1, width: relWidth } }
      }

      // Multi-line text
      if (height > t.lineHeightEstimate && height < t.lineHeightEstimate * 6 && width > parentWidth * t.textMultiLineMinWidthRatio) {
        const lines = Math.max(1, Math.round(height / t.lineHeightEstimate))
        return { type: SK_PRIMITIVE_TYPES.TEXT, props: { lines, width: relWidth, lastLineWidth: '60%' } }
      }

      // Large area image-like
      if (width > t.imageMinDimension && height > t.imageMinDimension) {
        const aspectRatio = width / height
        if (aspectRatio > t.imageAspectRatioMax || aspectRatio < t.imageAspectRatioMin) {
          return { type: SK_PRIMITIVE_TYPES.IMAGE, props: { width: relWidth, aspectRatio: el.computedStyles.aspectRatio || '16/9' } }
        }
      }

      // Default: card
      return { type: SK_PRIMITIVE_TYPES.CARD, props: { width: relWidth, height } }
    },
  }
}

export function buildClassificationRules(t: ClassifierThresholds): ClassificationRule[] {
  return [
    explicitHintRule,
    ariaRoleRule,
    buildTagRule(t),
    buildGeometryRule(t),
  ]
}
