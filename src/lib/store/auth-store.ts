import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthUser, PermissionKey } from '@/lib/auth/types'
import { getEffectivePermissions } from '@/lib/auth/types'

interface AuthState {
  user: AuthUser | null
  /** Mock JWT for now — a real backend later just changes what populates this. */
  token: string | null
  isAuthenticated: boolean

  setSession: (user: AuthUser, token: string) => void
  clearSession: () => void
  hasPermission: (key: PermissionKey) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setSession: (user, token) => set({ user, token, isAuthenticated: true }),
      clearSession: () => set({ user: null, token: null, isAuthenticated: false }),

      hasPermission: (key) => getEffectivePermissions(get().user).has(key),
    }),
    { name: 'auth-session' },
  ),
)
