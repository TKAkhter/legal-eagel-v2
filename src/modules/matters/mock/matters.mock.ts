import type { MatterRaw } from '../types/matter'

const titles = ['Contract Review', 'Trademark Filing', 'Dispute Resolution', 'Compliance Audit', 'Merger Advisory', 'IP Licensing']
const clients = ['Acme Corp', 'Globex', 'Initech', 'Umbrella Inc', 'Soylent', 'Hooli']
const statuses: MatterRaw['status'][] = ['open', 'in_progress', 'on_hold', 'closed']
const assignees = ['Amina Haddad', 'Omar Siddiqui', 'Layla Ahmed', 'John Smith']

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export const mattersMockData: MatterRaw[] = Array.from({ length: 32 }, (_, i) => ({
  id: `matter-${i + 1}`,
  matter_title: `${randomFrom(titles)} #${1000 + i}`,
  client_name: randomFrom(clients),
  status: randomFrom(statuses),
  assigned_to: randomFrom(assignees),
  opened_on: new Date(Date.now() - i * 2 * 86_400_000).toISOString(),
}))
