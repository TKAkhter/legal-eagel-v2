import type { LeadRaw } from '../types/lead'

const companies = ['Acme Corp', 'Globex', 'Initech', 'Umbrella Inc', 'Soylent', 'Hooli', 'Stark Industries']
const statuses: LeadRaw['status'][] = ['new', 'contacted', 'qualified', 'lost']
const firstNames = ['Sara', 'John', 'Layla', 'Ahmed', 'Maria', 'Kenji', 'Fatima', 'Chen', 'Yusuf', 'Elena']
const lastNames = ['Khan', 'Smith', 'Haddad', 'Garcia', 'Tanaka', 'Ahmed', 'Wei', 'Rossi', 'Nasser', 'Popov']

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export const leadsMockData: LeadRaw[] = Array.from({ length: 47 }, (_, i) => {
  const first = randomFrom(firstNames)
  const last = randomFrom(lastNames)
  return {
    id: `lead-${i + 1}`,
    full_name: `${first} ${last}`,
    company_name: randomFrom(companies),
    email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
    status: randomFrom(statuses),
    created_on: new Date(Date.now() - i * 86_400_000).toISOString(),
  }
})
