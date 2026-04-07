import { describe, expect, it } from 'vitest'
import { injectDataSk } from '../transform.js'
import type { SkeletalCandidate } from '../../ast-scanner/types.js'

const makeCandidate = (name: string, filePath: string): SkeletalCandidate => ({
  name,
  sourceFile: filePath,
  usageFile: '/src/app/page.tsx',
  pattern: 'rsc',
  codemod: 'wrap-with-skeleton-wrapper',
  hasSkeleton: false,
  isEjected: false,
  astHash: 'abc12345',
})

describe('injectDataSk', () => {
  it('returns source unchanged if no matching candidates', () => {
    const source = 'export function Foo() { return <div /> }'
    const result = injectDataSk(source, '/src/Foo.tsx', [])
    expect(result).toBe(source)
  })

  it('injects data-sk attribute on root JSX element', () => {
    const source = `export function UserCard() {
  return <div className="user-card"><span>hello</span></div>
}`
    const candidate = makeCandidate('UserCard', '/src/UserCard.tsx')
    const result = injectDataSk(source, '/src/UserCard.tsx', [candidate])
    expect(result).toContain('data-sk="UserCard"')
  })

  it('is idempotent - does not double-inject', () => {
    const source = `export function UserCard() {
  return <div data-sk="UserCard" className="user-card" />
}`
    const candidate = makeCandidate('UserCard', '/src/UserCard.tsx')
    const result = injectDataSk(source, '/src/UserCard.tsx', [candidate])
    const count = (result.match(/data-sk=/g) ?? []).length
    expect(count).toBe(1)
  })
})
