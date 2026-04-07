import { Project, SyntaxKind } from 'ts-morph'
import type { JsxOpeningElement, JsxSelfClosingElement } from 'ts-morph'
import type { SkeletalCandidate } from '../ast-scanner/types.js'

function addDataSkAttribute(
  element: JsxOpeningElement | JsxSelfClosingElement,
  componentName: string,
): void {
  const existingAttr = element.getAttribute('data-sk')
  if (existingAttr) return

  const attrText = `data-sk="${componentName}"`
  element.addAttribute({ name: 'data-sk', initializer: `"${componentName}"` })
  // Fallback: if addAttribute is not available, use raw text manipulation
  void attrText
}

export function injectDataSk(
  source: string,
  filePath: string,
  candidates: SkeletalCandidate[],
): string {
  const matchingCandidates = candidates.filter(c => c.sourceFile === filePath)
  if (matchingCandidates.length === 0) return source

  const project = new Project({
    useInMemoryFileSystem: true,
    compilerOptions: {
      jsx: 4 /* ReactJSX */,
    },
  })

  const sourceFile = project.createSourceFile(filePath, source)

  for (const candidate of matchingCandidates) {
    const { name } = candidate

    // Find the function/component declaration
    const fn = sourceFile.getFunction(name)
    const varDecl = sourceFile.getVariableDeclaration(name)
    const arrowFn = varDecl?.getInitializer()?.asKind(SyntaxKind.ArrowFunction)
    const fnExpr = varDecl?.getInitializer()?.asKind(SyntaxKind.FunctionExpression)

    const body = fn?.getBody() ?? arrowFn?.getBody() ?? fnExpr?.getBody()
    if (!body) continue

    // Find return statements — take the first non-null return
    let injected = false
    body.forEachDescendant(node => {
      if (injected) return
      if (node.getKind() !== SyntaxKind.ReturnStatement) return

      const returnStmt = node.asKind(SyntaxKind.ReturnStatement)
      if (!returnStmt) return

      const expr = returnStmt.getExpression()
      if (!expr) return

      // Find the root JSX element
      let rootJsx: JsxOpeningElement | JsxSelfClosingElement | null = null

      if (expr.getKind() === SyntaxKind.JsxElement) {
        rootJsx = expr.asKind(SyntaxKind.JsxElement)?.getOpeningElement() ?? null
      } else if (expr.getKind() === SyntaxKind.JsxSelfClosingElement) {
        rootJsx = expr.asKind(SyntaxKind.JsxSelfClosingElement) ?? null
      } else if (expr.getKind() === SyntaxKind.ParenthesizedExpression) {
        const inner = expr.asKind(SyntaxKind.ParenthesizedExpression)?.getExpression()
        if (inner?.getKind() === SyntaxKind.JsxElement) {
          rootJsx = inner.asKind(SyntaxKind.JsxElement)?.getOpeningElement() ?? null
        } else if (inner?.getKind() === SyntaxKind.JsxSelfClosingElement) {
          rootJsx = inner.asKind(SyntaxKind.JsxSelfClosingElement) ?? null
        }
      }

      if (!rootJsx) return

      try {
        addDataSkAttribute(rootJsx, name)
        injected = true
      } catch {
        // If addAttribute fails, we'll use text replacement below
      }
    })
  }

  return sourceFile.getFullText()
}
