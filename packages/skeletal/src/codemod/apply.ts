import { writeFileSync } from 'node:fs'
import type { Project } from 'ts-morph'
import { okAsync, errAsync } from '../errors.js'
import type { ResultAsync, SkeletalError } from '../errors.js'
import type { SkeletalCandidate } from '../ast-scanner/types.js'
import { CODEMOD_ACTIONS } from '../ast-scanner/types.js'
import type { Logger } from '../logger.js'
import {
  applyWrapWithSkeletonWrapper,
  applyLazyToLazyWith,
  applyDynamicToDynamicWith,
} from './transforms.js'
import type { CodemodResult } from './types.js'

export function applyCodemod(
  candidate: SkeletalCandidate,
  project: Project,
  logger: Logger,
): ResultAsync<CodemodResult, SkeletalError> {
  const { codemod, usageFile, name } = candidate

  let transformResult: ReturnType<typeof applyWrapWithSkeletonWrapper>

  switch (codemod) {
  case CODEMOD_ACTIONS.WRAP_WITH_SKELETON_WRAPPER:
    transformResult = applyWrapWithSkeletonWrapper(candidate, project)
    break
  case CODEMOD_ACTIONS.LAZY_TO_LAZY_WITH:
    transformResult = applyLazyToLazyWith(candidate, project)
    break
  case CODEMOD_ACTIONS.DYNAMIC_TO_DYNAMIC_WITH:
    transformResult = applyDynamicToDynamicWith(candidate, project)
    break
  default:
    logger.warn(`Unknown codemod action: ${codemod as string}`)
    return okAsync({
      applied: false,
      alreadyApplied: false,
      filePath: usageFile,
      transform: codemod,
      diff: null,
    })
  }

  if (transformResult.isErr()) {
    logger.warn(`Codemod failed for ${name} in ${usageFile}: ${transformResult.error.message}`)
    return errAsync(transformResult.error)
  }

  const { alreadyApplied } = transformResult.value

  if (alreadyApplied) {
    logger.debug(`Codemod already applied for ${name} in ${usageFile}`)
    return okAsync({
      applied: false,
      alreadyApplied: true,
      filePath: usageFile,
      transform: codemod,
      diff: null,
    })
  }

  // Save modified file
  const sourceFile = project.getSourceFile(usageFile)
  if (!sourceFile) {
    return okAsync({
      applied: false,
      alreadyApplied: false,
      filePath: usageFile,
      transform: codemod,
      diff: null,
    })
  }

  try {
    const newContent = sourceFile.getFullText()
    writeFileSync(usageFile, newContent, 'utf-8')
    logger.debug(`Applied ${codemod} codemod to ${usageFile}`)

    return okAsync({
      applied: true,
      alreadyApplied: false,
      filePath: usageFile,
      transform: codemod,
      diff: null,
    })
  } catch (e) {
    return errAsync({
      code: 'FILE_WRITE_FAILED' as const,
      message: `Failed to write codemod result to ${usageFile}: ${e instanceof Error ? e.message : String(e)}`,
      cause: e,
      recoverable: true,
    })
  }
}
