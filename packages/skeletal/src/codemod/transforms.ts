import { relative, dirname } from 'node:path'
import type { Project, JsxOpeningElement } from 'ts-morph'
import { SyntaxKind } from 'ts-morph'
import { ok, err, ERROR_CODES } from '../errors.js'
import type { Result, SkeletalError } from '../errors.js'
import type { SkeletalCandidate } from '../ast-scanner/types.js'

function toRelativeImport(fromFile: string, toFile: string): string {
  const rel = relative(dirname(fromFile), toFile.replace(/\.(js|tsx?|jsx?)$/, ''))
  // Ensure it starts with ./ or ../
  return rel.startsWith('.') ? rel : `./${rel}`
}

export function applyWrapWithSkeletonWrapper(
  candidate: SkeletalCandidate,
  project: Project,
): Result<{ alreadyApplied: boolean }, SkeletalError> {
  const sourceFile = project.getSourceFile(candidate.usageFile)
  if (!sourceFile) {
    return err({
      code: ERROR_CODES.CODEMOD_FAILED,
      message: `Cannot find usage file: ${candidate.usageFile}`,
      recoverable: true,
    })
  }

  const skeletonName = `${candidate.name}Skeleton`
  const skeletonSourcePath = candidate.sourceFile.replace(/\.(js|tsx?|jsx?)$/, '') + '.skeleton.tsx'
  const skeletonImportPath = toRelativeImport(candidate.usageFile, skeletonSourcePath)

  // Find the <SkeletonWrapper> that directly wraps this component
  let wrapperToUpdate: JsxOpeningElement | undefined

  for (const opening of sourceFile.getDescendantsOfKind(SyntaxKind.JsxOpeningElement)) {
    if (opening.getTagNameNode().getText() !== 'SkeletonWrapper') continue

    const jsxEl = opening.getParent()?.asKind(SyntaxKind.JsxElement)
    if (!jsxEl) continue

    // Check this wrapper directly contains our component
    const containsComponent = jsxEl.getJsxChildren().some(child => {
      const tag =
        child.asKind(SyntaxKind.JsxElement)?.getOpeningElement().getTagNameNode().getText() ??
        child.asKind(SyntaxKind.JsxSelfClosingElement)?.getTagNameNode().getText()
      return tag === candidate.name
    })
    if (!containsComponent) continue

    // Idempotency: fallback prop already references this skeleton
    const alreadyHasFallback = opening.getAttributes().some(attr => {
      const jsxAttr = attr.asKind(SyntaxKind.JsxAttribute)
      return (
        jsxAttr?.getNameNode().getText() === 'fallback' &&
        (jsxAttr.getInitializer()?.getText().includes(skeletonName) ?? false)
      )
    })
    if (alreadyHasFallback) return ok({ alreadyApplied: true })

    wrapperToUpdate = opening
    break
  }

  if (!wrapperToUpdate) {
    return ok({ alreadyApplied: true })
  }

  // Add skeleton import if not already present
  const alreadyImported = sourceFile.getImportDeclarations().some(d =>
    d.getNamedImports().some(n => n.getName() === skeletonName),
  )
  if (!alreadyImported) {
    sourceFile.addImportDeclaration({
      namedImports: [skeletonName],
      moduleSpecifier: skeletonImportPath,
    })
  }

  // Add fallback={<SkeletonName />} to the SkeletonWrapper opening element
  wrapperToUpdate.addAttribute({
    name: 'fallback',
    initializer: `{<${skeletonName} />}`,
  })

  return ok({ alreadyApplied: false })
}

export function applyLazyToLazyWith(
  candidate: SkeletalCandidate,
  project: Project,
): Result<{ alreadyApplied: boolean }, SkeletalError> {
  const sourceFile = project.getSourceFile(candidate.usageFile)
  if (!sourceFile) {
    return err({
      code: ERROR_CODES.CODEMOD_FAILED,
      message: `Cannot find usage file: ${candidate.usageFile}`,
      recoverable: true,
    })
  }

  // Idempotency: check if lazyWithSkeleton already imported
  const hasLazyWithSkeleton = sourceFile.getImportDeclaration(
    d => d.getModuleSpecifierValue() === 'skeletal-ui',
  )?.getNamedImports().some(n => n.getName() === 'lazyWithSkeleton') ?? false

  if (hasLazyWithSkeleton) {
    return ok({ alreadyApplied: true })
  }

  // Add lazyWithSkeleton import
  const existingSkeletalImport = sourceFile.getImportDeclaration(
    d => d.getModuleSpecifierValue() === 'skeletal-ui',
  )
  if (existingSkeletalImport) {
    existingSkeletalImport.addNamedImport('lazyWithSkeleton')
  } else {
    sourceFile.addImportDeclaration({
      namedImports: ['lazyWithSkeleton'],
      moduleSpecifier: 'skeletal-ui',
    })
  }

  // Replace React.lazy() → lazyWithSkeleton()
  sourceFile.forEachDescendant(node => {
    if (node.getKind() !== SyntaxKind.CallExpression) return
    const callExpr = node.asKind(SyntaxKind.CallExpression)
    if (!callExpr) return
    const exprText = callExpr.getExpression().getText()
    if (exprText !== 'React.lazy' && exprText !== 'lazy') return
    callExpr.getExpression().replaceWithText('lazyWithSkeleton')
  })

  return ok({ alreadyApplied: false })
}

export function applyDynamicToDynamicWith(
  candidate: SkeletalCandidate,
  project: Project,
): Result<{ alreadyApplied: boolean }, SkeletalError> {
  const sourceFile = project.getSourceFile(candidate.usageFile)
  if (!sourceFile) {
    return err({
      code: ERROR_CODES.CODEMOD_FAILED,
      message: `Cannot find usage file: ${candidate.usageFile}`,
      recoverable: true,
    })
  }

  // Idempotency check
  const hasDynamicWithSkeleton = sourceFile.getImportDeclaration(
    d => d.getModuleSpecifierValue() === 'skeletal-ui/next',
  )?.getNamedImports().some(n => n.getName() === 'dynamicWithSkeleton') ?? false

  if (hasDynamicWithSkeleton) {
    return ok({ alreadyApplied: true })
  }

  // Add dynamicWithSkeleton import
  sourceFile.addImportDeclaration({
    namedImports: ['dynamicWithSkeleton'],
    moduleSpecifier: 'skeletal-ui/next',
  })

  // Replace dynamic() → dynamicWithSkeleton()
  sourceFile.forEachDescendant(node => {
    if (node.getKind() !== SyntaxKind.CallExpression) return
    const callExpr = node.asKind(SyntaxKind.CallExpression)
    if (!callExpr) return
    if (callExpr.getExpression().getText() !== 'dynamic') return
    callExpr.getExpression().replaceWithText('dynamicWithSkeleton')
  })

  // Remove the now-unused `import dynamic from 'next/dynamic'`
  sourceFile.getImportDeclaration(
    d => d.getModuleSpecifierValue() === 'next/dynamic',
  )?.remove()

  return ok({ alreadyApplied: false })
}
