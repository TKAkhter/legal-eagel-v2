export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue'

export interface Invoice {
  id: string
  invoiceNumber: string
  clientName: string
  amount: number
  status: InvoiceStatus
  dueDate: string
}

export interface InvoiceRaw {
  id: string
  invoice_number: string
  client_name: string
  amount_cents: number
  status: InvoiceStatus
  due_date: string
}
