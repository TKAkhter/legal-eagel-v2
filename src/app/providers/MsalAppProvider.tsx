import { useEffect, useState, type ReactNode, type ComponentType } from 'react'
import { msalConfigured, mailScopes, filesScopes } from '@/lib/auth/msal-flags'
import { setGraphTokenProvider } from '@/lib/graph/graph-client'

/**
 * When MSAL isn't configured (the default), this renders children
 * immediately and never imports `@azure/msal-browser` or
 * `@azure/msal-react` at all — those packages add real bundle weight,
 * so unconfigured deployments shouldn't pay for them. Only once
 * `msalConfigured` is true does it dynamically load both, initialize
 * the instance, and wire `setGraphTokenProvider` for Mail/File Manager.
 */
export function MsalAppProvider({ children }: { children: ReactNode }) {
  const [Provider, setProvider] = useState<ComponentType<{ instance: unknown; children: ReactNode }> | null>(null)
  const [instance, setInstance] = useState<unknown>(null)
  const ready = !msalConfigured || !!Provider

  useEffect(() => {
    if (!msalConfigured) return

    Promise.all([import('@azure/msal-react'), import('@/lib/auth/msal-config')]).then(
      async ([msalReact, msalConfig]) => {
        const msalInstance = msalConfig.msalInstance
        if (!msalInstance) return

        await msalInstance.initialize()

        setGraphTokenProvider(async () => {
          const account = msalInstance.getActiveAccount() ?? msalInstance.getAllAccounts()[0]
          if (!account) return null

          try {
            const result = await msalInstance.acquireTokenSilent({ scopes: [...mailScopes, ...filesScopes], account })
            return result.accessToken
          } catch (err) {
            const { InteractionRequiredAuthError } = await import('@azure/msal-browser')
            if (err instanceof InteractionRequiredAuthError) {
              const result = await msalInstance.acquireTokenPopup({ scopes: [...mailScopes, ...filesScopes] })
              return result.accessToken
            }
            throw err
          }
        })

        setInstance(msalInstance)
        setProvider(() => msalReact.MsalProvider as ComponentType<{ instance: unknown; children: ReactNode }>)
      },
    )
  }, [])

  if (!ready) return null
  if (!Provider || !instance) return <>{children}</>

  return <Provider instance={instance}>{children}</Provider>
}
