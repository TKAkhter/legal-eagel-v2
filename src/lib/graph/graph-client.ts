import axios from 'axios'

/**
 * Separate from `lib/api-client/http-client.ts` on purpose: Graph calls
 * carry an MSAL-issued access token (different audience/scopes than
 * your own API's JWT), and hit `graph.microsoft.com` directly rather
 * than `VITE_API_BASE_URL`. The Mail and File Manager modules are the
 * only consumers of this client.
 *
 * MSAL wiring itself (acquireTokenSilent, login popup/redirect, scope
 * consent for Mail.Read / Files.ReadWrite) is not implemented yet —
 * this client is the seam where that plugs in. Until then, both mail
 * and file modules run on mock data (see their `mock/` folders),
 * matching `featureFlags.useMockData` the same way REST-backed modules do.
 */
export const graphClient = axios.create({
  baseURL: 'https://graph.microsoft.com/v1.0',
  timeout: 15000,
})

let getGraphToken: (() => Promise<string | null>) | null = null

/** Call once real MSAL is wired up: `setGraphTokenProvider(() => msalInstance.acquireTokenSilent(...))`. */
export function setGraphTokenProvider(fn: () => Promise<string | null>) {
  getGraphToken = fn
}

graphClient.interceptors.request.use(async (config) => {
  const token = getGraphToken ? await getGraphToken() : null
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
