import type { GroupRaw } from '../types/group'

const names = ['Litigation Team', 'Corporate Team', 'Billing Team', 'IP Team', 'Support Staff', 'Partners']

export const groupsMockData: GroupRaw[] = names.map((name, i) => ({
  id: `group-${i + 1}`,
  group_name: name,
  member_count: 3 + Math.floor(Math.random() * 12),
  created_on: new Date(Date.now() - i * 30 * 86_400_000).toISOString(),
}))
