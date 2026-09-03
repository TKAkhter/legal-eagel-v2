/**
 * Permission keys are deliberately flat strings ("module:action") rather
 * than a nested structure — easy to check (`hasPermission('mail:view')`),
 * easy to store in a JWT claim array once a real backend exists, and
 * easy to render as a checklist on the admin Permissions page.
 */
export type PermissionKey =
  | 'leads:view' | 'leads:edit'
  | 'clients:view' | 'clients:edit'
  | 'matters:view' | 'matters:edit'
  | 'billings:view' | 'billings:edit'
  | 'reportings:view'
  | 'users:view' | 'users:edit'
  | 'groups:view' | 'groups:edit'
  | 'permissions:view' | 'permissions:edit'
  | 'mail:view'
  | 'files:view' | 'files:edit'

export interface Role {
  id: string
  name: string
  permissions: PermissionKey[]
}

/**
 * Runtime companion to the `PermissionKey` type — grouped by module so
 * the admin Permissions page can render a checklist section per
 * module. Keep this in sync with the `PermissionKey` union above; a
 * type-only union can't be iterated at runtime, so this is the one
 * place that has to be updated in both spots when a permission is added.
 */
export const permissionGroups: { module: string; keys: PermissionKey[] }[] = [
  { module: 'Leads', keys: ['leads:view', 'leads:edit'] },
  { module: 'Clients', keys: ['clients:view', 'clients:edit'] },
  { module: 'Matters', keys: ['matters:view', 'matters:edit'] },
  { module: 'Billings', keys: ['billings:view', 'billings:edit'] },
  { module: 'Reportings', keys: ['reportings:view'] },
  { module: 'Users', keys: ['users:view', 'users:edit'] },
  { module: 'Groups', keys: ['groups:view', 'groups:edit'] },
  { module: 'Permissions', keys: ['permissions:view', 'permissions:edit'] },
  { module: 'Mail', keys: ['mail:view'] },
  { module: 'Files', keys: ['files:view', 'files:edit'] },
]

export interface AuthUser {
  id: string
  name: string
  email: string
  avatarUrl?: string
  roles: Role[]
}

/** Flattened, de-duplicated permission set — what components actually check against. */
export function getEffectivePermissions(user: AuthUser | null): Set<PermissionKey> {
  if (!user) return new Set()
  return new Set(user.roles.flatMap((r) => r.permissions))
}
