import { PublicClientApplication, type Configuration } from '@azure/msal-browser'
import { env } from '@/lib/env'
import { msalConfigured } from './msal-flags'

export { msalConfigured, loginRequestScopes, mailScopes, filesScopes } from './msal-flags'

/**
 * Only imported lazily (see `MsalAppProvider` and `auth-service.ts`'s
 * `loginWithMicrosoft`) — this file pulls in the full `@azure/msal-browser`
 * package, so keeping the import dynamic means unconfigured deployments
 * never download it.
 */
const msalAuthConfig: Configuration = {
  auth: {
    clientId: env.VITE_MSAL_CLIENT_ID ?? '',
    authority: env.VITE_MSAL_TENANT_ID ? `https://login.microsoftonline.com/${env.VITE_MSAL_TENANT_ID}` : undefined,
    redirectUri: env.VITE_MSAL_REDIRECT_URI ?? window.location.origin,
  },
  cache: {
    cacheLocation: 'localStorage',
  },
}

export const msalInstance: PublicClientApplication | null = msalConfigured
  ? new PublicClientApplication(msalAuthConfig)
  : null
