import { env } from './env'

/**
 * Single source of truth for "is X on". Components/hooks should import
 * `featureFlags` rather than reading `env.VITE_FEATURE_*` directly —
 * keeps the flag *names* isolated from the env var *names*, so renaming
 * an env var later doesn't ripple through the app.
 */
export const featureFlags = {
  /** Allow self-service account registration on the login screen. */
  userRegistration: env.VITE_FEATURE_USER_REGISTRATION,
  /** When true, email/password login is disabled — Microsoft SSO only. */
  msSsoOnly: env.VITE_FEATURE_MS_SSO_ONLY,
  /** When true, sidebar nav items are fetched from the API instead of the static FE config. */
  backendDrivenNav: env.VITE_FEATURE_BACKEND_NAV,
  /** When true, permission checks are expected to be enforced by a real backend too (not just mocked FE-side). */
  backendRbac: env.VITE_FEATURE_BACKEND_RBAC,
  /** When true, the api-client layer serves mock/demo data instead of hitting the real API. */
  useMockData: env.VITE_FEATURE_USE_MOCK_DATA,
  /** When true, the whole app renders the Maintenance page instead of the router. */
  maintenanceMode: env.VITE_FEATURE_MAINTENANCE_MODE,
} as const

export type FeatureFlags = typeof featureFlags
