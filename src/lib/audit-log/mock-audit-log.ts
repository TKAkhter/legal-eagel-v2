import type { AuditLogEntry } from './types'

const actors = ['Amina Haddad', 'Omar Siddiqui']
const actions: AuditLogEntry['action'][] = ['create', 'update', 'delete', 'login', 'permission_change']
const modules = ['Leads', 'Clients', 'Matters', 'Billings', 'Users', 'Groups', 'Permissions']

const descriptions: Record<AuditLogEntry['action'], (mod: string) => string> = {
  create: (mod) => `Created a new ${mod.slice(0, -1)} record`,
  update: (mod) => `Updated a ${mod.slice(0, -1)} record`,
  delete: (mod) => `Deleted a ${mod.slice(0, -1)} record`,
  login: () => 'Signed in',
  permission_change: () => 'Changed role permissions',
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export const auditLogMock: AuditLogEntry[] = Array.from({ length: 63 }, (_, i) => {
  const action = randomFrom(actions)
  const mod = randomFrom(modules)
  return {
    id: `audit-${i + 1}`,
    actorName: randomFrom(actors),
    action,
    module: action === 'login' ? '—' : mod,
    description: descriptions[action](mod),
    createdAt: new Date(Date.now() - i * 3_600_000).toISOString(),
  }
})
