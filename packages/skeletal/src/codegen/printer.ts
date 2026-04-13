import type { ClassifiedElement, SkeletonTree } from '../classifier/types.js'
import type { PrimitivesConfig } from '../config/types.js'

const CONTAINER_TYPES: ReadonlySet<string> = new Set(['Card', 'List'])

// Hardcoded component defaults — must mirror the defaults in each Sk.* primitive.
const PRIMITIVE_DEFAULTS: Record<string, Record<string, unknown>> = {
  Avatar: { size: 40, shape: 'circle' },
  Icon: { size: 24 },
  Button: { width: 120, height: 36 },
  Badge: { width: 60, height: 20 },
  Text: { lines: 1, lastLineWidth: '60%', width: '100%', height: '1em', gap: '0.4em' },
  Heading: { width: '70%', height: '1.4em' },
  Image: { width: '100%', aspectRatio: '16/9' },
  Card: { width: '100%', padding: 16 },
  List: { count: 3, gap: 12 },
}

function getEffectiveDefaults(type: string, primitivesConfig?: PrimitivesConfig): Record<string, unknown> {
  const base = PRIMITIVE_DEFAULTS[type] ?? {}
  if (!primitivesConfig) return base
  const key = (type.charAt(0).toLowerCase() + type.slice(1)) as keyof PrimitivesConfig
  const overrides = primitivesConfig[key] ?? {}
  return { ...base, ...overrides }
}

function indent(level: number): string {
  return '  '.repeat(level)
}

function printProps(props: Record<string, unknown>, defaults: Record<string, unknown>): string {
  const parts: string[] = []
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null) continue
    if (value === defaults[key]) continue // elide if matches effective default
    if (typeof value === 'string') {
      parts.push(`${key}="${value}"`)
    } else if (typeof value === 'number') {
      parts.push(`${key}={${value}}`)
    } else if (typeof value === 'boolean') {
      if (value) parts.push(key)
    }
  }
  return parts.length > 0 ? ' ' + parts.join(' ') : ''
}

export function printElement(el: ClassifiedElement, indentLevel: number, primitivesConfig?: PrimitivesConfig): string {
  const tag = `Sk.${el.primitiveType}`
  const defaults = getEffectiveDefaults(el.primitiveType, primitivesConfig)
  const props = printProps(el.props, defaults)
  const ind = indent(indentLevel)

  const hasChildren = el.children.length > 0 && CONTAINER_TYPES.has(el.primitiveType)

  if (!hasChildren) {
    return `${ind}<${tag}${props} />`
  }

  const childLines = el.children.map(child => printElement(child, indentLevel + 1, primitivesConfig))
  return [
    `${ind}<${tag}${props}>`,
    ...childLines,
    `${ind}</${tag}>`,
  ].join('\n')
}

export function printSkeletonTree(tree: SkeletonTree, indentLevel = 2, primitivesConfig?: PrimitivesConfig): string {
  return tree.map(el => printElement(el, indentLevel, primitivesConfig)).join('\n')
}
