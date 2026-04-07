import { createHash } from 'node:crypto'
import type { Node } from 'ts-morph'
import { SyntaxKind } from 'ts-morph'

function extractJsxStructureText(node: Node): string {
  const parts: string[] = []

  function walk(n: Node): void {
    const kind = n.getKind()
    if (
      kind === SyntaxKind.JsxElement ||
      kind === SyntaxKind.JsxSelfClosingElement ||
      kind === SyntaxKind.JsxFragment
    ) {
      parts.push(n.getKindName())
      // Include tag name for elements
      if (kind === SyntaxKind.JsxElement) {
        const openEl = n.asKind(SyntaxKind.JsxElement)
        if (openEl) {
          parts.push(openEl.getOpeningElement().getTagNameNode().getText())
        }
      } else if (kind === SyntaxKind.JsxSelfClosingElement) {
        const selfClose = n.asKind(SyntaxKind.JsxSelfClosingElement)
        if (selfClose) {
          parts.push(selfClose.getTagNameNode().getText())
          // Include attribute names (not values) for structure
          for (const attr of selfClose.getAttributes()) {
            parts.push(attr.getKindName())
            if (attr.getKind() === SyntaxKind.JsxAttribute) {
              const jsxAttr = attr.asKind(SyntaxKind.JsxAttribute)
              if (jsxAttr) {
                parts.push(jsxAttr.getNameNode().getText())
              }
            }
          }
        }
      }
    }
    for (const child of n.getChildren()) {
      walk(child)
    }
  }

  walk(node)
  return parts.join('|')
}

export function computeAstHash(node: Node): string {
  const structureText = extractJsxStructureText(node)
  const hash = createHash('sha256').update(structureText).digest('hex')
  // safe: substring of hex digest is always defined
  return hash.substring(0, 8)
}

export function computeStringHash(text: string): string {
  const hash = createHash('sha256').update(text).digest('hex')
  return hash.substring(0, 8)
}
