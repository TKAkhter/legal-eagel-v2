import { env } from '@/lib/env'

/** True once real MSAL env vars are set — see `.env.example`. Safe to import anywhere; pulls in nothing from `@azure/msal-*`. */
export const msalConfigured = Boolean(
  env.VITE_MSAL_CLIENT_ID && env.VITE_MSAL_TENANT_ID && env.VITE_MSAL_REDIRECT_URI,
)

export const loginRequestScopes = ['User.Read']
export const mailScopes = ['Mail.Read', 'Mail.Send']
export const filesScopes = ['Files.ReadWrite']
