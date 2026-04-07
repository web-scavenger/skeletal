import { describe, expect, it } from 'vitest'

// Most check functionality requires actual file system access.
// These tests verify the module is importable and types are correct.

describe('check module', () => {
  it('exports runCheck function', async () => {
    const { runCheck } = await import('../check.js')
    expect(typeof runCheck).toBe('function')
  })
})
