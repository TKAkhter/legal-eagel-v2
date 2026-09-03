import { createResourceClient } from '@/lib/api-client/create-resource-client'
import { leadsMockData } from '../mock/leads.mock'
import type { Lead, LeadRaw } from '../types/lead'

/**
 * This is the pattern every module follows: define the raw→FE
 * transform once here, then `list/getById/create/update/remove` all
 * apply it automatically. Swapping mock data for a real API later only
 * means updating `resource` and `mockData` goes away — `transform`
 * usually doesn't need to change at all.
 */
export const leadsApi = createResourceClient<LeadRaw, Lead>({
  resource: '/leads',
  mockData: leadsMockData,
  transform: (raw) => ({
    id: raw.id,
    name: raw.full_name,
    company: raw.company_name,
    email: raw.email,
    status: raw.status,
    createdAt: raw.created_on,
  }),
  toRaw: (partial) => ({
    ...(partial.name !== undefined && { full_name: partial.name }),
    ...(partial.company !== undefined && { company_name: partial.company }),
    ...(partial.email !== undefined && { email: partial.email }),
    ...(partial.status !== undefined && { status: partial.status }),
  }),
})
