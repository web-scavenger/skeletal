export const ERROR_CODES = {
  CONFIG_NOT_FOUND: 'CONFIG_NOT_FOUND',
  CONFIG_INVALID: 'CONFIG_INVALID',
  DEV_SERVER_UNREACHABLE: 'DEV_SERVER_UNREACHABLE',
  SOURCE_FILE_NOT_FOUND: 'SOURCE_FILE_NOT_FOUND',
  IMPORT_UNRESOLVABLE: 'IMPORT_UNRESOLVABLE',
  PLAYWRIGHT_LAUNCH_FAILED: 'PLAYWRIGHT_LAUNCH_FAILED',
  PLAYWRIGHT_TIMEOUT: 'PLAYWRIGHT_TIMEOUT',
  CODEGEN_INVALID_OUTPUT: 'CODEGEN_INVALID_OUTPUT',
  CODEMOD_FAILED: 'CODEMOD_FAILED',
  FILE_WRITE_FAILED: 'FILE_WRITE_FAILED',
} as const

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES]

export interface SkeletalError {
  code: ErrorCode
  message: string
  cause?: unknown
  recoverable: boolean
}

export type { Result, ResultAsync } from 'neverthrow'
export { ok, err, okAsync, errAsync, fromPromise, fromSafePromise } from 'neverthrow'
