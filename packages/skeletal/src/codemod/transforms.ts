import { relative, dirname } from 'node:path'
import type { Project } from 'ts-morph'
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

  // Idempotency: check if skeleton assignment already exists
  const alreadyHasAssignment = sourceFile.getDescendantsOfKind(SyntaxKind.ExpressionStatement)
    .some(stmt => {
      const text = stmt.getText()
      return (
        (text.includes(`${candidate.name}.skeleton`) || text.includes(`Object.assign(${candidate.name}`)) &&
        text.includes(skeletonName)
      )
    })

  if (alreadyHasAssignment) {
    return ok({ alreadyApplied: true })
  }

  // Add import for this specific skeleton (check by named import, not path)
  const alreadyImported = sourceFile.getImportDeclarations().some(d =>
    d.getNamedImports().some(n => n.getName() === skeletonName),
  )
  if (!alreadyImported) {
    sourceFile.addImportDeclaration({
      namedImports: [skeletonName],
      moduleSpecifier: skeletonImportPath,
    })
  }

  // Use Object.assign to attach skeleton — avoids TypeScript "Property does not exist" errors
  sourceFile.addStatements(`\nObject.assign(${candidate.name}, { skeleton: ${skeletonName} })`)

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
    d => d.getModuleSpecifierValue() === 'skeletal',
  )?.getNamedImports().some(n => n.getName() === 'lazyWithSkeleton') ?? false

  if (hasLazyWithSkeleton) {
    return ok({ alreadyApplied: true })
  }

  // Add lazyWithSkeleton import
  const existingSkeletalImport = sourceFile.getImportDeclaration(
    d => d.getModuleSpecifierValue() === 'skeletal',
  )
  if (existingSkeletalImport) {
    existingSkeletalImport.addNamedImport('lazyWithSkeleton')
  } else {
    sourceFile.addImportDeclaration({
      namedImports: ['lazyWithSkeleton'],
      moduleSpecifier: 'skeletal',
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
    d => d.getModuleSpecifierValue() === 'skeletal/next',
  )?.getNamedImports().some(n => n.getName() === 'dynamicWithSkeleton') ?? false

  if (hasDynamicWithSkeleton) {
    return ok({ alreadyApplied: true })
  }

  // Add dynamicWithSkeleton import
  sourceFile.addImportDeclaration({
    namedImports: ['dynamicWithSkeleton'],
    moduleSpecifier: 'skeletal/next',
  })

  // Replace dynamic() → dynamicWithSkeleton()
  sourceFile.forEachDescendant(node => {
    if (node.getKind() !== SyntaxKind.CallExpression) return
    const callExpr = node.asKind(SyntaxKind.CallExpression)
    if (!callExpr) return
    if (callExpr.getExpression().getText() !== 'dynamic') return
    callExpr.getExpression().replaceWithText('dynamicWithSkeleton')
  })

  return ok({ alreadyApplied: false })
}
