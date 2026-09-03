export type ClientTier = 'standard' | 'priority' | 'vip'

export interface Client {
  id: string
  name: string
  organization: string
  email: string
  phone: string
  tier: ClientTier
  createdAt: string
}

export interface ClientRaw {
  id: string
  contact_name: string
  organization_name: string
  email: string
  phone: string
  tier: ClientTier
  created_on: string
}
