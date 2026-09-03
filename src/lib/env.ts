import { z } from 'zod'

/**
 * All env vars consumed by the app must be declared here and validated
 * at startup. Never reach for `import.meta.env` directly anywhere else —
 * import `env` from this file instead, so a missing/malformed var fails
 * fast with a clear error rather than silently becoming `undefined`
 * somewhere deep in a component.
 */

/**
 * Vite always defines every `VITE_*` key referenced in `.env*` files —
 * an unset one comes through as `""`, not `undefined`. Plain
 * `z.string().url().optional()` treats `""` as "present but invalid"
 * and fails validation, so any optional URL field needs this wrapper
 * to treat blank as genuinely absent.
 */
const optionalUrl = z.preprocess(
  (v) => (v === '' ? undefined : v),
  z.string().url().optional(),
)

/** Same empty-string-means-unset treatment as `optionalUrl`, for numeric settings with a default. */
const optionalPositiveInt = (defaultValue: number) =>
  z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.coerce.number().int().positive().optional().default(defaultValue),
  )

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url(),
  VITE_APP_NAME: z.string().default('Admin Boilerplate'),
  VITE_APP_ENV: z.string().default('Development'),

  // --- Tunable settings ------------------------------------------------
  /** How long the "Undo" action stays available after a delete before it's committed for real. */
  VITE_UNDO_WINDOW_MS: optionalPositiveInt(5000),

  // --- Feature flags -------------------------------------------------
  // Booleans arrive from Vite as the strings "true" / "false".
  VITE_FEATURE_USER_REGISTRATION: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  VITE_FEATURE_MS_SSO_ONLY: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  VITE_FEATURE_BACKEND_NAV: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  VITE_FEATURE_BACKEND_RBAC: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  VITE_FEATURE_USE_MOCK_DATA: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  VITE_FEATURE_MAINTENANCE_MODE: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),

  // --- Microsoft SSO / Graph -----------------------------------------
  VITE_MSAL_CLIENT_ID: z.string().optional(),
  VITE_MSAL_TENANT_ID: z.string().optional(),
  VITE_MSAL_REDIRECT_URI: optionalUrl,

  // --- i18n / translation platform ------------------------------------
  VITE_TOLGEE_API_URL: optionalUrl,
  VITE_TOLGEE_API_KEY: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

function loadEnv(): Env {
  const result = envSchema.safeParse(import.meta.env)

  if (!result.success) {
    // Fail loudly and early — a misconfigured env is a build/deploy
    // problem, not something the app should try to run through.
    // eslint-disable-next-line no-console
    console.error('Invalid environment variables:', result.error.flatten().fieldErrors)
    throw new Error('Invalid environment variables. Check the console for details.')
  }

  return result.data
}

export const env = loadEnv()
