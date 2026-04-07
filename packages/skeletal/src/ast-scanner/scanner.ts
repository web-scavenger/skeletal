import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { resolve, dirname, join, relative } from 'node:path'
import { Project, SyntaxKind } from 'ts-morph'
import type { SourceFile, Node } from 'ts-morph'
import { fromPromise } from '../errors.js'
import { ERROR_CODES } from '../errors.js'
import type { ResultAsync, SkeletalError } from '../errors.js'
import type { SkeletalConfig } from '../config/types.js'
import type { Logger } from '../logger.js'
import { computeAstHash } from './hash.js'
import { LOADING_PATTERNS, CODEMOD_ACTIONS } from './types.js'
import type { SkeletalCandidate, LoadingPattern, CodemodAction } from './types.js'

const SKELETON_HEADER_RE = /skeletal:hash:([0-9a-f]{8})/
const SKELETON_EJECTED_RE = /skeletal:ejected/

function readSkeletonFileInfo(skeletonPath: string): { hasSkeleton: boolean; isEjected: boolean } {
  if (!existsSync(skeletonPath)) {
    return { hasSkeleton: false, isEjected: false }
  }
  try {
    const content = readFileSync(skeletonPath, 'utf-8')
    const firstLines = content.split('\n').slice(0, 10).join('\n')
    const isEjected = SKELETON_EJECTED_RE.test(firstLines)
    const hasSkeleton = SKELETON_HEADER_RE.test(firstLines)
    return { hasSkeleton, isEjected }
  } catch {
    return { hasSkeleton: false, isEjected: false }
  }
}

function resolveSkeletonPath(sourceFile: string, config: SkeletalConfig): string {
  // Strip both .js (ESM import suffix) and source extensions
  const base = sourceFile.replace(/\.(js|tsx?|jsx?)$/, '')
  if (config.output === 'directory' && config.outputDir) {
    const name = base.split('/').pop() ?? base
    return resolve(config.outputDir, `${name}.skeleton.tsx`)
  }
  return `${base}.skeleton.tsx`
}

function isHtmlTag(name: string): boolean {
  return name === name.toLowerCase()
}

function walkDir(dir: string, ext: RegExp, results: string[]): void {
  let entries: string[]
  try {
    entries = readdirSync(dir)
  } catch {
    return
  }
  for (const entry of entries) {
    const full = join(dir, entry)
    try {
      const stat = statSync(full)
      if (stat.isDirectory()) {
        if (entry !== 'node_modules' && entry !== '.git' && entry !== 'dist') {
          walkDir(full, ext, results)
        }
      } else if (ext.test(entry)) {
        results.push(full)
      }
    } catch {
      // skip
    }
  }
}

function globPattern(pattern: string, projectRoot: string): string[] {
  // Simple glob: support src/**/*.tsx patterns
  const parts = pattern.split('/')
  // Find the first part with a wildcard
  const staticParts: string[] = []
  for (const part of parts) {
    if (part.includes('*')) break
    staticParts.push(part)
  }
  const baseDir = resolve(projectRoot, ...staticParts)
  const extMatch = pattern.match(/\*\.(\w+)$/)
  const ext = extMatch ? new RegExp(`\\.${extMatch[1]}$`) : /\.tsx?$/
  const results: string[] = []
  walkDir(baseDir, ext, results)
  return results
}

function getSourceFiles(config: SkeletalConfig, projectRoot: string): string[] {
  const files: string[] = []
  for (const pattern of config.include) {
    const found = globPattern(pattern, projectRoot)
    for (const file of found) {
      const rel = relative(projectRoot, file)
      const excluded = config.exclude.some(excl => {
        const re = new RegExp(
          excl.replace(/\./g, '\\.').replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'),
        )
        return re.test(rel)
      })
      if (!excluded && !file.includes('.skeleton.')) {
        files.push(file)
      }
    }
  }
  return [...new Set(files)]
}

function findFunctionDeclaration(
  sourceFile: SourceFile,
  name: string,
): { isAsync: boolean } | null {
  // Check function declarations
  const fn = sourceFile.getFunction(name)
  if (fn) {
    return { isAsync: fn.isAsync() }
  }

  // Check variable declarations (const X = () => ...)
  const varDecl = sourceFile.getVariableDeclaration(name)
  if (varDecl) {
    const initializer = varDecl.getInitializer()
    if (initializer) {
      const kind = initializer.getKind()
      if (
        kind === SyntaxKind.ArrowFunction ||
        kind === SyntaxKind.FunctionExpression
      ) {
        const arrowFn = initializer.asKind(SyntaxKind.ArrowFunction)
        const fnExpr = initializer.asKind(SyntaxKind.FunctionExpression)
        const isAsync = arrowFn?.isAsync() ?? fnExpr?.isAsync() ?? false
        return { isAsync }
      }
    }
  }

  return null
}

function findLazyCandidates(sourceFile: SourceFile): {
  componentName: string
  importPath: string
  usageFile: string
}[] {
  const results: { componentName: string; importPath: string; usageFile: string }[] = []

  sourceFile.forEachDescendant(node => {
    if (node.getKind() !== SyntaxKind.CallExpression) return

    const callExpr = node.asKind(SyntaxKind.CallExpression)
    if (!callExpr) return

    const expr = callExpr.getExpression()
    const exprText = expr.getText()

    if (exprText !== 'React.lazy' && exprText !== 'lazy' && exprText !== 'lazyWithSkeleton') return

    // Must be inside a SkeletonWrapper context or variable declaration
    const args = callExpr.getArguments()
    if (args.length === 0 || args[0] === undefined) return

    const arg = args[0]
    if (
      arg.getKind() !== SyntaxKind.ArrowFunction &&
      arg.getKind() !== SyntaxKind.FunctionExpression
    ) return

    // Find the import() call inside
    let importPath: string | null = null
    arg.forEachDescendant(n => {
      if (n.getKind() === SyntaxKind.CallExpression) {
        const inner = n.asKind(SyntaxKind.CallExpression)
        if (inner?.getExpression().getKind() === SyntaxKind.ImportKeyword) {
          const innerArgs = inner.getArguments()
          if (innerArgs.length > 0 && innerArgs[0] !== undefined) {
            const lit = innerArgs[0].asKind(SyntaxKind.StringLiteral)
            if (lit) {
              importPath = lit.getLiteralValue()
            }
          }
        }
      }
    })

    if (!importPath) return

    // Find the variable this is assigned to
    let componentName = 'Unknown'
    const parent = callExpr.getParent()
    if (parent?.getKind() === SyntaxKind.VariableDeclaration) {
      const varDecl = parent.asKind(SyntaxKind.VariableDeclaration)
      componentName = varDecl?.getName() ?? 'Unknown'
    }

    results.push({
      componentName,
      importPath,
      usageFile: sourceFile.getFilePath(),
    })
  })

  return results
}

function findDynamicCandidates(sourceFile: SourceFile): {
  componentName: string
  importPath: string
  usageFile: string
}[] {
  // Check if 'dynamic' or 'dynamicWithSkeleton' is imported
  const hasDynamicImport = sourceFile.getImportDeclarations().some(
    decl =>
      decl.getModuleSpecifierValue() === 'next/dynamic' ||
      decl.getModuleSpecifierValue() === 'skeletal/next',
  )
  if (!hasDynamicImport) return []

  const results: { componentName: string; importPath: string; usageFile: string }[] = []

  sourceFile.forEachDescendant(node => {
    if (node.getKind() !== SyntaxKind.CallExpression) return

    const callExpr = node.asKind(SyntaxKind.CallExpression)
    if (!callExpr) return

    const exprText = callExpr.getExpression().getText()
    if (exprText !== 'dynamic' && exprText !== 'dynamicWithSkeleton') return

    const args = callExpr.getArguments()
    if (args.length === 0 || args[0] === undefined) return

    const arg = args[0]
    if (
      arg.getKind() !== SyntaxKind.ArrowFunction &&
      arg.getKind() !== SyntaxKind.FunctionExpression
    ) return

    let importPath: string | null = null
    arg.forEachDescendant(n => {
      if (n.getKind() === SyntaxKind.CallExpression) {
        const inner = n.asKind(SyntaxKind.CallExpression)
        if (inner?.getExpression().getKind() === SyntaxKind.ImportKeyword) {
          const innerArgs = inner.getArguments()
          if (innerArgs.length > 0 && innerArgs[0] !== undefined) {
            const lit = innerArgs[0].asKind(SyntaxKind.StringLiteral)
            if (lit) {
              importPath = lit.getLiteralValue()
            }
          }
        }
      }
    })

    if (!importPath) return

    let componentName = 'Unknown'
    const parent = callExpr.getParent()
    if (parent?.getKind() === SyntaxKind.VariableDeclaration) {
      const varDecl = parent.asKind(SyntaxKind.VariableDeclaration)
      componentName = varDecl?.getName() ?? 'Unknown'
    }

    results.push({
      componentName,
      importPath,
      usageFile: sourceFile.getFilePath(),
    })
  })

  return results
}

function findSkeletonWrapperCandidates(
  sourceFile: SourceFile,
  project: Project,
  config: SkeletalConfig,
  logger: Logger,
): SkeletalCandidate[] {
  const candidates: SkeletalCandidate[] = []

  sourceFile.forEachDescendant(node => {
    if (node.getKind() !== SyntaxKind.JsxOpeningElement) return

    const opening = node.asKind(SyntaxKind.JsxOpeningElement)
    if (!opening) return
    if (opening.getTagNameNode().getText() !== 'SkeletonWrapper') return

    const jsxElement = opening.getParent()
    if (!jsxElement || jsxElement.getKind() !== SyntaxKind.JsxElement) return

    const jsxEl = jsxElement.asKind(SyntaxKind.JsxElement)
    if (!jsxEl) return

    // Find the first meaningful child JSX element
    const children = jsxEl.getJsxChildren()
    const firstChildEl = children.find(
      c => c.getKind() === SyntaxKind.JsxElement || c.getKind() === SyntaxKind.JsxSelfClosingElement,
    )

    if (!firstChildEl) return

    let childTagName: string
    if (firstChildEl.getKind() === SyntaxKind.JsxElement) {
      const child = firstChildEl.asKind(SyntaxKind.JsxElement)
      childTagName = child?.getOpeningElement().getTagNameNode().getText() ?? ''
    } else {
      const child = firstChildEl.asKind(SyntaxKind.JsxSelfClosingElement)
      childTagName = child?.getTagNameNode().getText() ?? ''
    }

    if (!childTagName || isHtmlTag(childTagName)) return

    // Resolve the component import
    const importDecl = sourceFile.getImportDeclaration(
      decl => {
        const named = decl.getNamedImports()
        const defaultImport = decl.getDefaultImport()
        return (
          named.some(n => n.getName() === childTagName || n.getAliasNode()?.getText() === childTagName) ||
          defaultImport?.getText() === childTagName
        )
      },
    )

    if (!importDecl) {
      logger.debug(`Cannot find import for ${childTagName} in ${sourceFile.getFilePath()}`)
      return
    }

    const childSourceFile = importDecl.getModuleSpecifierSourceFile()
    if (!childSourceFile) {
      logger.debug(`Cannot resolve source file for ${childTagName}`)
      return
    }

    // Check if the child variable is a React.lazy call
    const childVar = childSourceFile.getVariableDeclaration(childTagName)
    if (childVar) {
      const init = childVar.getInitializer()
      if (init) {
        const initText = init.getText()
        if (initText.startsWith('React.lazy(') || initText.startsWith('lazy(') || initText.startsWith('lazyWithSkeleton(')) {
          // This is a lazy component — handled by lazy scanner
          return
        }
      }
    }

    const fnInfo = findFunctionDeclaration(childSourceFile, childTagName)
    if (!fnInfo) {
      logger.debug(`Cannot find function declaration for ${childTagName}`)
      return
    }

    let pattern: LoadingPattern
    let codemod: CodemodAction

    if (fnInfo.isAsync) {
      pattern = LOADING_PATTERNS.RSC
      codemod = CODEMOD_ACTIONS.WRAP_WITH_SKELETON_WRAPPER
    } else {
      if (!config.csr.enabled) return
      pattern = LOADING_PATTERNS.CSR
      codemod = CODEMOD_ACTIONS.WRAP_WITH_SKELETON_WRAPPER
    }

    const skeletonPath = resolveSkeletonPath(childSourceFile.getFilePath(), config)
    const { hasSkeleton, isEjected } = readSkeletonFileInfo(skeletonPath)

    // Compute AST hash of the child source function
    const fn = childSourceFile.getFunction(childTagName)
    const hashNode: Node = fn ?? childSourceFile
    const astHash = computeAstHash(hashNode)

    candidates.push({
      name: childTagName,
      sourceFile: childSourceFile.getFilePath(),
      usageFile: sourceFile.getFilePath(),
      pattern,
      codemod,
      hasSkeleton,
      isEjected,
      astHash,
    })
  })

  return candidates
}

export function scanCandidates(
  config: SkeletalConfig,
  projectRoot: string,
  logger: Logger,
): ResultAsync<SkeletalCandidate[], SkeletalError> {
  return fromPromise(
    (async () => {
      const tsconfigPath = resolve(projectRoot, 'tsconfig.json')
      const project = new Project({
        tsConfigFilePath: existsSync(tsconfigPath) ? tsconfigPath : undefined,
        skipAddingFilesFromTsConfig: true,
      })

      const files = getSourceFiles(config, projectRoot)
      logger.debug(`Scanning ${files.length} files...`)

      for (const file of files) {
        if (!project.getSourceFile(file)) {
          project.addSourceFileAtPath(file)
        }
      }

      const candidates: SkeletalCandidate[] = []
      const seen = new Set<string>()

      for (const file of files) {
        const sourceFile = project.getSourceFile(file)
        if (!sourceFile) continue

        // RSC + CSR: SkeletonWrapper scan
        const wrapperCandidates = findSkeletonWrapperCandidates(sourceFile, project, config, logger)
        for (const c of wrapperCandidates) {
          const key = `${c.name}:${c.sourceFile}`
          if (!seen.has(key)) {
            seen.add(key)
            candidates.push(c)
          }
        }

        // Lazy pattern
        if (config.lazy.enabled) {
          const lazyCandidates = findLazyCandidates(sourceFile)
          for (const lc of lazyCandidates) {
            const key = `${lc.componentName}:lazy`
            if (seen.has(key)) continue
            seen.add(key)

            const importPath = lc.importPath
            const fromDir = dirname(file)
            const importDecl = sourceFile.getImportDeclaration(
              d => d.getModuleSpecifierValue() === importPath,
            )
            const resolvedSF = importDecl?.getModuleSpecifierSourceFile()
            // Strip any extension from importPath before adding .tsx (handles .js ESM suffix)
            const importBase = importPath.replace(/\.(js|tsx?|jsx?)$/, '')
            const absSourceFile = resolvedSF?.getFilePath() ?? resolve(fromDir, `${importBase}.tsx`)

            const skeletonPath = resolveSkeletonPath(absSourceFile, config)
            const { hasSkeleton, isEjected } = readSkeletonFileInfo(skeletonPath)
            // Prefer resolved source file; fall back to loading from disk if it exists
            let hashSF = resolvedSF
            let createdTmp = false
            if (!hashSF && existsSync(absSourceFile)) {
              hashSF = project.addSourceFileAtPath(absSourceFile)
            } else if (!hashSF) {
              hashSF = project.createSourceFile(`__tmp_${lc.componentName}.ts`, '')
              createdTmp = true
            }
            const astHash = computeAstHash(hashSF)
            if (createdTmp) {
              project.removeSourceFile(hashSF)
            }

            candidates.push({
              name: lc.componentName,
              sourceFile: absSourceFile,
              usageFile: lc.usageFile,
              pattern: LOADING_PATTERNS.LAZY,
              codemod: CODEMOD_ACTIONS.LAZY_TO_LAZY_WITH,
              hasSkeleton,
              isEjected,
              astHash,
            })
          }
        }

        // Dynamic pattern (next/dynamic)
        if (config.dynamic.enabled) {
          const dynamicCandidates = findDynamicCandidates(sourceFile)
          for (const dc of dynamicCandidates) {
            const key = `${dc.componentName}:dynamic`
            if (seen.has(key)) continue
            seen.add(key)

            const importPath = dc.importPath
            const fromDir = dirname(file)
            const importDecl = sourceFile.getImportDeclaration(
              d => d.getModuleSpecifierValue() === importPath,
            )
            const resolvedSF = importDecl?.getModuleSpecifierSourceFile()
            const importBase = importPath.replace(/\.(js|tsx?|jsx?)$/, '')
            const absSourceFile = resolvedSF?.getFilePath() ?? resolve(fromDir, `${importBase}.tsx`)

            const skeletonPath = resolveSkeletonPath(absSourceFile, config)
            const { hasSkeleton, isEjected } = readSkeletonFileInfo(skeletonPath)
            let dynHashSF = resolvedSF
            let dynCreatedTmp = false
            if (!dynHashSF && existsSync(absSourceFile)) {
              dynHashSF = project.addSourceFileAtPath(absSourceFile)
            } else if (!dynHashSF) {
              dynHashSF = project.createSourceFile(`__tmp_dyn_${dc.componentName}.ts`, '')
              dynCreatedTmp = true
            }
            const astHash = computeAstHash(dynHashSF)
            if (dynCreatedTmp) {
              project.removeSourceFile(dynHashSF)
            }

            candidates.push({
              name: dc.componentName,
              sourceFile: absSourceFile,
              usageFile: dc.usageFile,
              pattern: LOADING_PATTERNS.DYNAMIC,
              codemod: CODEMOD_ACTIONS.DYNAMIC_TO_DYNAMIC_WITH,
              hasSkeleton,
              isEjected,
              astHash,
            })
          }
        }
      }

      logger.debug(`Found ${candidates.length} skeleton candidates`)
      return candidates
    })(),
    (cause): SkeletalError => ({
      code: ERROR_CODES.SOURCE_FILE_NOT_FOUND,
      message: `AST scan failed: ${cause instanceof Error ? cause.message : String(cause)}`,
      cause,
      recoverable: false,
    }),
  )
}
