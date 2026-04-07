import { describe, expect, it } from 'vitest'
import { classify } from '../classifier.js'
import type { ExtractedGeometry } from '../../playwright-crawler/types.js'

const makeGeometry = (
  overrides: Partial<ExtractedGeometry> = {},
): ExtractedGeometry => ({
  componentName: 'TestComponent',
  pattern: 'rsc',
  breakpoint: 1280,
  boundingBox: { x: 0, y: 0, width: 600, height: 200 },
  children: [],
  timedOut: false,
  ...overrides,
})

describe('classify', () => {
  it('returns a card fallback for timed-out geometry', () => {
    const result = classify(makeGeometry({ timedOut: true }))
    expect(result).toHaveLength(1)
    expect(result[0]?.primitiveType).toBe('Card')
  })

  it('returns card fallback for empty children', () => {
    const result = classify(makeGeometry({ children: [] }))
    expect(result).toHaveLength(1)
    expect(result[0]?.primitiveType).toBe('Card')
  })

  it('classifies img element as Image', () => {
    const result = classify(makeGeometry({
      children: [{
        tagName: 'img',
        role: null,
        dataSkType: null,
        boundingBox: { x: 0, y: 0, width: 300, height: 200 },
        computedStyles: { borderRadius: '0px', aspectRatio: '3/2' },
        children: [],
      }],
    }))
    expect(result[0]?.primitiveType).toBe('Image')
  })

  it('classifies h2 as Heading', () => {
    const result = classify(makeGeometry({
      children: [{
        tagName: 'h2',
        role: null,
        dataSkType: null,
        boundingBox: { x: 0, y: 0, width: 300, height: 28 },
        computedStyles: { borderRadius: '0px', aspectRatio: 'auto' },
        children: [],
      }],
    }))
    expect(result[0]?.primitiveType).toBe('Heading')
  })

  it('classifies p as Text with lines', () => {
    const result = classify(makeGeometry({
      children: [{
        tagName: 'p',
        role: null,
        dataSkType: null,
        boundingBox: { x: 0, y: 0, width: 400, height: 60 },
        computedStyles: { borderRadius: '0px', aspectRatio: 'auto' },
        children: [],
      }],
    }))
    expect(result[0]?.primitiveType).toBe('Text')
    expect(result[0]?.props['lines']).toBeGreaterThan(1)
  })

  it('classifies circular small element as Avatar', () => {
    const result = classify(makeGeometry({
      children: [{
        tagName: 'div',
        role: null,
        dataSkType: null,
        boundingBox: { x: 0, y: 0, width: 40, height: 40 },
        computedStyles: { borderRadius: '50%', aspectRatio: '1' },
        children: [],
      }],
    }))
    expect(result[0]?.primitiveType).toBe('Avatar')
  })

  it('respects explicit data-sk-type hint', () => {
    const result = classify(makeGeometry({
      children: [{
        tagName: 'div',
        role: null,
        dataSkType: 'Button',
        boundingBox: { x: 0, y: 0, width: 120, height: 36 },
        computedStyles: { borderRadius: '4px', aspectRatio: 'auto' },
        children: [],
      }],
    }))
    expect(result[0]?.primitiveType).toBe('Button')
  })
})
