import { createResourceClient } from '@/lib/api-client/create-resource-client'
import { groupsMockData } from '../mock/groups.mock'
import type { Group, GroupRaw } from '../types/group'

export const groupsApi = createResourceClient<GroupRaw, Group>({
  resource: '/groups',
  mockData: groupsMockData,
  transform: (raw) => ({
    id: raw.id,
    name: raw.group_name,
    memberCount: raw.member_count,
    createdAt: raw.created_on,
  }),
  toRaw: (partial) => ({
    ...(partial.name !== undefined && { group_name: partial.name }),
    ...(partial.memberCount !== undefined && { member_count: partial.memberCount }),
  }),
})
