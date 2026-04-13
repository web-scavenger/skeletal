import { describe, expect, it } from 'vitest'
import { printSkeletonTree } from '../printer.js'
import type { SkeletonTree } from '../../classifier/types.js'

describe('printSkeletonTree', () => {
  it('prints a simple Text primitive', () => {
    const tree: SkeletonTree = [{
      primitiveType: 'Text',
      props: { lines: 2, width: '100%' },
      relativeWidth: '100%',
      children: [],
    }]
    const result = printSkeletonTree(tree)
    expect(result).toContain('<Sk.Text')
    expect(result).toContain('lines={2}')
    // width="100%" is the default and is elided
    expect(result).not.toContain('width="100%"')
    expect(result).toContain('/>')
  })

  it('prints Text with non-default width', () => {
    const tree: SkeletonTree = [{
      primitiveType: 'Text',
      props: { lines: 2, width: '80%' },
      relativeWidth: '80%',
      children: [],
    }]
    const result = printSkeletonTree(tree)
    expect(result).toContain('<Sk.Text')
    expect(result).toContain('lines={2}')
    expect(result).toContain('width="80%"')
  })

  it('prints nested elements', () => {
    const tree: SkeletonTree = [{
      primitiveType: 'Card',
      props: {},
      relativeWidth: '100%',
      children: [{
        primitiveType: 'Heading',
        props: { width: '70%' },
        relativeWidth: '70%',
        children: [],
      }],
    }]
    const result = printSkeletonTree(tree)
    expect(result).toContain('<Sk.Card>')
    expect(result).toContain('<Sk.Heading')
    expect(result).toContain('</Sk.Card>')
  })

  it('prints Avatar with size — default props elided', () => {
    const tree: SkeletonTree = [{
      primitiveType: 'Avatar',
      props: { size: 40, shape: 'circle' },
      relativeWidth: '40px',
      children: [],
    }]
    const result = printSkeletonTree(tree)
    // size=40 and shape="circle" are defaults and are elided
    expect(result).not.toContain('size={40}')
    expect(result).not.toContain('shape="circle"')
    expect(result).toContain('<Sk.Avatar')
  })

  it('prints Avatar with non-default size', () => {
    const tree: SkeletonTree = [{
      primitiveType: 'Avatar',
      props: { size: 64, shape: 'square' },
      relativeWidth: '64px',
      children: [],
    }]
    const result = printSkeletonTree(tree)
    expect(result).toContain('size={64}')
    expect(result).toContain('shape="square"')
  })

  it('elides defaults when primitivesConfig overrides them', () => {
    const tree: SkeletonTree = [{
      primitiveType: 'Avatar',
      props: { size: 32 },
      relativeWidth: '32px',
      children: [],
    }]
    const result = printSkeletonTree(tree, 2, { avatar: { size: 32 } })
    // size=32 matches the overridden default, so it should be elided
    expect(result).not.toContain('size={32}')
    expect(result).toContain('<Sk.Avatar')
  })
})
