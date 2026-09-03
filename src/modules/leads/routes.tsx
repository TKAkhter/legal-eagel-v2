import type { RouteObject } from 'react-router-dom'

export const leadsRoutes: RouteObject[] = [
  {
    path: 'leads',
    lazy: async () => {
      const { LeadsListPage } = await import('./components/LeadsListPage')
      return { Component: LeadsListPage }
    },
  },
  {
    path: 'leads/:id',
    lazy: async () => {
      const { LeadDetailPage } = await import('./components/LeadDetailPage')
      return { Component: LeadDetailPage }
    },
  },
]
