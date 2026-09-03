import type { RouteObject } from 'react-router-dom'

export const mattersRoutes: RouteObject[] = [
  {
    path: 'matters',
    lazy: async () => {
      const { MattersListPage } = await import('./components/MattersListPage')
      return { Component: MattersListPage }
    },
  },
  {
    path: 'matters/:id',
    lazy: async () => {
      const { MatterDetailPage } = await import('./components/MatterDetailPage')
      return { Component: MatterDetailPage }
    },
  },
]
