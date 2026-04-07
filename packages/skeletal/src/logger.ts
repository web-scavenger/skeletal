import * as clack from '@clack/prompts'

export interface Logger {
  info(msg: string): void
  warn(msg: string): void
  error(msg: string): void
  debug(msg: string): void
  success(msg: string): void
  step(msg: string): void
  done(msg: string): void
}

export function createLogger(verbose: boolean): Logger {
  return {
    info(msg) {
      clack.log.info(msg)
    },
    warn(msg) {
      clack.log.warn(msg)
    },
    error(msg) {
      clack.log.error(msg)
    },
    debug(msg) {
      if (verbose) {
        clack.log.message(msg)
      }
    },
    success(msg) {
      clack.log.success(msg)
    },
    step(msg) {
      clack.log.step(msg)
    },
    done(msg) {
      clack.outro(msg)
    },
  }
}

export function createTestLogger(): Logger & { lines: string[] } {
  const lines: string[] = []

  const capture = (prefix: string) => (msg: string) => {
    lines.push(`[${prefix}] ${msg}`)
  }

  return {
    lines,
    info: capture('info'),
    warn: capture('warn'),
    error: capture('error'),
    debug: capture('debug'),
    success: capture('success'),
    step: capture('step'),
    done: capture('done'),
  }
}
