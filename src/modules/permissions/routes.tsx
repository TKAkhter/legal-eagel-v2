import type { RouteObject } from 'react-router-dom'

export const permissionsRoutes: RouteObject[] = [
  {
    path: 'permissions',
    lazy: async () => {
      const { PermissionsPage } = await import('./components/PermissionsPage')
      return { Component: PermissionsPage }
    },
  },
]
