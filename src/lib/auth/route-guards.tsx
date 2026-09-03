import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/lib/store/auth-store'
import { useAnyPermission } from '@/lib/auth/use-permission'
import type { PermissionKey } from '@/lib/auth/types'

/** Redirects to /login (preserving the intended destination) if there's no session. */
export function RequireAuth() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return <Outlet />
}

interface RequireRoutePermissionProps {
  permission: PermissionKey | PermissionKey[]
}

/** Redirects to /403 if the authenticated user lacks the permission a route needs. */
export function RequireRoutePermission({ permission }: RequireRoutePermissionProps) {
  const keys = Array.isArray(permission) ? permission : [permission]
  const allowed = useAnyPermission(keys)

  if (!allowed) {
    return <Navigate to="/403" replace />
  }
  return <Outlet />
}
