import type { RouteObject } from 'react-router-dom'

export const clientsRoutes: RouteObject[] = [
  {
    path: 'clients',
    lazy: async () => {
      const { ClientsListPage } = await import('./components/ClientsListPage')
      return { Component: ClientsListPage }
    },
  },
  {
    path: 'clients/:id',
    lazy: async () => {
      const { ClientDetailPage } = await import('./components/ClientDetailPage')
      return { Component: ClientDetailPage }
    },
  },
]
