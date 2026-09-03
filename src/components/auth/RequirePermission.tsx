import type { ReactNode } from 'react'
import { useAnyPermission } from '@/lib/auth/use-permission'
import type { PermissionKey } from '@/lib/auth/types'

interface RequirePermissionProps {
  permission: PermissionKey | PermissionKey[]
  /** Rendered instead of nothing when the check fails — rarely needed, but there for disabled-vs-hidden cases. */
  fallback?: ReactNode
  children: ReactNode
}

/**
 * Wrap anything that should only render for users with a given
 * permission — a nav item, a row-menu action, a whole column. This is
 * the FE-side mock of RBAC; when `featureFlags.backendRbac` is on, the
 * API is also expected to enforce this server-side, but the UI should
 * still hide what the user can't use either way.
 */
export function RequirePermission({ permission, fallback = null, children }: RequirePermissionProps) {
  const keys = Array.isArray(permission) ? permission : [permission]
  const allowed = useAnyPermission(keys)
  return allowed ? <>{children}</> : <>{fallback}</>
}
