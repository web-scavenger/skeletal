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
    expect(result).toContain('width="100%"')
    expect(result).toContain('/>')
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

  it('prints Avatar with size', () => {
    const tree: SkeletonTree = [{
      primitiveType: 'Avatar',
      props: { size: 40, shape: 'circle' },
      relativeWidth: '40px',
      children: [],
    }]
    const result = printSkeletonTree(tree)
    expect(result).toContain('size={40}')
    expect(result).toContain('shape="circle"')
  })
})
