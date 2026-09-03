import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { RequirePermission } from './RequirePermission'
import { useAuthStore } from '@/lib/store/auth-store'
import type { Role } from '@/lib/auth/types'

const leadsRole: Role = { id: 'r1', name: 'Leads only', permissions: ['leads:view'] }

function signInAs(roles: Role[]) {
  useAuthStore.getState().setSession(
    { id: 'u1', name: 'Test', email: 'test@example.com', roles },
    'mock-token',
  )
}

afterEach(() => {
  cleanup()
  useAuthStore.getState().clearSession()
})

describe('RequirePermission', () => {
  it('renders children when the user has the required permission', () => {
    signInAs([leadsRole])
    render(
      <RequirePermission permission="leads:view">
        <span>Visible content</span>
      </RequirePermission>,
    )
    expect(screen.getByText('Visible content')).toBeInTheDocument()
  })

  it('renders nothing when the user lacks the required permission', () => {
    signInAs([leadsRole])
    render(
      <RequirePermission permission="billings:edit">
        <span>Hidden content</span>
      </RequirePermission>,
    )
    expect(screen.queryByText('Hidden content')).not.toBeInTheDocument()
  })

  it('renders the fallback when provided and access is denied', () => {
    signInAs([leadsRole])
    render(
      <RequirePermission permission="billings:edit" fallback={<span>No access</span>}>
        <span>Hidden content</span>
      </RequirePermission>,
    )
    expect(screen.getByText('No access')).toBeInTheDocument()
  })

  it('grants access if the user has any one of multiple listed permissions', () => {
    signInAs([leadsRole])
    render(
      <RequirePermission permission={['billings:edit', 'leads:view']}>
        <span>Visible content</span>
      </RequirePermission>,
    )
    expect(screen.getByText('Visible content')).toBeInTheDocument()
  })
})
