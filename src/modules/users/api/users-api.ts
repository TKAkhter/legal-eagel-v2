import { createResourceClient } from '@/lib/api-client/create-resource-client'
import { usersMockData } from '../mock/users.mock'
import type { AppUser, AppUserRaw } from '../types/app-user'

export const usersApi = createResourceClient<AppUserRaw, AppUser>({
  resource: '/users',
  mockData: usersMockData,
  transform: (raw) => ({
    id: raw.id,
    name: raw.full_name,
    email: raw.email,
    roleName: raw.role_name,
    status: raw.status,
    lastActiveAt: raw.last_active_on,
  }),
  toRaw: (partial) => ({
    ...(partial.name !== undefined && { full_name: partial.name }),
    ...(partial.email !== undefined && { email: partial.email }),
    ...(partial.roleName !== undefined && { role_name: partial.roleName }),
    ...(partial.status !== undefined && { status: partial.status }),
  }),
})
