import { useAuthStore } from '@/lib/store/auth-store'
import type { PermissionKey } from './types'

/** `if (usePermission('mail:view')) ...` — the one place components should check access. */
export function usePermission(key: PermissionKey): boolean {
  return useAuthStore((s) => s.hasPermission(key))
}

/** For cases needing more than one flag, e.g. showing a row-menu item that needs any of a few keys. */
export function useAnyPermission(keys: PermissionKey[]): boolean {
  const hasPermission = useAuthStore((s) => s.hasPermission)
  return keys.some((k) => hasPermission(k))
}
