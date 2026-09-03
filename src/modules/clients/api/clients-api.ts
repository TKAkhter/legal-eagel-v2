import { createResourceClient } from '@/lib/api-client/create-resource-client'
import { clientsMockData } from '../mock/clients.mock'
import type { Client, ClientRaw } from '../types/client'

export const clientsApi = createResourceClient<ClientRaw, Client>({
  resource: '/clients',
  mockData: clientsMockData,
  transform: (raw) => ({
    id: raw.id,
    name: raw.contact_name,
    organization: raw.organization_name,
    email: raw.email,
    phone: raw.phone,
    tier: raw.tier,
    createdAt: raw.created_on,
  }),
  toRaw: (partial) => ({
    ...(partial.name !== undefined && { contact_name: partial.name }),
    ...(partial.organization !== undefined && { organization_name: partial.organization }),
    ...(partial.email !== undefined && { email: partial.email }),
    ...(partial.phone !== undefined && { phone: partial.phone }),
    ...(partial.tier !== undefined && { tier: partial.tier }),
  }),
})
