/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />
/// <reference types="vite-plugin-pwa/react" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_UNDO_WINDOW_MS?: string
  readonly VITE_FEATURE_USER_REGISTRATION: 'true' | 'false'
  readonly VITE_FEATURE_MS_SSO_ONLY: 'true' | 'false'
  readonly VITE_FEATURE_BACKEND_NAV: 'true' | 'false'
  readonly VITE_FEATURE_BACKEND_RBAC: 'true' | 'false'
  readonly VITE_FEATURE_USE_MOCK_DATA: 'true' | 'false'
  readonly VITE_FEATURE_MAINTENANCE_MODE: 'true' | 'false'
  readonly VITE_MSAL_CLIENT_ID?: string
  readonly VITE_MSAL_TENANT_ID?: string
  readonly VITE_MSAL_REDIRECT_URI?: string
  readonly VITE_TOLGEE_API_URL?: string
  readonly VITE_TOLGEE_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/** Injected at build time by vite.config.ts's `define` — see src/lib/version.ts. */
declare const __APP_VERSION__: string
declare const __BUILD_TIME__: string
