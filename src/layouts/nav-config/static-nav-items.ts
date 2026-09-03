import type { PermissionKey } from '@/lib/auth/types'

export interface NavItem {
  key: string
  labelKey: string
  path: string
  icon: string // lucide-react icon name, resolved by <NavIcon />
  permission?: PermissionKey
}

/**
 * When `featureFlags.backendDrivenNav` is true, this same shape is
 * expected back from `GET /nav` instead — components consuming nav
 * items (Sidebar, breadcrumbs) don't care which source it came from.
 */
export const staticNavItems: NavItem[] = [
  { key: 'dashboard', labelKey: 'nav.dashboard', path: '/', icon: 'LayoutDashboard' },
  { key: 'leads', labelKey: 'nav.leads', path: '/leads', icon: 'Target', permission: 'leads:view' },
  { key: 'clients', labelKey: 'nav.clients', path: '/clients', icon: 'Users', permission: 'clients:view' },
  { key: 'matters', labelKey: 'nav.matters', path: '/matters', icon: 'Briefcase', permission: 'matters:view' },
  { key: 'billings', labelKey: 'nav.billings', path: '/billings', icon: 'Receipt', permission: 'billings:view' },
  { key: 'reportings', labelKey: 'nav.reportings', path: '/reportings', icon: 'BarChart3', permission: 'reportings:view' },
  { key: 'mail', labelKey: 'nav.mail', path: '/mail', icon: 'Mail', permission: 'mail:view' },
  { key: 'files', labelKey: 'nav.files', path: '/files', icon: 'FolderOpen', permission: 'files:view' },
  { key: 'users', labelKey: 'nav.users', path: '/users', icon: 'UserCog', permission: 'users:view' },
  { key: 'groups', labelKey: 'nav.groups', path: '/groups', icon: 'UsersRound', permission: 'groups:view' },
  { key: 'permissions', labelKey: 'nav.permissions', path: '/permissions', icon: 'ShieldCheck', permission: 'permissions:view' },
  { key: 'audit-log', labelKey: 'nav.auditLog', path: '/audit-log', icon: 'History', permission: 'permissions:view' },
  { key: 'help', labelKey: 'nav.help', path: '/help', icon: 'LifeBuoy' },
]
