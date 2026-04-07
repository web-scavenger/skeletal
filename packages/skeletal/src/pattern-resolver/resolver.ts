import type { Project, SourceFile } from 'ts-morph'
import { SyntaxKind } from 'ts-morph'
import { ok, err, ERROR_CODES } from '../errors.js'
import type { Result, SkeletalError } from '../errors.js'
import type { ResolveResult } from './types.js'

function isExternalPackage(importPath: string): boolean {
  return !importPath.startsWith('.') && !importPath.startsWith('/')
}

function followReexport(
  sourceFile: SourceFile,
  exportedName: string,
  project: Project,
  depth: number,
): string | null {
  if (depth > 5) return null

  for (const exportDecl of sourceFile.getExportDeclarations()) {
    const moduleSpecifier = exportDecl.getModuleSpecifierValue()
    if (!moduleSpecifier) continue

    const namedExports = exportDecl.getNamedExports()
    const isReexportingTarget =
      namedExports.length === 0 ||
      namedExports.some(n => n.getName() === exportedName || n.getAliasNode()?.getText() === exportedName)

    if (!isReexportingTarget) continue

    const referencedFile = exportDecl.getModuleSpecifierSourceFile()
    if (!referencedFile) continue

    // Check if this file has the actual declaration
    const hasDeclaration =
      referencedFile.getFunction(exportedName) !== undefined ||
      referencedFile.getVariableDeclaration(exportedName) !== undefined ||
      referencedFile.getClass(exportedName) !== undefined

    if (hasDeclaration) {
      return referencedFile.getFilePath()
    }

    // Recurse
    const deeper = followReexport(referencedFile, exportedName, project, depth + 1)
    if (deeper !== null) return deeper
  }

  return null
}

export function resolveImport(
  importPath: string,
  fromFile: string,
  componentName: string,
  project: Project,
): Result<ResolveResult, SkeletalError> {
  if (isExternalPackage(importPath)) {
    return err({
      code: ERROR_CODES.IMPORT_UNRESOLVABLE,
      message: `Cannot resolve external package import: ${importPath}`,
      recoverable: true,
    })
  }

  const sourceFile = project.getSourceFile(fromFile)
  if (!sourceFile) {
    return err({
      code: ERROR_CODES.SOURCE_FILE_NOT_FOUND,
      message: `Source file not found in project: ${fromFile}`,
      recoverable: true,
    })
  }

  // Find the import declaration matching the importPath
  const importDecl = sourceFile.getImportDeclaration(
    decl => decl.getModuleSpecifierValue() === importPath,
  )

  let resolvedFile: SourceFile | undefined

  if (importDecl) {
    resolvedFile = importDecl.getModuleSpecifierSourceFile()
  }

  if (!resolvedFile) {
    return err({
      code: ERROR_CODES.IMPORT_UNRESOLVABLE,
      message: `Cannot resolve import '${importPath}' from '${fromFile}'`,
      recoverable: true,
    })
  }

  const absolutePath = resolvedFile.getFilePath()
  const isIndex = absolutePath.endsWith('/index.tsx') || absolutePath.endsWith('/index.ts')

  // Check if this is a re-export file and follow the chain
  let followedReexport = false
  if (isIndex || isReexportOnly(resolvedFile)) {
    const deeper = followReexport(resolvedFile, componentName, project, 0)
    if (deeper !== null) {
      return ok({ absolutePath: deeper, isIndex, followedReexport: true })
    }
    followedReexport = isIndex
  }

  return ok({ absolutePath, isIndex, followedReexport })
}

function isReexportOnly(sourceFile: SourceFile): boolean {
  const statements = sourceFile.getStatements()
  return statements.every(s =>
    s.getKind() === SyntaxKind.ExportDeclaration ||
    s.getKind() === SyntaxKind.ImportDeclaration,
  )
}
