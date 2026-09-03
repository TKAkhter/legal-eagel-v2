import { featureFlags } from '@/lib/feature-flags'
import { mockUsers } from './mock-users'
import type { AuthUser } from './types'

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResult {
  user: AuthUser
  token: string
}

/**
 * Mirrors the shape a real `/auth/login` endpoint would return. When
 * `useMockData` is off, replace the body with an `apiClient.post(...)`
 * call — every caller (the login form, the auth store) stays the same.
 *
 * Real Microsoft SSO login lives in `msal-login.ts`, not here — keeping
 * it out of this file means the (fairly large) `@azure/msal-browser`
 * package never gets pulled into the bundle for deployments that only
 * use email/password auth.
 */
export async function login(payload: LoginPayload): Promise<LoginResult> {
  if (featureFlags.msSsoOnly) {
    throw new Error('Email/password login is disabled. Use Microsoft SSO.')
  }

  if (!featureFlags.useMockData) {
    throw new Error('Real backend not wired up yet — set VITE_FEATURE_USE_MOCK_DATA=true.')
  }

  // Simulate network latency so loading states are visible in the demo.
  await new Promise((r) => setTimeout(r, 400))

  const match = mockUsers.find(
    (u) => u.email === payload.email && u.password === payload.password,
  )

  if (!match) {
    throw new Error('Invalid email or password.')
  }

  const { password: _password, ...user } = match
  return { user, token: `mock-jwt.${user.id}` }
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
}

export async function register(payload: RegisterPayload): Promise<LoginResult> {
  if (!featureFlags.userRegistration) {
    throw new Error('Registration is currently disabled.')
  }
  await new Promise((r) => setTimeout(r, 400))

  const user: AuthUser = {
    id: `user-${Date.now()}`,
    name: payload.name,
    email: payload.email,
    roles: [],
  }
  return { user, token: `mock-jwt.${user.id}` }
}
