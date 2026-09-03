import type { ClientRaw } from '../types/client'

const orgs = ['Acme Corp', 'Globex', 'Initech', 'Umbrella Inc', 'Soylent', 'Hooli', 'Stark Industries']
const tiers: ClientRaw['tier'][] = ['standard', 'priority', 'vip']
const firstNames = ['Sara', 'John', 'Layla', 'Ahmed', 'Maria', 'Kenji', 'Fatima', 'Chen', 'Yusuf', 'Elena']
const lastNames = ['Khan', 'Smith', 'Haddad', 'Garcia', 'Tanaka', 'Ahmed', 'Wei', 'Rossi', 'Nasser', 'Popov']

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export const clientsMockData: ClientRaw[] = Array.from({ length: 38 }, (_, i) => {
  const first = randomFrom(firstNames)
  const last = randomFrom(lastNames)
  return {
    id: `client-${i + 1}`,
    contact_name: `${first} ${last}`,
    organization_name: randomFrom(orgs),
    email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
    phone: `+1-555-01${(10 + i).toString().padStart(2, '0')}`,
    tier: randomFrom(tiers),
    created_on: new Date(Date.now() - i * 86_400_000).toISOString(),
  }
})
