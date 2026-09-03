import type { RouteObject } from 'react-router-dom'

export const reportingsRoutes: RouteObject[] = [
  {
    path: 'reportings',
    lazy: async () => {
      const { ReportingsListPage } = await import('./components/ReportingsListPage')
      return { Component: ReportingsListPage }
    },
  },
]
