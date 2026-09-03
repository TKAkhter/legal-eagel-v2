import { createResourceClient } from '@/lib/api-client/create-resource-client'
import { auditLogMock } from './mock-audit-log'
import type { AuditLogEntry } from './types'

/**
 * Read-only in practice (the Audit Log page only ever calls `.list`),
 * but built on the same `createResourceClient` every other module
 * uses so it gets the mock/real backend switch for free — no special
 * case needed at the plumbing layer for "this one's read-only."
 */
export const auditLogApi = createResourceClient<AuditLogEntry, AuditLogEntry>({
  resource: '/audit-log',
  mockData: auditLogMock,
  transform: (raw) => raw,
})
