import { mockRoles } from './mock-users'
import { msalConfigured, loginRequestScopes } from './msal-flags'
import type { AuthUser } from './types'
import type { LoginResult } from './auth-service'

/**
 * Real MSAL popup login — used when `VITE_MSAL_CLIENT_ID` etc. are set
 * (see `.env.example`). Note there's no real backend yet to hand back
 * this user's roles/permissions, so it defaults to the "Staff" role for
 * demo purposes; swap that for whatever your `/auth/me`-equivalent
 * endpoint returns once one exists.
 *
 * Import this only where it's actually used (see `LoginPage`'s dynamic
 * `import()` on the Microsoft SSO button) — importing it statically
 * pulls `@azure/msal-browser` (via `msal-config.ts`) into that bundle.
 */
export async function loginWithMicrosoft(): Promise<LoginResult> {
  if (!msalConfigured) {
    throw new Error('Microsoft SSO is not configured — set VITE_MSAL_CLIENT_ID, VITE_MSAL_TENANT_ID, and VITE_MSAL_REDIRECT_URI.')
  }

  const { msalInstance } = await import('./msal-config')
  if (!msalInstance) {
    throw new Error('Microsoft SSO is not configured — set VITE_MSAL_CLIENT_ID, VITE_MSAL_TENANT_ID, and VITE_MSAL_REDIRECT_URI.')
  }

  const result = await msalInstance.loginPopup({ scopes: loginRequestScopes })
  msalInstance.setActiveAccount(result.account)

  const defaultRole = mockRoles.find((r) => r.name === 'Staff') ?? mockRoles[0]

  const user: AuthUser = {
    id: result.account.homeAccountId,
    name: result.account.name ?? result.account.username,
    email: result.account.username,
    roles: defaultRole ? [defaultRole] : [],
  }

  return { user, token: result.accessToken }
}
