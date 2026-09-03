import { describe, it, expect } from 'vitest'
import { getEffectivePermissions } from './types'
import type { AuthUser, Role } from './types'

const staffRole: Role = { id: 'r1', name: 'Staff', permissions: ['leads:view', 'leads:edit'] }
const billingRole: Role = { id: 'r2', name: 'Billing', permissions: ['billings:view', 'billings:edit'] }

function makeUser(roles: Role[]): AuthUser {
  return { id: 'u1', name: 'Test User', email: 'test@example.com', roles }
}

describe('getEffectivePermissions', () => {
  it('returns an empty set for a null user', () => {
    expect(getEffectivePermissions(null).size).toBe(0)
  })

  it('flattens permissions from a single role', () => {
    const perms = getEffectivePermissions(makeUser([staffRole]))
    expect(perms.has('leads:view')).toBe(true)
    expect(perms.has('leads:edit')).toBe(true)
    expect(perms.has('billings:view')).toBe(false)
  })

  it('unions permissions across multiple roles without duplication', () => {
    const perms = getEffectivePermissions(makeUser([staffRole, billingRole]))
    expect(perms.size).toBe(4)
    expect(perms.has('leads:view')).toBe(true)
    expect(perms.has('billings:edit')).toBe(true)
  })

  it('returns an empty set for a user with no roles', () => {
    expect(getEffectivePermissions(makeUser([])).size).toBe(0)
  })
})
