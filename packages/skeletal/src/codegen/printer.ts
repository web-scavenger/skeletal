import type { ClassifiedElement, SkeletonTree } from '../classifier/types.js'

const CONTAINER_TYPES: ReadonlySet<string> = new Set(['Card', 'List'])

function indent(level: number): string {
  return '  '.repeat(level)
}

function printProps(props: Record<string, unknown>): string {
  const parts: string[] = []
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null) continue
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

export function printElement(el: ClassifiedElement, indentLevel: number): string {
  const tag = `Sk.${el.primitiveType}`
  const props = printProps(el.props)
  const ind = indent(indentLevel)

  const hasChildren = el.children.length > 0 && CONTAINER_TYPES.has(el.primitiveType)

  if (!hasChildren) {
    return `${ind}<${tag}${props} />`
  }

  const childLines = el.children.map(child => printElement(child, indentLevel + 1))
  return [
    `${ind}<${tag}${props}>`,
    ...childLines,
    `${ind}</${tag}>`,
  ].join('\n')
}

export function printSkeletonTree(tree: SkeletonTree, indentLevel = 2): string {
  return tree.map(el => printElement(el, indentLevel)).join('\n')
}
