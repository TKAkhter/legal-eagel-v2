import { mockRoles } from '@/lib/auth/mock-users'
import type { Role, PermissionKey } from '@/lib/auth/types'
import { featureFlags } from '@/lib/feature-flags'
import { httpClient } from '@/lib/api-client/http-client'

/**
 * Deliberately NOT built on `createResourceClient` — roles aren't a
 * paged/sorted/filtered list in this UI, they're a small fixed set
 * edited as a permission matrix. A real backend would still expose
 * `GET /roles` and `PATCH /roles/:id`, this just isn't the same
 * shape as the DataGrid-backed modules.
 */
export const permissionsApi = {
  async listRoles(): Promise<Role[]> {
    if (featureFlags.useMockData) {
      await new Promise((r) => setTimeout(r, 300))
      return mockRoles
    }
    const { data } = await httpClient.get<Role[]>('/roles')
    return data
  },

  async updateRolePermissions(roleId: string, permissions: PermissionKey[]): Promise<Role> {
    if (featureFlags.useMockData) {
      await new Promise((r) => setTimeout(r, 300))
      const role = mockRoles.find((r) => r.id === roleId)
      if (!role) throw new Error(`Role ${roleId} not found`)
      role.permissions = permissions
      return role
    }
    const { data } = await httpClient.patch<Role>(`/roles/${roleId}`, { permissions })
    return data
  },
}
