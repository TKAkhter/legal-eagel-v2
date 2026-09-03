import type { ReportRaw } from '../types/report'

const names = ['Monthly Revenue', 'Client Retention', 'Matter Throughput', 'Overdue Invoices', 'Team Utilization']
const types: ReportRaw['report_type'][] = ['financial', 'operational', 'client']
const authors = ['Amina Haddad', 'Omar Siddiqui']

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export const reportsMockData: ReportRaw[] = Array.from({ length: 18 }, (_, i) => ({
  id: `report-${i + 1}`,
  report_name: `${randomFrom(names)} — ${new Date(Date.now() - i * 7 * 86_400_000).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`,
  report_type: randomFrom(types),
  generated_by: randomFrom(authors),
  generated_on: new Date(Date.now() - i * 7 * 86_400_000).toISOString(),
}))
