import { describe, expect, it } from 'vitest'
import { Project } from 'ts-morph'
import { computeAstHash } from '../hash.js'

describe('computeAstHash', () => {
  it('returns an 8-char hex string', () => {
    const project = new Project({ useInMemoryFileSystem: true })
    const sf = project.createSourceFile('test.tsx', '<div><span /></div>')
    const hash = computeAstHash(sf)
    expect(hash).toMatch(/^[0-9a-f]{8}$/)
  })

  it('returns the same hash for identical structure', () => {
    const project = new Project({ useInMemoryFileSystem: true })
    const sf1 = project.createSourceFile('test1.tsx', '<div><span /></div>')
    const sf2 = project.createSourceFile('test2.tsx', '<div><span /></div>')
    expect(computeAstHash(sf1)).toBe(computeAstHash(sf2))
  })

  it('returns different hashes for different structures', () => {
    const project = new Project({ useInMemoryFileSystem: true })
    const sf1 = project.createSourceFile('test3.tsx', '<div><span /></div>')
    const sf2 = project.createSourceFile('test4.tsx', '<div><p /></div>')
    expect(computeAstHash(sf1)).not.toBe(computeAstHash(sf2))
  })
})
