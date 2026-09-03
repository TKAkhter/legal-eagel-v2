export type AuditAction = 'create' | 'update' | 'delete' | 'login' | 'permission_change'

export interface AuditLogEntry {
  id: string
  actorName: string
  action: AuditAction
  module: string
  description: string
  createdAt: string
}
