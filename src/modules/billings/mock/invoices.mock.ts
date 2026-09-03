import type { InvoiceRaw } from '../types/invoice'

const clients = ['Acme Corp', 'Globex', 'Initech', 'Umbrella Inc', 'Soylent', 'Hooli']
const statuses: InvoiceRaw['status'][] = ['draft', 'sent', 'paid', 'overdue']

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export const invoicesMockData: InvoiceRaw[] = Array.from({ length: 41 }, (_, i) => ({
  id: `invoice-${i + 1}`,
  invoice_number: `INV-${2000 + i}`,
  client_name: randomFrom(clients),
  amount_cents: (500 + Math.floor(Math.random() * 9500)) * 100,
  status: randomFrom(statuses),
  due_date: new Date(Date.now() + (i - 20) * 86_400_000).toISOString(),
}))
