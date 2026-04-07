import { describe, expect, it } from 'vitest'
import { validateConfig } from '../loader.js'

describe('validateConfig', () => {
  it('accepts a valid minimal config', () => {
    const result = validateConfig({ devServer: 'http://localhost:3000' })
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.devServer).toBe('http://localhost:3000')
      expect(result.value.output).toBe('colocated')
      expect(result.value.animation).toBe('shimmer')
      expect(result.value.radius).toBe(6)
      expect(result.value.breakpoints).toEqual([375, 768, 1280])
      expect(result.value.autoWire).toBe(true)
    }
  })

  it('applies defaults for csr, lazy, dynamic', () => {
    const result = validateConfig({ devServer: 'http://localhost:3000' })
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.csr.enabled).toBe(true)
      expect(result.value.lazy.enabled).toBe(true)
      expect(result.value.dynamic.enabled).toBe(true)
      expect(result.value.dynamic.detectStandalone).toBe(true)
    }
  })

  it('returns CONFIG_INVALID when devServer is missing', () => {
    const result = validateConfig({})
    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error.code).toBe('CONFIG_INVALID')
    }
  })

  it('returns CONFIG_INVALID for invalid devServer URL', () => {
    const result = validateConfig({ devServer: 'not-a-url' })
    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error.code).toBe('CONFIG_INVALID')
    }
  })

  it('accepts custom output directory config', () => {
    const result = validateConfig({
      devServer: 'http://localhost:3000',
      output: 'directory',
      outputDir: 'src/skeletons',
    })
    expect(result.isOk()).toBe(true)
  })

  it('rejects unknown animation type', () => {
    const result = validateConfig({
      devServer: 'http://localhost:3000',
      animation: 'bounce',
    })
    expect(result.isErr()).toBe(true)
  })
})
