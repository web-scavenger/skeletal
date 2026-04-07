import type { ExtractedChildGeometry } from './types.js'

// This function runs inside page.evaluate() — no imports allowed
export function extractChildGeometryScript(): string {
  return `
(element) => {
  function extractChildren(el, depth) {
    if (depth > 10) return []

    const children = []
    for (const child of el.children) {
      const rect = child.getBoundingClientRect()
      if (rect.width === 0 && rect.height === 0) continue

      const styles = window.getComputedStyle(child)
      const entry = {
        tagName: child.tagName.toLowerCase(),
        role: child.getAttribute('role'),
        dataSkType: child.getAttribute('data-sk-type'),
        boundingBox: {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        },
        computedStyles: {
          borderRadius: styles.borderRadius,
          aspectRatio: styles.aspectRatio,
        },
        children: extractChildren(child, depth + 1),
      }
      children.push(entry)
    }
    return children
  }

  return extractChildren(element, 0)
}
`
}

// Type-safe wrapper — called from Node.js after page.evaluate returns
export function normalizeChildGeometry(raw: unknown): ExtractedChildGeometry[] {
  if (!Array.isArray(raw)) return []
  return raw.map(item => {
    const r = item as Record<string, unknown>
    return {
      tagName: String(r['tagName'] ?? 'div'),
      role: r['role'] != null ? String(r['role']) : null,
      dataSkType: r['dataSkType'] != null ? String(r['dataSkType']) : null,
      boundingBox: {
        x: Number(((r['boundingBox'] as Record<string, unknown>)?.['x']) ?? 0),
        y: Number(((r['boundingBox'] as Record<string, unknown>)?.['y']) ?? 0),
        width: Number(((r['boundingBox'] as Record<string, unknown>)?.['width']) ?? 0),
        height: Number(((r['boundingBox'] as Record<string, unknown>)?.['height']) ?? 0),
      },
      computedStyles: {
        borderRadius: String(((r['computedStyles'] as Record<string, unknown>)?.['borderRadius']) ?? ''),
        aspectRatio: String(((r['computedStyles'] as Record<string, unknown>)?.['aspectRatio']) ?? ''),
      },
      children: normalizeChildGeometry(r['children']),
    }
  })
}
