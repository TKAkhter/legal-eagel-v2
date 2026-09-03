import { createResourceClient } from '@/lib/api-client/create-resource-client'
import { invoicesMockData } from '../mock/invoices.mock'
import type { Invoice, InvoiceRaw } from '../types/invoice'

export const invoicesApi = createResourceClient<InvoiceRaw, Invoice>({
  resource: '/billings',
  mockData: invoicesMockData,
  transform: (raw) => ({
    id: raw.id,
    invoiceNumber: raw.invoice_number,
    clientName: raw.client_name,
    amount: raw.amount_cents / 100,
    status: raw.status,
    dueDate: raw.due_date,
  }),
  toRaw: (partial) => ({
    ...(partial.invoiceNumber !== undefined && { invoice_number: partial.invoiceNumber }),
    ...(partial.clientName !== undefined && { client_name: partial.clientName }),
    ...(partial.amount !== undefined && { amount_cents: Math.round(partial.amount * 100) }),
    ...(partial.status !== undefined && { status: partial.status }),
    ...(partial.dueDate !== undefined && { due_date: partial.dueDate }),
  }),
})
