import type { AppUserRaw } from '../types/app-user'

const roles = ['Administrator', 'Staff', 'Billing Clerk', 'Read Only']
const statuses: AppUserRaw['status'][] = ['active', 'invited', 'suspended']
const firstNames = ['Sara', 'John', 'Layla', 'Ahmed', 'Maria', 'Kenji', 'Fatima', 'Chen']
const lastNames = ['Khan', 'Smith', 'Haddad', 'Garcia', 'Tanaka', 'Ahmed', 'Wei', 'Rossi']

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export const usersMockData: AppUserRaw[] = Array.from({ length: 24 }, (_, i) => {
  const first = randomFrom(firstNames)
  const last = randomFrom(lastNames)
  return {
    id: `app-user-${i + 1}`,
    full_name: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
    role_name: randomFrom(roles),
    status: randomFrom(statuses),
    last_active_on: new Date(Date.now() - i * 43_200_000).toISOString(),
  }
})
