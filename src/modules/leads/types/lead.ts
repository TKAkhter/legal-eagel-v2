export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'lost'

/** Frontend-facing shape — what components consume. */
export interface Lead {
  id: string
  name: string
  company: string
  email: string
  status: LeadStatus
  createdAt: string
}

/**
 * Raw/backend-facing shape. Deliberately different field names here
 * (snake_case-ish `created_on`) to demonstrate the transform layer
 * actually doing work — see `api/leads-api.ts`.
 */
export interface LeadRaw {
  id: string
  full_name: string
  company_name: string
  email: string
  status: LeadStatus
  created_on: string
}
