export interface CodemodResult {
  applied: boolean
  alreadyApplied: boolean
  filePath: string
  transform: string
  diff: string | null
}
