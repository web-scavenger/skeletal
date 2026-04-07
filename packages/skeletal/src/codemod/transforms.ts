import type { Project } from 'ts-morph'
import { SyntaxKind } from 'ts-morph'
import { ok, err, ERROR_CODES } from '../errors.js'
import type { Result, SkeletalError } from '../errors.js'
import type { SkeletalCandidate } from '../ast-scanner/types.js'

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
  const skeletonImportPath = candidate.sourceFile.replace(/\.(tsx?|jsx?)$/, '.skeleton')

  // Idempotency: check if skeleton assignment already exists
  const alreadyHasAssignment = sourceFile.getDescendantsOfKind(SyntaxKind.ExpressionStatement)
    .some(stmt => {
      const text = stmt.getText()
      return text.includes(`${candidate.name}.skeleton`) && text.includes(skeletonName)
    })

  if (alreadyHasAssignment) {
    return ok({ alreadyApplied: true })
  }

  // Add import for skeleton
  const existingImport = sourceFile.getImportDeclaration(
    d => d.getModuleSpecifierValue().includes('.skeleton'),
  )
  if (!existingImport) {
    sourceFile.addImportDeclaration({
      namedImports: [skeletonName],
      moduleSpecifier: skeletonImportPath,
    })
  }

  // Add Component.skeleton = ComponentSkeleton after last import
  sourceFile.addStatements(`\n${candidate.name}.skeleton = ${skeletonName}`)

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
