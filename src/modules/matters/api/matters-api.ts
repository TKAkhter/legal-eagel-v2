import { createResourceClient } from '@/lib/api-client/create-resource-client'
import { mattersMockData } from '../mock/matters.mock'
import type { Matter, MatterRaw } from '../types/matter'

export const mattersApi = createResourceClient<MatterRaw, Matter>({
  resource: '/matters',
  mockData: mattersMockData,
  transform: (raw) => ({
    id: raw.id,
    title: raw.matter_title,
    clientName: raw.client_name,
    status: raw.status,
    assignedTo: raw.assigned_to,
    openedAt: raw.opened_on,
  }),
  toRaw: (partial) => ({
    ...(partial.title !== undefined && { matter_title: partial.title }),
    ...(partial.clientName !== undefined && { client_name: partial.clientName }),
    ...(partial.status !== undefined && { status: partial.status }),
    ...(partial.assignedTo !== undefined && { assigned_to: partial.assignedTo }),
  }),
})
