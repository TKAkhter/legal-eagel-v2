import type { RouteObject } from 'react-router-dom'

export const billingsRoutes: RouteObject[] = [
  {
    path: 'billings',
    lazy: async () => {
      const { BillingsListPage } = await import('./components/BillingsListPage')
      return { Component: BillingsListPage }
    },
  },
  {
    path: 'billings/:id',
    lazy: async () => {
      const { InvoiceDetailPage } = await import('./components/InvoiceDetailPage')
      return { Component: InvoiceDetailPage }
    },
  },
]
