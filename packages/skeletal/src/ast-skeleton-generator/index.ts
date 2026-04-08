import { Project, SyntaxKind } from 'ts-morph'
import type { Node, SourceFile } from 'ts-morph'
import type { ExtractedChildGeometry, ExtractedGeometry } from '../playwright-crawler/types.js'

// --- Class filtering ---

const LAYOUT_EXACT = new Set([
  'flex', 'grid', 'relative', 'absolute', 'fixed', 'sticky',
  'block', 'inline-block', 'inline-flex', 'inline-grid', 'contents',
  'rounded',
])

const LAYOUT_PREFIXES = [
  'flex-', 'grid-',
  'gap-', 'gap-x-', 'gap-y-', 'space-x-', 'space-y-',
  'p-', 'px-', 'py-', 'pt-', 'pb-', 'pl-', 'pr-',
  'm-', 'mx-', 'my-', 'mt-', 'mb-', 'ml-', 'mr-',
  'w-', 'h-', 'max-w-', 'min-w-', 'max-h-', 'min-h-', 'size-',
  'items-', 'justify-', 'self-', 'place-', 'align-',
  'col-', 'row-',
  'overflow-', 'rounded-',
  'border-t', 'border-b', 'border-l', 'border-r', 'border-x', 'border-y',
  'inset-', 'top-', 'left-', 'right-', 'bottom-', 'z-',
  'aspect-', 'shrink-', 'grow-', 'basis-',
]

function filterLayoutClasses(classes: string): string {
  return classes
    .split(/\s+/)
    .filter(cls => {
      if (!cls) return false
      if (LAYOUT_EXACT.has(cls)) return true
      return LAYOUT_PREFIXES.some(p => cls.startsWith(p))
    })
    .join(' ')
    .trim()
}

// --- Attribute helpers ---

function getClassAttr(node: Node): string {
  const kind = node.getKind()
  let opening: Node | undefined
  if (kind === SyntaxKind.JsxElement) {
    opening = node.asKind(SyntaxKind.JsxElement)!.getOpeningElement()
  } else if (kind === SyntaxKind.JsxSelfClosingElement) {
    opening = node
  } else {
    return ''
  }

  const attr = (opening as ReturnType<typeof opening.asKind<typeof SyntaxKind.JsxOpeningElement>>)
  if (!attr) return ''

  // Use getText-based extraction for reliability
  const text = opening.getText()
  const staticMatch = text.match(/className=["']([^"']*)["']/)
  if (staticMatch?.[1]) return staticMatch[1]

  // Template literals: strip ${...} interpolations and return static tokens
  const templateMatch = text.match(/className=\{`([^`]*)`\}/)
  if (templateMatch?.[1]) {
    return templateMatch[1].replace(/\$\{[^}]*\}/g, ' ').replace(/\s+/g, ' ').trim()
  }

  return ''
}

function getClassFromOpeningOrSelfClosing(node: Node): string {
  const text = node.getText()
  const staticMatch = text.match(/className=["']([^"']*)["']/)
  if (staticMatch?.[1]) return staticMatch[1]

  // Template literals: strip ${...} interpolations and return static tokens
  const templateMatch = text.match(/className=\{`([^`]*)`\}/)
  if (templateMatch?.[1]) {
    return templateMatch[1].replace(/\$\{[^}]*\}/g, ' ').replace(/\s+/g, ' ').trim()
  }

  return ''
}

function getTagName(node: Node): string {
  const k = node.getKind()
  if (k === SyntaxKind.JsxElement) {
    return node.asKind(SyntaxKind.JsxElement)!.getOpeningElement().getTagNameNode().getText()
  }
  if (k === SyntaxKind.JsxSelfClosingElement) {
    return node.asKind(SyntaxKind.JsxSelfClosingElement)!.getTagNameNode().getText()
  }
  return ''
}

// --- Element classification helpers ---

function isAvatarDiv(tag: string, classes: string): boolean {
  return tag === 'div' &&
    classes.includes('rounded-full') &&
    /\bw-\d+\b/.test(classes) &&
    /\bh-\d+\b/.test(classes)
}

function tailwindToPx(classes: string, axis: 'w' | 'h'): number {
  const match = classes.match(new RegExp(`\\b${axis}-(\\d+)\\b`))
  if (!match?.[1]) return 40
  return parseInt(match[1]) * 4
}

function isHeadingTag(tag: string): boolean {
  return /^h[1-6]$/.test(tag)
}

function isTextTag(tag: string): boolean {
  return ['p', 'span', 'label', 'li', 'dt', 'dd', 'caption', 'figcaption'].includes(tag)
}

function isNumberLike(tag: string, classes: string): boolean {
  if (!isTextTag(tag)) return false
  const hasBold = classes.includes('font-bold') || classes.includes('font-semibold')
  const hasSizeBase = /\btext-(base|lg|xl|2xl|3xl)\b/.test(classes)
  return hasBold && hasSizeBase
}

const SPACING_PREFIXES = ['mt-', 'mb-', 'ml-', 'mr-', 'mx-', 'my-', 'm-', 'pt-', 'pb-', 'pl-', 'pr-', 'px-', 'py-', 'p-']

function extractSpacingClasses(classes: string): string {
  return classes.split(/\s+/).filter(c => SPACING_PREFIXES.some(p => c.startsWith(p))).join(' ').trim()
}

const INLINE_TAGS = new Set(['span', 'strong', 'em', 'b', 'i', 'a', 'code', 'small', 'mark', 'label'])

function hasOnlyInlineChildren(children: Node[]): boolean {
  return children.every(c => {
    const k = c.getKind()
    if (k === SyntaxKind.JsxText || k === SyntaxKind.JsxExpression) return true
    if (k === SyntaxKind.JsxElement) {
      const tag = c.asKind(SyntaxKind.JsxElement)!.getOpeningElement().getTagNameNode().getText()
      return INLINE_TAGS.has(tag)
    }
    return false
  })
}

// --- Array length resolver (for .map()) ---

function resolveArrayLength(sf: SourceFile, dotPath: string): number | undefined {
  const parts = dotPath.split('.')
  if (parts.length === 0 || !parts[0]) return undefined

  // Try direct variable: e.g., "items"
  if (parts.length === 1) {
    let init = sf.getVariableDeclaration(parts[0])?.getInitializer()
    if (init?.getKind() === SyntaxKind.AsExpression) {
      init = init.asKind(SyntaxKind.AsExpression)!.getExpression()
    }
    if (init?.getKind() === SyntaxKind.ArrayLiteralExpression) {
      return init.asKind(SyntaxKind.ArrayLiteralExpression)!.getElements().length
    }
    return undefined
  }

  // Traverse object path: e.g., "USER.stats"
  let current: Node | undefined = sf.getVariableDeclaration(parts[0])?.getInitializer()
  if (!current) return undefined

  // Unwrap AsExpression
  if (current.getKind() === SyntaxKind.AsExpression) {
    current = current.asKind(SyntaxKind.AsExpression)!.getExpression()
  }

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i]
    if (!part || current?.getKind() !== SyntaxKind.ObjectLiteralExpression) break
    const objLit: import('ts-morph').ObjectLiteralExpression = current.asKind(SyntaxKind.ObjectLiteralExpression)!
    const prop: import('ts-morph').ObjectLiteralElementLike | undefined = objLit.getProperty(part)
    current = prop?.asKind(SyntaxKind.PropertyAssignment)?.getInitializer()
    if (current?.getKind() === SyntaxKind.AsExpression) {
      current = current.asKind(SyntaxKind.AsExpression)!.getExpression()
    }
  }

  if (current?.getKind() === SyntaxKind.ArrayLiteralExpression) {
    return current.asKind(SyntaxKind.ArrayLiteralExpression)!.getElements().length
  }
  return undefined
}

// --- Walker ---

function ind(depth: number): string {
  return '  '.repeat(depth + 2) // +2 for base indentation inside return (...)
}

function walkChild(node: Node, sf: SourceFile, depth: number, parentIsFlex = false): string {
  const k = node.getKind()

  if (k === SyntaxKind.JsxText) return ''

  if (k === SyntaxKind.JsxFragment) {
    return node.asKind(SyntaxKind.JsxFragment)!
      .getJsxChildren()
      .map(c => walkChild(c, sf, depth, parentIsFlex))
      .filter(Boolean)
      .join('\n')
  }

  if (k === SyntaxKind.JsxExpression) {
    const expr = node.asKind(SyntaxKind.JsxExpression)?.getExpression()
    if (!expr) return ''
    return walkExpr(expr, sf, depth)
  }

  if (k === SyntaxKind.JsxSelfClosingElement) {
    const tag = node.asKind(SyntaxKind.JsxSelfClosingElement)!.getTagNameNode().getText()
    const classes = getClassFromOpeningOrSelfClosing(node)
    return classifyLeaf(tag, classes, depth)
  }

  if (k === SyntaxKind.JsxElement) {
    const el = node.asKind(SyntaxKind.JsxElement)!
    const tag = el.getOpeningElement().getTagNameNode().getText()
    const classes = getClassFromOpeningOrSelfClosing(el.getOpeningElement())
    const children = el.getJsxChildren()
    return classifyNode(tag, classes, children, sf, depth, parentIsFlex)
  }

  return ''
}

function classifyLeaf(tag: string, classes: string, depth: number): string {
  const i = ind(depth)
  if (tag === 'img') return `${i}<Sk.Image />`
  if (tag === 'button') return `${i}<Sk.Button />`
  if (isHeadingTag(tag)) return `${i}<Sk.Heading />`
  if (isAvatarDiv(tag, classes)) return `${i}<Sk.Avatar size={${tailwindToPx(classes, 'w')}} />`
  if (isNumberLike(tag, classes)) return `${i}<Sk.Number />`
  if (isTextTag(tag)) return `${i}<Sk.Text />`
  return ''
}

function classifyNode(
  tag: string,
  classes: string,
  children: Node[],
  sf: SourceFile,
  depth: number,
  parentIsFlex = false,
): string {
  const i = ind(depth)

  if (isAvatarDiv(tag, classes)) return `${i}<Sk.Avatar size={${tailwindToPx(classes, 'w')}} />`
  if (isHeadingTag(tag)) return `${i}<Sk.Heading />`
  if (tag === 'button') return `${i}<Sk.Button />`
  if (tag === 'img') return `${i}<Sk.Image />`

  const aspectCls = classes.split(' ').find(c => c.startsWith('aspect-'))
  if (aspectCls) {
    const ar = aspectCls === 'aspect-video' ? '16/9' : aspectCls === 'aspect-square' ? '1/1' : '16/9'
    return `${i}<Sk.Image aspectRatio="${ar}" width="100%" />`
  }

  if (isTextTag(tag) && hasOnlyInlineChildren(children)) {
    if (isNumberLike(tag, classes)) return `${i}<Sk.Number />`
    const spacing = extractSpacingClasses(classes)
    const clsAttr = spacing ? ` className="${spacing}"` : ''
    return `${i}<Sk.Text${clsAttr} />`
  }

  if (tag === 'ul' || tag === 'ol') return `${i}<Sk.List />`

  const thisIsFlex = classes.includes('flex')
  const childLines = children
    .map(c => walkChild(c, sf, depth + 1, thisIsFlex))
    .filter(s => s.trim())

  if (childLines.length === 0) return ''

  // Root (depth=0): preserve all classes for visual boundary (bg, border, etc.)
  // Deeper: layout classes only; bare div in flex row gets flex-1 min-w-0
  let outputCls: string
  if (depth === 0) {
    outputCls = classes
  } else {
    outputCls = filterLayoutClasses(classes)
    if (!outputCls && parentIsFlex) outputCls = 'flex-1 min-w-0'
  }

  const clsAttr = outputCls ? ` className="${outputCls}"` : ''

  if (childLines.length === 1 && !outputCls) return childLines[0]!

  return [`${i}<${tag}${clsAttr}>`, ...childLines, `${i}</${tag}>`].join('\n')
}

function walkExpr(expr: Node, sf: SourceFile, depth: number): string {
  // arr.map(item => <JSX />) — render template N times
  if (expr.getKind() === SyntaxKind.CallExpression) {
    const call = expr.asKind(SyntaxKind.CallExpression)!
    const callText = call.getExpression().getText()

    if (callText.endsWith('.map')) {
      const mapArg = call.getArguments()[0]
      if (!mapArg) return ''

      let jsxNode: Node | undefined

      if (mapArg.getKind() === SyntaxKind.ArrowFunction) {
        const body = mapArg.asKind(SyntaxKind.ArrowFunction)!.getBody()
        const bk = body.getKind()

        if (bk === SyntaxKind.ParenthesizedExpression) {
          const inner = body.asKind(SyntaxKind.ParenthesizedExpression)!.getExpression()
          if ([SyntaxKind.JsxElement, SyntaxKind.JsxSelfClosingElement, SyntaxKind.JsxFragment].includes(inner.getKind())) {
            jsxNode = inner
          }
        } else if ([SyntaxKind.JsxElement, SyntaxKind.JsxSelfClosingElement].includes(bk)) {
          jsxNode = body
        } else if (bk === SyntaxKind.Block) {
          body.forEachDescendant(n => {
            if (jsxNode) return
            if (n.getKind() === SyntaxKind.ReturnStatement) {
              const ret = n.asKind(SyntaxKind.ReturnStatement)!.getExpression()
              if (ret && [SyntaxKind.JsxElement, SyntaxKind.JsxSelfClosingElement].includes(ret.getKind())) {
                jsxNode = ret
              }
            }
          })
        }
      }

      if (!jsxNode) return ''

      const arrayVarPath = callText.slice(0, -4) // remove '.map'
      const count = resolveArrayLength(sf, arrayVarPath) ?? 1
      const template = walkChild(jsxNode, sf, depth)
      if (!template.trim()) return ''

      return Array(count).fill(template).join('\n')
    }
  }

  // cond ? <A /> : <B /> — use truthy branch
  if (expr.getKind() === SyntaxKind.ConditionalExpression) {
    const truthy = expr.asKind(SyntaxKind.ConditionalExpression)!.getWhenTrue()
    return walkChild(truthy, sf, depth)
  }

  return ''
}

// --- Geometry-aware walk ---

// Mutable index shared by sibling-level walkers
interface GeoRef { i: number }

const LINE_HEIGHT_PX = 20 // approximate for text-sm/text-base

function pct(px: number, parentPx: number): string {
  if (parentPx <= 0) return '100%'
  return `${Math.round((px / parentPx) * 100)}%`
}

function isCircularGeo(geo: ExtractedChildGeometry): boolean {
  const br = geo.computedStyles.borderRadius
  const { width: w, height: h } = geo.boundingBox
  if (!br) return false
  if (br === '50%') return true
  const brPx = parseFloat(br)
  return !isNaN(brPx) && brPx >= Math.min(w, h) * 0.45 && Math.abs(w - h) < w * 0.25
}

function isImageShapedGeo(geo: ExtractedChildGeometry): boolean {
  const ar = geo.computedStyles.aspectRatio
  return !!ar && ar !== 'auto' && ar !== ''
}

function classifyLeafWithGeo(
  tag: string,
  classes: string,
  geo: ExtractedChildGeometry,
  parentWidth: number,
  depth: number,
): string {
  const i = ind(depth)
  const w = geo.boundingBox.width
  const h = geo.boundingBox.height

  if (tag === 'img') return `${i}<Sk.Image />`
  if (tag === 'button') return `${i}<Sk.Button />`
  if (isHeadingTag(tag)) {
    return h > 0
      ? `${i}<Sk.Heading height="${Math.round(h)}px" width="${pct(w, parentWidth)}" />`
      : `${i}<Sk.Heading width="${pct(w, parentWidth)}" />`
  }

  if (isCircularGeo(geo)) {
    const size = Math.round(Math.min(w, h))
    return `${i}<Sk.Avatar size={${size}} />`
  }
  if (isAvatarDiv(tag, classes)) {
    const size = Math.round(w) || tailwindToPx(classes, 'w')
    return `${i}<Sk.Avatar size={${size}} />`
  }

  if (isImageShapedGeo(geo)) {
    const ar = geo.computedStyles.aspectRatio.replace(' / ', '/')
    return `${i}<Sk.Image aspectRatio="${ar}" width="100%" />`
  }

  if (isNumberLike(tag, classes)) {
    const fontSizePx = parseFloat(geo.computedStyles.fontSize) || 16
    // outerHeight = bounding box (layout stability), height = fontSize (visual accuracy)
    return `${i}<Sk.Number width={${Math.round(w)}} height="${Math.round(fontSizePx)}px" outerHeight="${Math.round(h)}px" />`
  }

  if (isTextTag(tag)) {
    const fontSizePx = parseFloat(geo.computedStyles.fontSize) || 14
    const lineHeightPx = parseFloat(geo.computedStyles.lineHeight) || fontSizePx * 1.4
    const lines = Math.max(1, Math.round(h / lineHeightPx))
    const barHeightPx = Math.round(fontSizePx)
    const heightStr = `${barHeightPx}px`
    const widthStr = pct(w, parentWidth)
    const spacing = extractSpacingClasses(classes)
    const clsAttr = spacing ? ` className="${spacing}"` : ''
    if (lines > 1) {
      // gap computed so total skeleton height = measured bounding box h
      const gapPx = Math.max(0, Math.round((h - lines * barHeightPx) / (lines - 1)))
      return `${i}<Sk.Text${clsAttr} lines={${lines}} height="${heightStr}" gap="${gapPx}px" width="${widthStr}" />`
    }
    // lineHeight = bounding box (layout stability), height = fontSize (visual accuracy)
    const lineHeightStr = `${Math.round(lineHeightPx)}px`
    return `${i}<Sk.Text${clsAttr} height="${heightStr}" lineHeight="${lineHeightStr}" width="${widthStr}" />`
  }

  return ''
}

function extractMapJsxNode(mapArg: Node): Node | undefined {
  if (mapArg.getKind() !== SyntaxKind.ArrowFunction) return undefined
  const body = mapArg.asKind(SyntaxKind.ArrowFunction)!.getBody()
  const bk = body.getKind()
  const jsxKinds = [SyntaxKind.JsxElement, SyntaxKind.JsxSelfClosingElement, SyntaxKind.JsxFragment]

  if (bk === SyntaxKind.ParenthesizedExpression) {
    const inner = body.asKind(SyntaxKind.ParenthesizedExpression)!.getExpression()
    if (jsxKinds.includes(inner.getKind())) return inner
  }
  if (jsxKinds.includes(bk)) return body
  if (bk === SyntaxKind.Block) {
    let found: Node | undefined
    body.forEachDescendant(n => {
      if (found) return
      if (n.getKind() === SyntaxKind.ReturnStatement) {
        const ret = n.asKind(SyntaxKind.ReturnStatement)!.getExpression()
        if (ret && jsxKinds.includes(ret.getKind())) found = ret
      }
    })
    return found
  }
  return undefined
}

function walkChildWithGeo(
  node: Node,
  sf: SourceFile,
  geoSiblings: ExtractedChildGeometry[],
  geoRef: GeoRef,
  parentWidth: number,
  depth: number,
  parentIsFlex = false,
): string {
  const k = node.getKind()

  if (k === SyntaxKind.JsxText) return ''

  if (k === SyntaxKind.JsxFragment) {
    return node.asKind(SyntaxKind.JsxFragment)!
      .getJsxChildren()
      .map(c => walkChildWithGeo(c, sf, geoSiblings, geoRef, parentWidth, depth, parentIsFlex))
      .filter(Boolean)
      .join('\n')
  }

  if (k === SyntaxKind.JsxExpression) {
    const expr = node.asKind(SyntaxKind.JsxExpression)?.getExpression()
    if (!expr) return ''
    return walkExprWithGeo(expr, sf, geoSiblings, geoRef, parentWidth, depth)
  }

  // Consume one geo sibling for this element
  const geo = geoSiblings[geoRef.i]
  geoRef.i++

  if (k === SyntaxKind.JsxSelfClosingElement) {
    const tag = node.asKind(SyntaxKind.JsxSelfClosingElement)!.getTagNameNode().getText()
    const classes = getClassFromOpeningOrSelfClosing(node)
    return geo
      ? classifyLeafWithGeo(tag, classes, geo, parentWidth, depth)
      : classifyLeaf(tag, classes, depth)
  }

  if (k === SyntaxKind.JsxElement) {
    const el = node.asKind(SyntaxKind.JsxElement)!
    const tag = el.getOpeningElement().getTagNameNode().getText()
    const classes = getClassFromOpeningOrSelfClosing(el.getOpeningElement())
    const children = el.getJsxChildren()
    return geo
      ? classifyNodeWithGeo(tag, classes, children, geo, sf, parentWidth, depth, parentIsFlex)
      : classifyNode(tag, classes, children, sf, depth, parentIsFlex)
  }

  return ''
}

function classifyNodeWithGeo(
  tag: string,
  classes: string,
  children: Node[],
  geo: ExtractedChildGeometry,
  sf: SourceFile,
  parentWidth: number,
  depth: number,
  parentIsFlex = false,
): string {
  const i = ind(depth)
  const w = geo.boundingBox.width
  const h = geo.boundingBox.height

  if (isHeadingTag(tag)) {
    return h > 0
      ? `${i}<Sk.Heading height="${Math.round(h)}px" width="${pct(w, parentWidth)}" />`
      : `${i}<Sk.Heading width="${pct(w, parentWidth)}" />`
  }
  if (tag === 'button') return `${i}<Sk.Button />`
  if (tag === 'img') return `${i}<Sk.Image />`

  if (isCircularGeo(geo)) {
    const size = Math.round(Math.min(geo.boundingBox.width, geo.boundingBox.height))
    return `${i}<Sk.Avatar size={${size}} />`
  }
  if (isAvatarDiv(tag, classes)) {
    const size = Math.round(w) || tailwindToPx(classes, 'w')
    return `${i}<Sk.Avatar size={${size}} />`
  }

  if (isImageShapedGeo(geo)) {
    const ar = geo.computedStyles.aspectRatio.replace(' / ', '/')
    return `${i}<Sk.Image aspectRatio="${ar}" width="100%" />`
  }

  const aspectCls = classes.split(' ').find(c => c.startsWith('aspect-'))
  if (aspectCls) {
    const ar = aspectCls === 'aspect-video' ? '16/9' : aspectCls === 'aspect-square' ? '1/1' : '16/9'
    return `${i}<Sk.Image aspectRatio="${ar}" width="100%" />`
  }

  if (isTextTag(tag) && hasOnlyInlineChildren(children)) {
    return classifyLeafWithGeo(tag, classes, geo, parentWidth, depth)
  }

  if (tag === 'ul' || tag === 'ol') return `${i}<Sk.List />`

  // Container: this element's width becomes the parent width for children
  const thisIsFlex = classes.includes('flex')
  const childRef: GeoRef = { i: 0 }
  const childLines = children
    .map(c => walkChildWithGeo(c, sf, geo.children, childRef, w, depth + 1, thisIsFlex))
    .filter(s => s.trim())

  if (childLines.length === 0) return ''

  // Root (depth=0): preserve all classes; deeper: layout only + flex-1 rule
  let outputCls: string
  if (depth === 0) {
    outputCls = classes
  } else {
    outputCls = filterLayoutClasses(classes)
    if (!outputCls && parentIsFlex) outputCls = 'flex-1 min-w-0'
  }

  const clsAttr = outputCls ? ` className="${outputCls}"` : ''

  if (childLines.length === 1 && !outputCls) return childLines[0]!

  return [`${i}<${tag}${clsAttr}>`, ...childLines, `${i}</${tag}>`].join('\n')
}

function walkExprWithGeo(
  expr: Node,
  sf: SourceFile,
  geoSiblings: ExtractedChildGeometry[],
  geoRef: GeoRef,
  parentWidth: number,
  depth: number,
): string {
  if (expr.getKind() === SyntaxKind.CallExpression) {
    const call = expr.asKind(SyntaxKind.CallExpression)!
    const callText = call.getExpression().getText()

    if (callText.endsWith('.map')) {
      const mapArg = call.getArguments()[0]
      if (!mapArg) return ''
      const jsxNode = extractMapJsxNode(mapArg)
      if (!jsxNode) return ''

      const arrayVarPath = callText.slice(0, -4)
      // Use remaining geo siblings to determine repeat count (more reliable than AST)
      const geoCount = geoSiblings.length - geoRef.i
      const astCount = resolveArrayLength(sf, arrayVarPath)
      const count = astCount ?? geoCount
      if (count <= 0) return ''

      const parts: string[] = []
      for (let k = 0; k < count; k++) {
        const itemGeo = geoSiblings[geoRef.i + k]
        if (!itemGeo) {
          // Fall back to no-geo for remaining items
          const template = walkChild(jsxNode, sf, depth)
          if (template.trim()) parts.push(template)
        } else {
          const inner = classifyNodeWithGeo(
            getTagName(jsxNode),
            getClassAttr(jsxNode),
            jsxNode.getKind() === SyntaxKind.JsxElement
              ? jsxNode.asKind(SyntaxKind.JsxElement)!.getJsxChildren()
              : [],
            itemGeo,
            sf,
            parentWidth,
            depth,
            false,
          )
          if (inner.trim()) parts.push(inner)
        }
      }
      geoRef.i += count
      return parts.join('\n')
    }
  }

  if (expr.getKind() === SyntaxKind.ConditionalExpression) {
    const truthy = expr.asKind(SyntaxKind.ConditionalExpression)!.getWhenTrue()
    return walkChildWithGeo(truthy, sf, geoSiblings, geoRef, parentWidth, depth)
  }

  return ''
}

// --- Public API ---

export function generateSkeletonBodyFromSource(
  sourceFilePath: string,
  componentName: string,
): string | null {
  try {
    const project = new Project({
      useInMemoryFileSystem: false,
      compilerOptions: { jsx: 4 /* ReactJSX */, allowJs: true },
      skipAddingFilesFromTsConfig: true,
    })

    const sf = project.addSourceFileAtPath(sourceFilePath)

    // Find the component function body
    const fn = sf.getFunction(componentName)
    const varDecl = sf.getVariableDeclaration(componentName)
    const arrowFn = varDecl?.getInitializer()?.asKind(SyntaxKind.ArrowFunction)
    const fnExpr = varDecl?.getInitializer()?.asKind(SyntaxKind.FunctionExpression)

    const body = fn?.getBody() ?? arrowFn?.getBody() ?? fnExpr?.getBody()
    if (!body) return null

    // Find the first JSX return
    let jsxRoot: Node | null = null
    body.forEachDescendant(node => {
      if (jsxRoot) return
      if (node.getKind() !== SyntaxKind.ReturnStatement) return

      const expr = node.asKind(SyntaxKind.ReturnStatement)!.getExpression()
      if (!expr) return

      let candidate: Node | undefined
      const jsxKinds = [SyntaxKind.JsxElement, SyntaxKind.JsxSelfClosingElement, SyntaxKind.JsxFragment]

      if (jsxKinds.includes(expr.getKind())) {
        candidate = expr
      } else if (expr.getKind() === SyntaxKind.ParenthesizedExpression) {
        const inner = expr.asKind(SyntaxKind.ParenthesizedExpression)!.getExpression()
        if (jsxKinds.includes(inner.getKind())) candidate = inner
      }

      if (candidate) jsxRoot = candidate
    })

    if (!jsxRoot) return null

    const result = walkChild(jsxRoot, sf, 0)
    return result.trim() ? result : null
  } catch {
    return null
  }
}

export function generateSkeletonBodyWithGeometry(
  sourceFilePath: string,
  componentName: string,
  geometry: ExtractedGeometry,
): string | null {
  if (geometry.timedOut) return generateSkeletonBodyFromSource(sourceFilePath, componentName)

  try {
    const project = new Project({
      useInMemoryFileSystem: false,
      compilerOptions: { jsx: 4 /* ReactJSX */, allowJs: true },
      skipAddingFilesFromTsConfig: true,
    })

    const sf = project.addSourceFileAtPath(sourceFilePath)

    const fn = sf.getFunction(componentName)
    const varDecl = sf.getVariableDeclaration(componentName)
    const arrowFn = varDecl?.getInitializer()?.asKind(SyntaxKind.ArrowFunction)
    const fnExpr = varDecl?.getInitializer()?.asKind(SyntaxKind.FunctionExpression)

    const body = fn?.getBody() ?? arrowFn?.getBody() ?? fnExpr?.getBody()
    if (!body) return null

    let jsxRoot: Node | null = null
    body.forEachDescendant(node => {
      if (jsxRoot) return
      if (node.getKind() !== SyntaxKind.ReturnStatement) return
      const expr = node.asKind(SyntaxKind.ReturnStatement)!.getExpression()
      if (!expr) return
      const jsxKinds = [SyntaxKind.JsxElement, SyntaxKind.JsxSelfClosingElement, SyntaxKind.JsxFragment]
      let candidate: Node | undefined
      if (jsxKinds.includes(expr.getKind())) {
        candidate = expr
      } else if (expr.getKind() === SyntaxKind.ParenthesizedExpression) {
        const inner = expr.asKind(SyntaxKind.ParenthesizedExpression)!.getExpression()
        if (jsxKinds.includes(inner.getKind())) candidate = inner
      }
      if (candidate) jsxRoot = candidate
    })

    if (!jsxRoot) return null

    // The root JSX element IS the data-sk element — use geometry.children for its children
    // and geometry.boundingBox.width as the parent width
    const rootGeo: ExtractedChildGeometry = {
      tagName: getTagName(jsxRoot),
      role: null,
      dataSkType: null,
      boundingBox: geometry.boundingBox,
      computedStyles: { borderRadius: '', aspectRatio: '', fontSize: '', lineHeight: '' },
      children: geometry.children,
    }

    const root = jsxRoot as Node
    const tag = getTagName(root)
    const classes = getClassAttr(root)
    const children = root.getKind() === SyntaxKind.JsxElement
      ? root.asKind(SyntaxKind.JsxElement)!.getJsxChildren()
      : []

    // parentWidth for root = its own width (no outer reference available)
    const result = classifyNodeWithGeo(tag, classes, children, rootGeo, sf, rootGeo.boundingBox.width, 0)
    return result.trim() ? result : null
  } catch {
    return generateSkeletonBodyFromSource(sourceFilePath, componentName)
  }
}
